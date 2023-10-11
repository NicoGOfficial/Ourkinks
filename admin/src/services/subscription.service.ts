import { APIRequest } from './api-request';

class SubscriptionService extends APIRequest {
  search(query?: { [key: string]: any }) {
    return this.get(this.buildUrl('/admin/subscriptions/search', query));
  }

  create(payload: any) {
    return this.post('/admin/subscriptions', payload);
  }

  update(id: string, payload: any) {
    return this.put(`/admin/subscriptions/${id}`, payload);
  }

  delete(id: string) {
    return this.del(`/admin/subscriptions/${id}`);
  }

  cancelSubscription(id: string) {
    return this.post(`/admin/subscriptions/${id}/cancel`);
  }
}
export const subscriptionService = new SubscriptionService();
