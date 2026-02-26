export class FrontendFlow {
  constructor({ precheckApi, executeApi, auditApi }) {
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

  async submitTx(payload) {
    this.state.currentTx = payload;
    const risk = await this.precheckApi(payload);
    this.state.currentRisk = risk;
    this.state.needsConfirm = risk.action === 'review';
    this.state.confirmed = false;
    return risk;
  }

  confirmReview() {
    if (this.state.needsConfirm) {
      this.state.confirmed = true;
    }
  }

  async executeCurrent() {
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

  async loadAuditRows() {
    const data = await this.auditApi();
    this.state.auditRows = data.items ?? [];
    return this.state.auditRows;
  }
}
