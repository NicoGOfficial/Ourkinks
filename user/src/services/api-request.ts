import { isUrl } from '@lib/string';
import fetch from 'isomorphic-unfetch';
import cookie from 'js-cookie';
import getConfig from 'next/config';
import Router from 'next/router';

export interface IResponse<T> {
  status: number;
  data: T;
}

export const TOKEN = 'token';

export abstract class APIRequest {
  static token: string = '';

  static API_ENDPOINT: string = null;

  static locale: string = '';

  setAuthHeaderToken(token: string) {
    APIRequest.token = token;
  }

  /**
   * Parses the JSON returned by a network request
   *
   * @param  {object} response A response from a network request
   *
   * @return {object}          The parsed JSON from the request
   */
  private parseJSON(response: Response) {
    if (response.status === 204 || response.status === 205) {
      return null;
    }
    return response.json();
  }

  /**
   * Checks if a network request came back fine, and throws an error if not
   *
   * @param  {object} response   A response from a network request
   *
   * @return {object|undefined} Returns either the response, or throws an error
   */
  private checkStatus(response: Response) {
    if (response.status >= 200 && response.status < 300) {
      return response;
    }

    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        Router.push('/login');
      }

      throw new Error('Forbidden in the action!');
    }

    // const error = new Error(response.statusText) as any;
    // error.response = response;
    // throw error;
    throw response.clone().json();
  }

  getBaseApiEndpoint() {
    const { API_ENDPOINT } = APIRequest;
    if (API_ENDPOINT) return API_ENDPOINT;

    const { publicRuntimeConfig } = getConfig();
    return publicRuntimeConfig.API_ENDPOINT;
  }

  buildUrl(baseUrl: string, params?: { [key: string]: any }) {
    if (!params) {
      return baseUrl;
    }

    const queryString = Object.keys(params)
      .map((k) => {
        if (Array.isArray(params[k])) {
          return params[k].map((param) => `${encodeURIComponent(k)}=${encodeURIComponent(param)}`)
            .join('&');
        }
        return `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`;
      })
      .join('&');
    return `${baseUrl}?${queryString}`;
  }

  request(
    url: string,
    method?: string,
    body?: any,
    headers?: { [key: string]: string }
  ): Promise<IResponse<any>> {
    const verb = (method || 'get').toUpperCase();
    const updatedHeader = {
      'Content-Type': 'application/json',
      // TODO - check me
      Authorization: APIRequest.token || cookie.get(TOKEN) || null,
      ...headers || {}
    };
    const baseApiEndpoint = this.getBaseApiEndpoint();
    const locale: any = APIRequest.locale || cookie.get('locale');
    const newUrl = url.indexOf('?') > -1 ? `${baseApiEndpoint}${url}&locale=${locale}` : `${baseApiEndpoint}${url}?locale=${locale}`;
    return fetch(isUrl(url) ? url : newUrl, {
      method: verb,
      headers: updatedHeader,
      body: body ? JSON.stringify(body) : null
    })
      .then(this.checkStatus)
      .then(this.parseJSON);
  }

  get(url: string, headers?: { [key: string]: string }) {
    return this.request(url, 'get', null, headers);
  }

  post(url: string, data?: any, headers?: { [key: string]: string }) {
    return this.request(url, 'post', data, headers);
  }

  put(url: string, data?: any, headers?: { [key: string]: string }) {
    return this.request(url, 'put', data, headers);
  }

  del(url: string, data?: any, headers?: { [key: string]: string }) {
    return this.request(url, 'delete', data, headers);
  }

  upload(
    url: string,
    files: {
      file: File;
      fieldname: string;
    }[],
    options: {
      onProgress: Function;
      customData?: Record<any, any>;
      method?: string;
    } = {
      onProgress() { },
      method: 'POST'
    }
  ) {
    const baseApiEndpoint = this.getBaseApiEndpoint();
    const uploadUrl = isUrl(url) ? url : `${baseApiEndpoint}${url}`;
    return new Promise((resolve, reject) => {
      const req = new XMLHttpRequest();

      req.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          options.onProgress({
            percentage: (event.loaded / event.total) * 100
          });
        }
      });

      req.addEventListener('load', () => {
        const success = req.status >= 200 && req.status < 300;
        const { response } = req;
        if (!success) {
          return reject(response);
        }
        return resolve(response);
      });

      req.upload.addEventListener('error', () => {
        reject(req.response);
      });

      const formData = new FormData();
      files.forEach((f) => formData.append(f.fieldname, f.file, f.file.name));
      options.customData
        && Object.keys(options.customData).forEach(
          (fieldname) => {
            if (typeof options.customData[fieldname] !== 'undefined' && !Array.isArray(options.customData[fieldname])) formData.append(fieldname, options.customData[fieldname]);
            if (typeof options.customData[fieldname] !== 'undefined' && Array.isArray(options.customData[fieldname])) {
              if (options.customData[fieldname].length) {
                for (let i = 0; i < options.customData[fieldname].length; i += 1) {
                  formData.append(fieldname, options.customData[fieldname][i]);
                }
              }
            }
          }
        );

      req.responseType = 'json';
      req.open(options.method || 'POST', uploadUrl);

      let token: any = APIRequest.token || cookie.get(TOKEN);
      if (!token) {
        token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN) : '';
      }
      if (token) {
        req.setRequestHeader('Authorization', token);
      }
      req.send(formData);
    });
  }
}
