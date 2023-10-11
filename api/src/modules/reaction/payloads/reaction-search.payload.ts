import { SearchRequest } from 'src/kernel/common';
import { ObjectId } from 'mongodb';
import { IsOptional, IsString } from 'class-validator';

export class ReactionSearchRequestPayload extends SearchRequest {
  @IsOptional()
  @IsString()
    objectId?: string | ObjectId;

  @IsOptional()
  @IsString()
    action?: string;

  @IsOptional()
  @IsString()
    objectType?: string;

  @IsOptional()
  @IsString()
    createdBy?: string | ObjectId;
}
