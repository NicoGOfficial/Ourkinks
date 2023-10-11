import { Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import { SETTING_KEYS } from 'src/modules/settings/constants';
import { Model } from 'mongoose';
import * as moment from 'moment';
import { SettingService } from 'src/modules/settings';
import { CURRENCY_CONVERSION_DB_PROVIDER } from '../providers/currency-conversion.provider';
import { CurrencyConversionModel } from '../models/currency-conversion.model';
import { COUNTRY_CURRENCY } from '../constants';

@Injectable()
export class CurrencyConversionService {
  constructor(
    @Inject(CURRENCY_CONVERSION_DB_PROVIDER)
    private readonly CurrencyConversion: Model<CurrencyConversionModel>
  ) { }

  public async getRate(toCurrency: string): Promise<any> {
    const from = `${SettingService.getValueByKey(SETTING_KEYS.CURRENCY_CONVERSTION_BASE_CURRENCY) || 'USD'}`.toUpperCase();
    const to = toCurrency.toUpperCase();
    try {
      const item = await this.CurrencyConversion.findOne({
        from,
        to
      });

      let rate = 1;
      if (!item || moment(item.updatedAt).add(12, 'hours').isBefore(new Date())) {
        const uri = new URL(SettingService.getValueByKey(SETTING_KEYS.CURRENCY_CONVERSTION_API_ENDPOINT) || 'https://free.currconv.com/api/v7/convert');
        const q = `${from}_${to}`;
        uri.searchParams.append('q', q);
        uri.searchParams.append('compact', 'ultra');
        uri.searchParams.append('apiKey', SettingService.getValueByKey(SETTING_KEYS.CURRENCY_CONVERSTION_API_KEY));
        const response = await axios.get(uri.href);
        const { data } = response;
        rate = data[`${from}_${to}`];
        if (!item) {
          await this.CurrencyConversion.create({
            from,
            to,
            rate,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        } else {
          await this.CurrencyConversion.updateOne({ _id: item._id }, {
            $set: {
              from,
              to,
              rate,
              updatedAt: new Date()
            }
          });
        }
      } else if (item) {
        rate = item.rate;
      }

      return {
        from,
        to,
        rate
      };
    } catch (e) {
      return {
        from,
        to,
        rate: 1
      };
    }
  }

  public static getCurrencyCodeByCountryCode(countryCode: string) {
    return COUNTRY_CURRENCY[countryCode];
  }
}
