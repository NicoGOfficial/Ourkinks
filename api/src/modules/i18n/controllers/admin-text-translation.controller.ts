import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { DataResponse, PageableData } from 'src/kernel';
import { Roles } from 'src/modules/auth';
import { RoleGuard } from 'src/modules/auth/guards';
import { TextTranslationDto } from '../dtos/text-translation.dto';
import { TextTranslationPayload, TextTranslationSearchPayload } from '../payloads';
import { TextTranslationService } from '../services';

@Controller('/admin/i18n/text')
export class AdminTextTranslationController {
  constructor(private readonly textTranslationService: TextTranslationService) { }

  @Get('/')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @Roles('admin')
  async search(
    @Query() payload: TextTranslationSearchPayload
  ): Promise<DataResponse<PageableData<TextTranslationDto>>> {
    const results = await this.textTranslationService.search(payload);
    return DataResponse.ok(results);
  }

  @Post('/')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(
    @Body() payload: TextTranslationPayload
  ): Promise<DataResponse<TextTranslationDto>> {
    const result = await this.textTranslationService.create(payload);
    return DataResponse.ok(result);
  }

  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(
    @Param('id') id: string,
    @Body() payload: TextTranslationPayload
  ): Promise<DataResponse<TextTranslationDto>> {
    const result = await this.textTranslationService.update(id, payload);
    return DataResponse.ok(result);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async delete(@Param('id') id: string) {
    await this.textTranslationService.delete(id);
    return DataResponse.ok({ success: true });
  }

  @Post('/generate')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateLanguage(
    @Body() payload: any
  ) {
    const result = await this.textTranslationService.generateLanguage(payload);

    return DataResponse.ok(result);
  }
}
