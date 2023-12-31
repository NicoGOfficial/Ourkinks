import { createReducers } from '@lib/redux';
import { merge } from 'lodash';

import { getBanners, getBannersFail, getBannersSuccess } from './actions';

const initialState = {
  listBanners: {
    loading: false,
    data: null,
    error: null,
    success: false
  }
};

const bannerReducer = [
  {
    on: getBanners,
    reducer(state: any) {
      return {
        ...state,
        listBanners: {
          loading: true,
          data: null,
          error: null,
          success: false
        }
      };
    }
  },
  {
    on: getBannersSuccess,
    reducer(state: any, data: any) {
      return {
        ...state,
        listBanners: {
          loading: false,
          data: data.payload,
          error: null,
          success: true
        }
      };
    }
  },
  {
    on: getBannersFail,
    reducer(state: any, data: any) {
      return {
        ...state,
        listBanners: {
          loading: false,
          data: null,
          error: data.payload,
          success: false
        }
      };
    }
  }
];

export default merge(
  {},
  createReducers('banner', [bannerReducer], initialState)
);
