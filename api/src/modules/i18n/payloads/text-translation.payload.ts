import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SearchRequest } from 'src/kernel';

export class TextTranslationPayload {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
    key: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
    locale: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
    value: string;
}

export class TextTranslationSearchPayload extends SearchRequest {
  @ApiProperty()
  @IsString()
  @IsOptional()
    key: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    locale: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
    value: string;
}
