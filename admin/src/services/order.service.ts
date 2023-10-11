// import { IGalleryCreate } from 'src/interfaces';
import { APIRequest } from './api-request';

export class OrderService extends APIRequest {
  search(payload) {
    return this.get(this.buildUrl('/admin/orders/search', payload));
  }

  detailsSearch(payload) {
    return this.get(this.buildUrl('/admin/orders/details/search', payload));
  }

  productsSearch(payload) {
    return this.get(this.buildUrl('/admin/orders/products/search', payload));
  }

  usePaymentGatewaySearch(payload) {
    return this.get(this.buildUrl('/admin/orders/details/use-payment-gateway/search', payload));
  }

  findById(id) {
    return this.get(`/admin/orders/${id}`);
  }

  findDetailsById(id) {
    return this.get(`/admin/orders/details/${id}`);
  }

  update(id, data) {
    return this.put(`/admin/orders/${id}/update`, data);
  }
}

export const orderService = new OrderService();
