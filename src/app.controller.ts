import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ResponseMessage } from './common/decorator/response.decorator';
import { DATA_FETCH } from './common/constant/user.constant';
import { Public } from './common/decorator/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  @ResponseMessage(DATA_FETCH)
  getHello(): string {
    return this.appService.getHello();
  }
}
