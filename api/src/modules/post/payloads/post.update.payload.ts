import {
  IsString, IsOptional, IsArray, IsIn, IsNumber
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PostUpdatePayload {
  @ApiProperty()
  @IsString()
  @IsOptional()
    title: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    authorId: string;

  @ApiProperty()
  @IsString()
    type = 'post';

  @ApiProperty()
  @IsString()
  @IsOptional()
    slug: string;

  @IsNumber()
  @IsOptional()
    ordering: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
    content: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    shortDescription: string;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
    categoryIds: string[] = [];

  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsIn(['draft', 'published'])
    status;

  @ApiProperty()
  @IsString()
  @IsOptional()
    image: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    metaTitle: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    metaKeywords: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    metaDescription: string;
}
