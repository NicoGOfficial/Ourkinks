import {
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsString,
  IsBoolean
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendTipsPayload {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
    amount: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
    conversationId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
    description: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
    tipWithMessage: string;
}
