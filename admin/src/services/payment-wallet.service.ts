/* eslint-disable linebreak-style */
/* eslint-disable indent */
import { APIRequest } from './api-request';

export class PaymentWalletPackageService extends APIRequest {
  search(query) {
    return this.get(this.buildUrl('/admin/wallet-transactions/search', query));
  }
}

export const paymentWalletPackageService = new PaymentWalletPackageService();
