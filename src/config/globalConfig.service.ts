import { Injectable } from '@nestjs/common';
import { ConfigService as DefaultConfigService } from '@nestjs/config';
import { ConfigType } from './configuration';

@Injectable()
export class GlobalConfigService {
  constructor(private defaultConfigService: DefaultConfigService<ConfigType>) {}

  getJwtSecret() {
    return this.defaultConfigService.get('jwt', { infer: true }).JWT_SECRET;
  }

  getSAGmail(): { gmail: string; password: string } {
    const gmail = this.defaultConfigService.get('sa_gmail', {
      infer: true,
    }).GMAIL;
    const password = this.defaultConfigService.get('sa_gmail', {
      infer: true,
    }).GMAIL_PASS;

    return { gmail, password };
  }

  getSACredentials() {
    const username = this.defaultConfigService.get('sa_credentials', {
      infer: true,
    }).SA_USERNAME;
    const password = this.defaultConfigService.get('sa_credentials', {
      infer: true,
    }).SA_PASSWORD;

    return { username, password };
  }

  getMongoUrl() {
    return this.defaultConfigService.get('db', { infer: true }).mongo.MONGO_URL;
  }

  getPort() {
    const port = Number(this.defaultConfigService.get('PORT', { infer: true }));
    if (isNaN(port)) {
      return 3000;
    }
    return port;
  }
}
