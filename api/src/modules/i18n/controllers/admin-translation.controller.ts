import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Delete,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Query,
  Param,
  HttpException
} from '@nestjs/common';
import { DataResponse } from 'src/kernel';
import { Roles } from 'src/modules/auth/decorators';
import { RoleGuard } from 'src/modules/auth/guards';
import { SettingService } from 'src/modules/settings';
import { SettingUpdatePayload } from 'src/modules/settings/payloads';
import { TranslationCreatePayload, TranslationSearchPayload, TranslationUpdatePayload } from '../payloads';
import { ModelTranslationService } from '../services';

@Controller('/admin/i18n/translations')
export class AdminTranslationController {
  constructor(private readonly translationService: ModelTranslationService) {}

  @Post('/')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() payload: TranslationCreatePayload
  ): Promise<DataResponse<any>> {
    const result = await this.translationService.create(payload);
    return DataResponse.ok(result);
  }

  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id') id: string,
    @Body() payload: TranslationUpdatePayload
  ) {
    await this.translationService.update(id, payload);
    const result = await this.translationService.findById(id);
    return DataResponse.ok(result);
  }

  @Get('/')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async search(@Query() payload: TranslationSearchPayload) {
    const result = await this.translationService.search(payload);
    return DataResponse.ok(result);
  }

  @Get('/sources/:sourceId/:locale')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  async getByItemId(
    @Param('sourceId') sourceId: string,
    @Param('locale') locale: string
  ) {
    const result = await this.translationService.getByItemAndLanguage(sourceId, locale);
    return DataResponse.ok(result);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async delete(@Param('id') id: string) {
    await this.translationService.delete(id);
    return DataResponse.ok();
  }

  @Get('/settings/:group/locales/:locale')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getSettingTranslation(
    @Param('group') group: string,
    @Param('locale') locale: string
  ) {
    const result = await this.translationService.getSettingsTranslation(locale, group);
    return DataResponse.ok(result);
  }

  @Put('/settings/:key/locales/:locale')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateSettingTranslation(
    @Param('key') key: string,
    @Param('locale') locale: string,
    @Body() payload: SettingUpdatePayload
  ) {
    const setting = SettingService.getByKey(key);
    if (!setting) throw new HttpException('Missing setting key!', 400);
    const result = await this.translationService.updateSettingTranslation({
      locale,
      key,
      value: payload.value,
      group: setting.group
    });
    return DataResponse.ok(result);
  }
}
