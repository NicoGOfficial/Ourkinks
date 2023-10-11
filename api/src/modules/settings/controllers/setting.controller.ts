import {
  Controller,
  Injectable,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Get,
  Post,
  Param,
  Body,
  HttpException,
  Query
} from '@nestjs/common';
import { DataResponse } from 'src/kernel';
import { ModelTranslationService } from 'src/modules/i18n/services';
import { SettingService } from '../services';

@Injectable()
@Controller('settings')
export class SettingController {
  constructor(
    private readonly settingService: SettingService,
    private readonly modelTranslationService: ModelTranslationService
  ) { }

  @Get('/public')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getPublicSettings(
    @Query('locale') locale: string
  ): Promise<DataResponse<Record<string, any>>> {
    const data = await this.settingService.getAutoloadPublicSettingsForUser();

    if (locale) {
      const translations = await this.modelTranslationService.getSettingsTranslation(locale);
      translations.forEach((translation: any) => {
        const obj = translation.toObject();
        data[obj.key] = obj.value;
      });

      // overwrite menu
      const menus = await this.settingService.getPublicMenus();
      if (menus.length) {
        const menuIds = menus.map((m) => m._id);
        const menuTrans = await this.modelTranslationService.getListByIds({
          locale,
          sourceIds: menuIds
        });
        (data.menus || []).forEach((menu) => {
          const found = menuTrans.find((m) => m.sourceId.toString() === menu._id.toString());
          if (found) {
            const obj = found.toObject() as any;
            // eslint-disable-next-line no-param-reassign
            menu.title = obj.title || obj.value || obj.title;
          }
        });
      }
    }

    return DataResponse.ok(data);
  }

  @Get('/keys/:key')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getPublicValueByKey(
    @Param('key') key: string,
    @Query('locale') locale: string
  ): Promise<DataResponse<Record<string, any>>> {
    const data = await this.settingService.getPublicValueByKey(key);
    if (locale) {
      const translations = await this.modelTranslationService.getSettingsKeysTranslation(locale, [key]);
      translations.forEach((translation: any) => {
        const obj = translation.toObject();
        data[obj.key] = obj.value;
      });
    }
    return DataResponse.ok(data);
  }

  @Post('/keys')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getPublicValueByKeys(
    @Body('keys') keys: string[],
    @Query('locale') locale: string
  ): Promise<DataResponse<Record<string, any>>> {
    if (!Array.isArray(keys)) return null;
    const data = await this.settingService.getPublicValueByKeys(keys);
    if (locale) {
      const translations = await this.modelTranslationService.getSettingsKeysTranslation(locale, keys);
      translations.forEach((translation: any) => {
        const obj = translation.toObject();
        data[obj.key] = obj.value;
      });
    }
    return DataResponse.ok(data);
  }

  @Get('/public/:key')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getPublicSettingByKey(
    @Param('key') key: string,
    @Query('locale') locale: string
  ): Promise<DataResponse<any>> {
    const data = SettingService.getByKey(key);
    if (!data.public || !data.visible) {
      throw new HttpException('Error', 400);
    }
    if (locale) {
      const translations = await this.modelTranslationService.getSettingsKeysTranslation(locale, [key]);
      translations.forEach((translation: any) => {
        const obj = translation.toObject();
        data[obj.key] = obj.value;
      });
    }
    return DataResponse.ok({
      value: data.value
    });
  }
}
