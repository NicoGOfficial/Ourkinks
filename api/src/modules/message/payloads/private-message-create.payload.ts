import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import { MessageCreatePayload } from './message-create.payload';

export class PrivateMessageCreatePayload extends MessageCreatePayload {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
    recipientId: ObjectId;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
    recipientType: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
    price: number;
}
