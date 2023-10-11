import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class PurchaseFeedPayload {
  @ApiProperty()
  @IsOptional()
  @IsString()
    couponCode: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
    feedId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
    paymentGateway: string;
}
