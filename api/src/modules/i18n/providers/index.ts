import { Provider } from '@nestjs/common';
import { Connection } from 'mongoose';
import { MONGO_DB_PROVIDER } from 'src/kernel';
import { ModelTranslationSchema, TextTranslationSchema } from '../schemas';

export const MODEL_TRANSLATION_SCHEMA_PROVIDER = 'MODEL_TRANSLATION_SCHEMA_PROVIDER';

export const TEXT_TRANSLATION_SCHEMA_PROVIDER = 'TEXT_TRANSLATION_SCHEMA_PROVIDER';

export const provider: Provider[] = [
  {
    provide: MODEL_TRANSLATION_SCHEMA_PROVIDER,
    inject: [MONGO_DB_PROVIDER],
    useFactory: (connection: Connection) => connection.model('ModelTranslation', ModelTranslationSchema)
  },
  {
    provide: TEXT_TRANSLATION_SCHEMA_PROVIDER,
    inject: [MONGO_DB_PROVIDER],
    useFactory: (connection: Connection) => connection.model('TextTranslation', TextTranslationSchema)
  }
];
