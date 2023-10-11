import { SearchRequest } from 'src/kernel';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class AdminSearch extends SearchRequest {
  @ApiProperty()
  @IsOptional()
    status?: string;

  @ApiProperty()
  @IsOptional()
    type = 'post';
}

export class UserSearch extends SearchRequest {
  @ApiProperty()
  @IsOptional()
    type = 'post';
}
