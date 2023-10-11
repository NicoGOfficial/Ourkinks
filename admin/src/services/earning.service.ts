import { IEarningSearch, IUpdatePaidStatus } from 'src/interfaces';

import { APIRequest } from './api-request';

export class EarningService extends APIRequest {
  search(query: IEarningSearch) {
    return this.get(this.buildUrl('/admin/earning/search', query as any));
  }

  stats(query: IEarningSearch) {
    return this.get(this.buildUrl('/admin/earning/stats', query as any));
  }

  updatePaidStatus(data: IUpdatePaidStatus) {
    return this.post('/admin/earning/update-status', data);
  }

  findById(id: string) {
    return this.get(`/admin/earning/${id}`);
  }
}

export const earningService = new EarningService();
