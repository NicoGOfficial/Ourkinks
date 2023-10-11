import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { TextTranslationService } from '../services';

@Controller('/i18n/text')
export class TextTranslationController {
  constructor(private readonly textTranslationService: TextTranslationService) { }

  @Get('/:locale')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getAllByLocale(
    @Param('locale') locale: string
  ): Promise<any> {
    const results = await this.textTranslationService.getAllByLocale(locale);
    if (locale !== 'en') {
      const localeEn = await this.textTranslationService.getAllByLocale('en');
      return Object.keys(localeEn).reduce((res, key) => {
        res[key] = results[key] || localeEn[key];
        return res;
      }, {} as any);
    }
    return results;
  }
}
