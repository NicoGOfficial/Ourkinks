import {
  IsNotEmpty,
  IsNumber,
  Min,
  IsString
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TipFeedPayload {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
    amount: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
    feedId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
    performerId: string;
}
