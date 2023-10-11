import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { PageableData } from 'src/kernel';
import { POST_MODEL_PROVIDER } from '../providers';
import { PostModel } from '../models';
import { AdminSearch, UserSearch } from '../payloads';

@Injectable()
export class PostSearchService {
  constructor(
    @Inject(POST_MODEL_PROVIDER)
    private readonly postModel: Model<PostModel>
  ) { }

  // TODO - define post DTO
  public async adminSearch(req: AdminSearch): Promise<PageableData<PostModel>> {
    const query = {} as any;
    if (req.q) {
      const regexp = new RegExp(
        req.q.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, ''),
        'i'
      );
      query.$or = [
        {
          title: { $regex: regexp }
        }
      ];
    }
    if (req.status) {
      query.status = req.status;
    }
    if (req.type) {
      query.type = req.type;
    }
    const sort = {
      [req.sortBy || 'updatedAt']: req.sort
    };
    const [data, total] = await Promise.all([
      this.postModel
        .find(query)
        .sort(sort)
        .limit(req.limit ? Number(req.limit) : 10)
        .skip(Number(req.offset)),
      this.postModel.countDocuments(query)
    ]);
    return {
      data,
      total
    };
  }

  public async userSearch(req: UserSearch): Promise<PageableData<PostModel>> {
    const query = {} as any;
    query.status = 'published';
    if (req.type) {
      query.type = req.type;
    }
    const sort = {
      [req.sortBy || 'updatedAt']: req.sort
    };
    const [data, total] = await Promise.all([
      this.postModel
        .find(query)
        .sort(sort)
        .limit(req.limit ? Number(req.limit) : 10)
        .skip(Number(req.offset)),
      this.postModel.countDocuments(query)
    ]);
    return {
      data,
      total
    };
  }
}
