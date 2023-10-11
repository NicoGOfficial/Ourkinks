import {
  Controller,
  Injectable,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Param,
  Get,
  Query
} from '@nestjs/common';
import { DataResponse, PageableData } from 'src/kernel';
import { ModelTranslationService } from 'src/modules/i18n/services';
import { PostService, PostSearchService } from '../services';
import { PostDto } from '../dtos';
import { PostModel } from '../models';
import { UserSearch } from '../payloads';

@Injectable()
@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly postSearchService: PostSearchService,
    private readonly modelTranslationService: ModelTranslationService
  ) { }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async details(
    @Param('id') id: string,
    @Query('locale') locale: string
  ): Promise<DataResponse<PostDto>> {
    const post = await this.postService.getPublic(id);
    if (locale) {
      const translation = await this.modelTranslationService.get({ locale, sourceId: post._id }) as any;
      if (translation) {
        if (translation.title) post.title = translation.title;
        if (translation.content) post.content = translation.content;
      }
    }
    return DataResponse.ok(post);
  }

  @Get('/search')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async userSearch(
    @Query() req: UserSearch
  ): Promise<DataResponse<PageableData<PostModel>>> {
    const post = await this.postSearchService.userSearch(req);
    return DataResponse.ok(post);
  }
}
