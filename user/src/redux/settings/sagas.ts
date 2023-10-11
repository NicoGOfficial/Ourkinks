import { createSagas } from '@lib/redux';
import { utilsService } from '@services/index';
import { flatten } from 'lodash';
import { put } from 'redux-saga/effects';

import {
  requestCurrency, updateSettings
} from './actions';

const settingSagas = [
  {
    on: requestCurrency,
    * worker() {
      try {
        const resp = yield utilsService.currencyRate();
        yield put(updateSettings({
          currency: resp.data
        }));
      // eslint-disable-next-line no-empty
      } catch {}
    }
  }
];

export default flatten([createSagas(settingSagas)]);
