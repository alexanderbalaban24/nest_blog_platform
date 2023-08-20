import { ConfigModule } from '@nestjs/config';
import { getConfiguration } from './configuration';
import * as Joi from 'joi';

export const configModule = ConfigModule.forRoot({
  isGlobal: true,
  load: [getConfiguration],
  validationSchema: Joi.object({
    JWT_SECRET: Joi.string().required(),
    GMAIL: Joi.string().email().required(),
    GMAIL_PASS: Joi.string().required(),
    SA_USERNAME: Joi.string().required(),
    SA_PASSWORD: Joi.string().required(),
    MONGO_URL: Joi.string().uri().required(),
    PORT: Joi.number().required(),
    POSTGRES_HOST: Joi.string().required(),
    POSTGRES_PORT: Joi.number().required(),
    DB_NAME: Joi.string().required(),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    SALT_GENERATE_ROUND: Joi.number().required(),
  }),
});
