import { APIRequest } from './api-request';

export class CouponService extends APIRequest {
  create(payload: any) {
    return this.post('/admin/coupons', payload);
  }

  search(query?: { [key: string]: any }) {
    return this.get(this.buildUrl('/admin/coupons/search', query));
  }

  findByIdOrCode(id: string) {
    return this.get(`/admin/coupons/${id}/view`);
  }

  update(id: string, payload: any) {
    return this.put(`/admin/coupons/${id}`, payload);
  }

  delete(id: string) {
    return this.del(`/admin/coupons/${id}`);
  }
}

export const couponService = new CouponService();
