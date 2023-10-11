import { APIRequest } from './api-request';

class PayoutRequestService extends APIRequest {
  calculate(payload: any) {
    return this.post('/admin/payout-requests/calculate', payload);
  }

  stats(payload: { sourceId?: string }) {
    return this.post('/admin/payout-requests/stats', payload);
  }

  statsAll() {
    return this.post('/admin/payout-requests/stats-all');
  }

  search(query: { [key: string]: any }) {
    return this.get(this.buildUrl('/admin/payout-requests/search', query));
  }

  update(id: string, body: any) {
    return this.post(`/admin/payout-requests/${id}/status`, body);
  }

  detail(
    id: string
  ): Promise<any> {
    return this.get(`/admin/payout-requests/${id}/details`);
  }
}

export const payoutRequestService = new PayoutRequestService();
