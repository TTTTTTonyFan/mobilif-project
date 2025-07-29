import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T = any> {
  @ApiProperty({ description: '状态码，0表示成功' })
  code: number;

  @ApiProperty({ description: '响应消息' })
  message: string;

  @ApiProperty({ description: '响应数据' })
  data?: T;

  @ApiProperty({ description: '时间戳' })
  timestamp: number;

  @ApiProperty({ description: '请求ID', required: false })
  requestId?: string;
}