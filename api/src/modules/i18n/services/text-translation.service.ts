import { Inject, Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { EntityNotFoundException, PageableData } from 'src/kernel';
import { merge } from 'lodash';
import { TEXT_TRANSLATION_SCHEMA_PROVIDER } from '../providers';
import { TextTranslationModel } from '../models';
import { TextTranslationDto } from '../dtos';
import { TextTranslationPayload, TextTranslationSearchPayload } from '../payloads';

@Injectable()
export class TextTranslationService {
  constructor(
    @Inject(TEXT_TRANSLATION_SCHEMA_PROVIDER)
    private readonly LanguageSettingModel: Model<TextTranslationModel>
  ) { }

  async findById(id: string | ObjectId) {
    return this.LanguageSettingModel.findById(id);
  }

  async findByIdAttribute(query: any) {
    return this.LanguageSettingModel.findById(query);
  }

  async findByKey(key: string, locale: string) {
    return this.LanguageSettingModel.findOne({ key, locale });
  }

  async create(data: TextTranslationPayload): Promise<TextTranslationDto> {
    let language = await this.LanguageSettingModel.findOne({
      key: data.key,
      locale: data.locale
    });
    if (!language) {
      language = new this.LanguageSettingModel();
    }

    merge(language, data);
    await language.save();
    const dto = new TextTranslationDto(language);
    return dto;
  }

  async update(id: string | ObjectId, data: TextTranslationPayload) {
    const language = await this.LanguageSettingModel.findOne({ _id: id });
    if (!language) {
      throw new EntityNotFoundException();
    }
    merge(language, data);
    await language.save();
    const dto = new TextTranslationDto(language);
    return dto;
  }

  async delete(id: string | ObjectId) {
    const language = await this.LanguageSettingModel.findOne({ _id: id });
    if (!language) {
      throw new EntityNotFoundException();
    }

    return language.delete();
  }

  async search(
    payload: TextTranslationSearchPayload
  ): Promise<PageableData<TextTranslationDto>> {
    const query = {} as any;
    if (payload.key) {
      query.key = payload.key;
    }

    if (payload.locale) {
      query.locale = payload.locale;
    }

    if (payload.value) {
      const regexp = new RegExp(payload.value, 'i');
      query.value = { $regex: regexp };
    }

    const [data, total] = await Promise.all([
      this.LanguageSettingModel.find(query).select(
        '-__v -updatedAt -createdAt'
      ),
      this.LanguageSettingModel.countDocuments(query)
    ]);

    return {
      data: data.map((d) => new TextTranslationDto(d)),
      total
    };
  }

  async generateLanguage({ locale }) {
    const texts = await this.LanguageSettingModel.find({ locale: 'en' });
    // create new langs
    await texts.reduce(async (lp, text) => {
      await lp;
      // check text and insert if not exist
      const count = await this.LanguageSettingModel.countDocuments({
        locale,
        key: text.key
      });
      if (!count) {
        await this.LanguageSettingModel.create({
          locale,
          key: text.key,
          value: text.value
        });
      }
      return Promise.resolve();
    }, Promise.resolve());
    return true;
  }

  async getAllByLocale(locale) {
    const res = await this.LanguageSettingModel.find({ locale }).select(
      '-__v -updatedAt -createdAt'
    );

    return res.reduce((results, val) => {
      // eslint-disable-next-line no-param-reassign
      results[val.key] = val.value;
      return results;
    }, {} as any);
  }
}
