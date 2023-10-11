import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { PageableData } from 'src/kernel';
import { COUPON_PROVIDER } from '../providers';
import { CouponModel } from '../models';
import { CouponSearchRequestPayload } from '../payloads';
import { CouponDto } from '../dtos';

@Injectable()
export class CouponSearchService {
  constructor(
    @Inject(COUPON_PROVIDER)
    private readonly couponModel: Model<CouponModel>
  ) { }

  // TODO - define category DTO
  public async search(
    req: CouponSearchRequestPayload
  ): Promise<PageableData<CouponDto>> {
    const query = {} as any;
    if (req.q) {
      query.$or = [
        {
          name: { $regex: new RegExp(req.q.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, ''), 'i') }
        },
        {
          code: { $regex: new RegExp(req.q.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, ''), 'i') }
        }
      ];
    }
    if (req.status) {
      query.status = req.status;
    }
    let sort = {
      createdAt: -1
    } as any;
    if (req.sort && req.sortBy) {
      sort = {
        [req.sortBy]: req.sort
      };
    }
    const [data, total] = await Promise.all([
      this.couponModel
        .find(query)
        .sort(sort)
        .limit(req.limit ? Number(req.limit) : 10)
        .skip(Number(req.offset)),
      this.couponModel.countDocuments(query)
    ]);

    return {
      data: data.map((item) => new CouponDto(item)), // TODO - define mdoel
      total
    };
  }
}
