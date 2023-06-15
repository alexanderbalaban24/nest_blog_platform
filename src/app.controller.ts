import { Controller, Delete, HttpCode } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('testing')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Delete('all-data')
  @HttpCode(204)
  async deleteAllData(): Promise<boolean> {
    return await this.appService.deleteAllData();
  }
}
