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
  },
  PORT: process.env.PORT,
});

export type ConfigType = ReturnType<typeof getConfiguration>;
