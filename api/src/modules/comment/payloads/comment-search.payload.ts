import { SearchRequest } from 'src/kernel/common';
import {
  IsString, IsOptional
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';

export class CommentSearchRequestPayload extends SearchRequest {
  @ApiProperty()
  @IsString()
  @IsOptional()
    objectId?: string | ObjectId;

  @ApiProperty()
  @IsString()
  @IsOptional()
    objectType?: string;
}
