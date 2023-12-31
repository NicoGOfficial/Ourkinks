import { createSagas } from '@lib/redux';
import { videoService } from '@services/index';
import { flatten } from 'lodash';
import { put } from 'redux-saga/effects';
import { IReduxAction } from 'src/interfaces';

import {
  getRelated, getRelatedFail,
  getRelatedSuccess, getVideos, getVideosFail, getVideosSuccess,
  getVods, getVodsFail, getVodsSuccess,
  moreVideo, moreVideoFail, moreVideoSuccess,
  moreVod, moreVodFail,
  moreVodSuccess
} from './actions';

const videoSagas = [
  {
    on: getVideos,
    * worker(data: IReduxAction<any>) {
      try {
        const resp = yield videoService.userSearch(data.payload);
        yield put(getVideosSuccess(resp.data));
      } catch (e) {
        const error = yield Promise.resolve(e);
        yield put(getVideosFail(error));
      }
    }
  },
  {
    on: moreVideo,
    * worker(data: IReduxAction<any>) {
      try {
        const resp = yield videoService.userSearch(data.payload);
        yield put(moreVideoSuccess(resp.data));
      } catch (e) {
        const error = yield Promise.resolve(e);
        yield put(moreVideoFail(error));
      }
    }
  },
  {
    on: getVods,
    * worker(data: IReduxAction<any>) {
      try {
        const resp = yield videoService.userSearch(data.payload);
        yield put(getVodsSuccess(resp.data));
      } catch (e) {
        const error = yield Promise.resolve(e);
        yield put(getVodsFail(error));
      }
    }
  },
  {
    on: moreVod,
    * worker(data: IReduxAction<any>) {
      try {
        const resp = yield videoService.userSearch(data.payload);
        yield put(moreVodSuccess(resp.data));
      } catch (e) {
        const error = yield Promise.resolve(e);
        yield put(moreVodFail(error));
      }
    }
  },
  {
    on: getRelated,
    * worker(data: IReduxAction<any>) {
      try {
        const resp = yield videoService.userSearch(data.payload);
        yield put(getRelatedSuccess(resp.data));
      } catch (e) {
        const error = yield Promise.resolve(e);
        yield put(getRelatedFail(error));
      }
    }
  }
];

export default flatten([createSagas(videoSagas)]);
