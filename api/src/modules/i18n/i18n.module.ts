import { forwardRef, Global, Module } from '@nestjs/common';
import { MongoDBModule, QueueModule } from 'src/kernel';
import { AuthModule } from '../auth/auth.module';
import { ModelTranslationService, TextTranslationService } from './services';
import { provider } from './providers';
import { AdminTranslationController } from './controllers/admin-translation.controller';
import { AdminTextTranslationController } from './controllers/admin-text-translation.controller';
import { TextTranslationController } from './controllers/text-translation.controller';

@Global()
@Module({
  imports: [MongoDBModule, QueueModule.forRoot(), forwardRef(() => AuthModule)],
  exports: [ModelTranslationService],
  controllers: [
    AdminTranslationController,
    AdminTextTranslationController,
    TextTranslationController
  ],
  providers: [
    ...provider,
    ModelTranslationService,
    TextTranslationService
  ]
})
export class I18nModule {}
