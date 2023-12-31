import { createSagas } from '@lib/redux';
import { bannerService } from '@services/index';
import { flatten } from 'lodash';
import { put } from 'redux-saga/effects';
import { IReduxAction } from 'src/interfaces';

import { getBanners, getBannersFail, getBannersSuccess } from './actions';

const bannerSagas = [
  {
    on: getBanners,
    * worker(data: IReduxAction<any>) {
      try {
        const resp = yield bannerService.search(data.payload);
        yield put(getBannersSuccess(resp.data));
      } catch (e) {
        const error = yield Promise.resolve(e);
        yield put(getBannersFail(error));
      }
    }
  }
];

export default flatten([createSagas(bannerSagas)]);
