import { SearchRequest } from 'src/kernel/common';
import { ObjectId } from 'mongodb';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsBooleanString
} from 'class-validator';

export class EarningSearchRequest extends SearchRequest {
  @IsString()
  @IsOptional()
    userId?: string | ObjectId;

  @IsString()
  @IsOptional()
    performerId?: string | ObjectId;

  @IsString()
  @IsOptional()
    transactionId?: string | ObjectId;

  @IsString()
  @IsOptional()
    sourceType?: string;

  @IsString()
  @IsOptional()
    type?: string;

  @IsString()
  @IsOptional()
    payoutStatus?: string;

  @IsString()
  @IsOptional()
    fromDate?: string | Date;

  @IsString()
  @IsOptional()
    toDate?: Date;

  @IsString()
  @IsOptional()
    paidAt?: Date;

  @IsBooleanString()
  @IsOptional()
    isPaid?: boolean;

  @IsString()
  @IsOptional()
    paymentStatus?: string;

  @IsString()
  @IsOptional()
    userUsername?: string;

  @IsString()
  @IsOptional()
    performerUsername?: string;
}

export class UpdateEarningStatusPayload {
  @IsString()
  @IsOptional()
    performerId: string;

  @IsString()
  @IsNotEmpty()
    fromDate: string | Date;

  @IsString()
  @IsNotEmpty()
    toDate: string | Date;

  @IsString()
  @IsOptional()
    payoutStatus?: string;

  @IsString()
  @IsOptional()
    paymentStatus?: string;
}
