export type RiskResult = {
  action: string;
  risk: string;
  reason: string;
};

export type ExecuteResult = {
  status: string;
  reason?: string;
  [k: string]: unknown;
};

export type FlowState = {
  currentTx: Record<string, unknown> | null;
  currentRisk: RiskResult | null;
  needsConfirm: boolean;
  confirmed: boolean;
  auditRows: Array<Record<string, unknown>>;
};

type FrontendDeps = {
  precheckApi: (payload: Record<string, unknown>) => Promise<RiskResult>;
  executeApi: (payload: Record<string, unknown>) => Promise<ExecuteResult>;
  auditApi: () => Promise<{ items?: Array<Record<string, unknown>> }>;
};

export class FrontendFlow {
  precheckApi: FrontendDeps['precheckApi'];
  executeApi: FrontendDeps['executeApi'];
  auditApi: FrontendDeps['auditApi'];
  state: FlowState;

  constructor({ precheckApi, executeApi, auditApi }: FrontendDeps) {
    this.precheckApi = precheckApi;
    this.executeApi = executeApi;
    this.auditApi = auditApi;
    this.state = {
      currentTx: null,
      currentRisk: null,
      needsConfirm: false,
      confirmed: false,
      auditRows: []
    };
  }

  async submitTx(payload: Record<string, unknown>): Promise<RiskResult> {
    this.state.currentTx = payload;
    const risk = await this.precheckApi(payload);
    this.state.currentRisk = risk;
    this.state.needsConfirm = risk.action === 'review';
    this.state.confirmed = false;
    return risk;
  }

  confirmReview(): void {
    if (this.state.needsConfirm) {
      this.state.confirmed = true;
    }
  }

  async executeCurrent(): Promise<ExecuteResult> {
    if (!this.state.currentTx || !this.state.currentRisk) {
      return { status: 'blocked', reason: 'noCurrentTx' };
    }

    if (this.state.currentRisk.action === 'review' && !this.state.confirmed) {
      return { status: 'blocked', reason: 'reviewNotConfirmed' };
    }

    return this.executeApi({
      ...this.state.currentTx,
      action: this.state.currentRisk.action,
      approved: this.state.confirmed || !this.state.needsConfirm
    });
  }

  async loadAuditRows(): Promise<Array<Record<string, unknown>>> {
    const data = await this.auditApi();
    this.state.auditRows = data.items ?? [];
    return this.state.auditRows;
  }
}
