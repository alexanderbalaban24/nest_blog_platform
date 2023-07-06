import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import {
  ErrorExceptionFilter,
  HttpExceptionFilter,
} from './infrastructure/exception.filter';
import { useContainer } from 'class-validator';
import cookieParser from 'cookie-parser';
import { GlobalConfigService } from './config/globalConfig.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const ConfigService = app.get(GlobalConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      forbidUnknownValues: false,
      exceptionFactory: (errors) => {
        const customErrors = errors.map((err) => {
          return {
            field: err.property,
            messages: Object.values(err.constraints),
          };
        });
        throw new BadRequestException(customErrors);
      },
    }),
  );
  app.useGlobalFilters(new ErrorExceptionFilter(), new HttpExceptionFilter());
  app.enableCors();
  app.use(cookieParser());

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  await app.listen(ConfigService.getPort());
}

bootstrap();
