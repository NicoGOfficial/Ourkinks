import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongoDBModule } from 'src/kernel';
import {
  CountryService, LanguageService, PhoneCodeService, UserAdditionalInfoService,
  StateService, CityService, CurrencyConversionService
} from './services';
import {
  CountryController, LanguageController, PhoneCodeController, UserAdditionalInfoController,
  StateController, CityController, CurrencyConversionController
} from './controllers';
import { currencyConversionProviders } from './providers/currency-conversion.provider';
import { ipCountryProviders } from './providers/ip-country.provider';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5
    }),
    MongoDBModule
  ],
  providers: [
    ...currencyConversionProviders,
    ...ipCountryProviders,
    CountryService,
    StateService,
    CityService,
    LanguageService,
    PhoneCodeService,
    UserAdditionalInfoService,
    CurrencyConversionService
  ],
  controllers: [
    CountryController,
    LanguageController,
    PhoneCodeController,
    UserAdditionalInfoController,
    StateController,
    CityController,
    CurrencyConversionController
  ],
  exports: [CountryService, LanguageService, PhoneCodeService]
})
export class UtilsModule { }
