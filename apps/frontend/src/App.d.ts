export type FlowState = {
  currentTx: Record<string, unknown> | null;
  currentRisk: { action: string; risk: string; reason: string } | null;
  needsConfirm: boolean;
  confirmed: boolean;
  auditRows: Array<Record<string, unknown>>;
};

export declare class FrontendFlow {
  state: FlowState;

  constructor(deps: {
    precheckApi: (payload: Record<string, unknown>) => Promise<{ action: string; risk: string; reason: string }>;
    executeApi: (payload: Record<string, unknown>) => Promise<{ status: string; [k: string]: unknown }>;
    auditApi: () => Promise<{ items?: Array<Record<string, unknown>> }>;
  });

  submitTx(payload: Record<string, unknown>): Promise<{ action: string; risk: string; reason: string }>;
  confirmReview(): void;
  executeCurrent(): Promise<{ status: string; reason?: string; [k: string]: unknown }>;
  loadAuditRows(): Promise<Array<Record<string, unknown>>>;
}
