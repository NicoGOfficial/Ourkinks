/* eslint-disable linebreak-style */
/* eslint-disable indent */
import { APIRequest } from './api-request';

export class WalletPackageService extends APIRequest {
  create(payload) {
    return this.post('/admin/wallet-package', payload);
  }

  search(query) {
    return this.get(this.buildUrl('/admin/wallet-package', query as any));
  }

  findById(id: string) {
    return this.get(`/admin/wallet-package/${id}/view`);
  }

  update(id: string, payload) {
    return this.put(`/admin/wallet-package/${id}`, payload);
  }

  delete(id: string) {
    return this.del(`/admin/wallet-package/${id}`);
  }
}

export const walletPackageService = new WalletPackageService();
