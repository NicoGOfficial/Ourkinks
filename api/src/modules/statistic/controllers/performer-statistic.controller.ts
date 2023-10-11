import {
  HttpCode,
  HttpStatus,
  Controller,
  Get,
  Injectable,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Param
} from '@nestjs/common';
import { DataResponse } from 'src/kernel';
import { RoleGuard } from 'src/modules/auth/guards';
import { Roles } from 'src/modules/auth';
import { PerformerStatisticService } from '../services';

@Injectable()
@Controller('statistics')
export class PerformerStatisticController {
  constructor(private readonly performerStatisticService: PerformerStatisticService) { }

  @Get('/performers/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('performer')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getPerformerStats(
    @Param('id') performerId: string
  ): Promise<any> {
    const data = await this.performerStatisticService.stats(performerId);
    return DataResponse.ok(data);
  }

  @Get('/performers/:id/last-12months')
  @HttpCode(HttpStatus.OK)
  @Roles('performer')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getStatsForLast12Months(
    @Param('id') performerId: string
  ): Promise<any> {
    const data = await this.performerStatisticService.getStatsForLast12Months(performerId);
    return DataResponse.ok(data);
  }
}
