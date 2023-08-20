import * as process from 'process';

export const getConfiguration = () => ({
  jwt: {
    JWT_SECRET: process.env.JWT_SECRET,
  },
  sa_gmail: {
    GMAIL: process.env.GMAIL,
    GMAIL_PASS: process.env.GMAIL_PASS,
  },
  sa_credentials: {
    SA_USERNAME: process.env.SA_USERNAME,
    SA_PASSWORD: process.env.SA_PASSWORD,
  },
  db: {
    mongo: {
      MONGO_URL: process.env.MONGO_URL,
    },
    postgres: {
      POSTGRES_HOST: process.env.POSTGRES_HOST,
      POSTGRES_PORT: process.env.POSTGRES_PORT,
      DB_NAME: process.env.DB_NAME,
      DB_USERNAME: process.env.DB_USERNAME,
      DB_PASSWORD: process.env.DB_PASSWORD,
    },
  },
  PORT: process.env.PORT,
  SALT_GENERATE_ROUND: process.env.SALT_GENERATE_ROUND,
});

export type ConfigType = ReturnType<typeof getConfiguration>;
