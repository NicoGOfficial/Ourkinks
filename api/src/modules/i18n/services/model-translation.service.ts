import {
  Inject,
  Injectable
} from '@nestjs/common';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import {
  EntityNotFoundException,
  PageableData,
  QueueEvent,
  QueueEventService
} from 'src/kernel';
import { SETTING_CHANNEL } from 'src/modules/settings/constants';
import { ModelTranslationModel as Translation } from '../models/model-translation.model';
import { MODEL_TRANSLATION_SCHEMA_PROVIDER } from '../providers';
import {
  TranslationCreatePayload,
  TranslationSearchPayload,
  TranslationUpdatePayload
} from '../payloads';

@Injectable()
export class ModelTranslationService {
  constructor(
    @Inject(MODEL_TRANSLATION_SCHEMA_PROVIDER)
    private readonly TranslationModel: Model<Translation>,
    private readonly queueEventService: QueueEventService
  ) {
  }

  public async findById(id: string | ObjectId) {
    return this.TranslationModel.findOne({ _id: id });
  }

  public async get(query: {
    source?: string;
    sourceId: string | ObjectId;
    locale: string;
  }) {
    return this.TranslationModel.findOne(query);
  }

  public async getListByIds(query: {
    source?: string;
    sourceIds: any;
    locale: string;
  }) {
    const { source, sourceIds, locale } = query;
    const queryData = {
      sourceId: {
        $in: sourceIds
      },
      locale
    } as any;
    if (source) queryData.source = source;
    return this.TranslationModel.find(queryData);
  }

  public async create(payload: TranslationCreatePayload) {
    const { locale, sourceId } = payload;
    let translation = await this.TranslationModel.findOne({ locale, sourceId });
    if (translation) {
      await this.TranslationModel.updateOne({ _id: translation._id }, {
        $set: payload
      });
    } else {
      translation = await this.TranslationModel.create(payload);
    }

    if (translation.source === 'setting') {
      await this.queueEventService.publish(
        new QueueEvent({
          channel: SETTING_CHANNEL,
          eventName: 'update',
          data: translation
        })
      );
    }
    return translation.toObject();
  }

  public async update(id: string, payload: TranslationUpdatePayload) {
    const translation = await this.TranslationModel.findOne({ _id: id });
    if (!translation) {
      throw new EntityNotFoundException();
    }

    await this.TranslationModel.updateOne({ _id: id }, payload);
    if (translation.source === 'setting') {
      await this.queueEventService.publish(
        new QueueEvent({
          channel: SETTING_CHANNEL,
          eventName: 'update',
          data: translation
        })
      );
    }
    return true;
  }

  public async delete(id: string) {
    const translation = await this.TranslationModel.findOne({ _id: id });
    if (!translation) {
      throw new EntityNotFoundException();
    }

    return this.TranslationModel.deleteOne({ _id: id });
  }

  public async search(
    payload: Partial<TranslationSearchPayload>
  ): Promise<PageableData<any>> {
    const query = {} as any;
    if (payload.source) {
      query.source = payload.source;
    }
    if (payload.sourceId) {
      query.sourceId = payload.sourceId;
    }
    if (payload.locales) {
      query.locale = { $in: payload.locales.split(',') };
    }
    if (payload.sourceIds) {
      query.sourceId = { $in: payload.sourceIds.split(',') };
    }

    const sort = {};
    if (payload.sort && payload.sortBy) {
      sort[payload.sortBy] = payload.sort;
    }

    const [data, total] = await Promise.all([
      this.TranslationModel.find(query)
        .sort(sort)
        .limit(payload.limit)
        .skip(payload.offset)
        .lean(),
      this.TranslationModel.count(query)
    ]);

    return {
      data,
      total
    };
  }

  public async getByItemAndLanguage(sourceId, locale) {
    return this.TranslationModel.findOne({
      sourceId,
      locale
    });
  }

  public async getSettingsTranslation(locale, group = null) {
    const query = {
      locale,
      source: 'setting'
    } as any;
    if (group) query.group = group;
    return this.TranslationModel.find(query);
  }

  public async getSettingsKeysTranslation(locale, keys: string[]) {
    const query = {
      locale,
      source: 'setting',
      key: {
        $in: keys
      }
    } as any;
    return this.TranslationModel.find(query);
  }

  public async updateSettingTranslation({
    locale, key, value, group
  }) {
    const existData = await this.TranslationModel.findOne({
      locale,
      source: 'setting',
      key
    });
    if (existData) {
      await this.TranslationModel.updateOne({ _id: existData._id }, {
        $set: {
          value,
          group
        }
      });
    } else {
      await this.TranslationModel.create({
        locale,
        source: 'setting',
        key,
        value,
        group
      });
    }
  }
}
