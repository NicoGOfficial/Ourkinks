import cookie from 'js-cookie';
import getConfig from 'next/config';
import { ISetting } from 'src/interfaces';

import { APIRequest, IResponse } from './api-request';

export class SettingService extends APIRequest {
  public(): Promise<IResponse<ISetting>> {
    return this.get(this.buildUrl('/settings/public'));
  }

  all(group = ''): Promise<IResponse<ISetting>> {
    return this.get(this.buildUrl('/admin/settings', { group }));
  }

  update(key: string, value: any) {
    return this.put(`/admin/settings/${key}`, { value });
  }

  getFileUploadUrl() {
    const { publicRuntimeConfig: config } = getConfig();
    return `${config.API_ENDPOINT}/admin/settings/files/upload`;
  }

  verifyMailer() {
    return this.post('/mailer/verify');
  }

  uploadFile(formData: FormData) {
    const baseApiEndpoint = this.getBaseApiEndpoint();
    const token = APIRequest.token || cookie.get('token') || undefined;

    return fetch(`${baseApiEndpoint}/admin/settings/files/upload`, {
      method: 'POST',
      headers: {
        Authorization: token || ''
      },
      body: formData
    })
      .then((response) => {
        if (response.status >= 200 && response.status < 300) {
          return response;
        }
        throw response.clone().json();
      })
      .then((response) => {
        if (response.status === 204 || response.status === 205) {
          return null;
        }
        return response.json();
      });
  }
}

export const settingService = new SettingService();
