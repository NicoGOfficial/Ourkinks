import { APIRequest } from './api-request';

export class I18nService extends APIRequest {
  createTextTranslation(payload: any) {
    return this.post('/admin/i18n/text', payload);
  }

  importTextTranslation(payload) {
    return this.post('/admin/i18n/text/generate', payload);
  }

  search(query?: { [key: string]: any }) {
    return this.get(this.buildUrl('/admin/i18n/text', query));
  }

  update(id: string, payload: any) {
    return this.put(`/admin/i18n/text/${id}`, payload);
  }

  delete(id: string) {
    return this.del(`/admin/i18n/text/${id}`);
  }

  locales() {
    return this.get('/languages/list');
  }

  createModelTranslation(data) {
    return this.post('/admin/i18n/translations', data);
  }

  updateModelTranslaiton(id, data) {
    return this.put(`/admin/i18n/translations/${id}`, data);
  }

  deleteModelTranslaiton(id) {
    return this.del(`/admin/i18n/translations/${id}`);
  }

  searchModelTranslaiton(query) {
    return this.get(this.buildUrl('/admin/i18n/translations', query));
  }

  getTranslationByLocale(itemId, locale) {
    return this.get(`/admin/i18n/translations/sources/${itemId}/${locale}`);
  }

  getSettingsTranslation(group, locale) {
    return this.get(`/admin/i18n/translations/settings/${group}/locales/${locale}`);
  }

  updateSettingsTranslation(locale, key, value) {
    return this.put(`/admin/i18n/translations/settings/${key}/locales/${locale}`, {
      value
    });
  }
}

export const i18nService = new I18nService();
