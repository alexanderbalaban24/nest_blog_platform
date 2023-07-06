import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('testing')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllData(): Promise<null> {
    await this.appService.deleteAllData();

    return;
  }
}
