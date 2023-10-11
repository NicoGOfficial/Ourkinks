import { SearchRequest } from 'src/kernel/common';
import {
  IsString, IsOptional, IsNotEmpty, IsIn
} from 'class-validator';
import { REPORT_TARGET } from '../constants';

export class ReportSearchRequestPayload extends SearchRequest {
  @IsOptional()
  @IsString()
    targetId?: string;

  @IsOptional()
  @IsString()
    target?: string;

  @IsOptional()
  @IsString()
    source?: string;

  @IsOptional()
  @IsString()
    sourceId?: string;

  @IsOptional()
  @IsString()
    performerId?: string;
}

export class ReportCreatePayload {
  @IsString()
  @IsOptional()
  @IsIn([
    REPORT_TARGET.GALLERY,
    REPORT_TARGET.VIDEO,
    REPORT_TARGET.PERFORMER,
    REPORT_TARGET.PRODUCT
  ])
    target = REPORT_TARGET.VIDEO;

  @IsString()
  @IsNotEmpty()
    targetId: string;

  @IsString()
  @IsNotEmpty()
    title: string;

  @IsString()
  @IsOptional()
    description: string;

  @IsOptional()
  @IsString()
    performerId?: string;
}
