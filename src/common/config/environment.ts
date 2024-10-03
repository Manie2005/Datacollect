import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import * as process from 'process';
dotenv.config();

const configService = new ConfigService();

interface IEnvironment {
  DATABASE: {
    TYPE: any;
    HOST: string;
    PORT: number;
    USERNAME: string;
    PASSWORD: string;
    NAME: string;
  };
  SESSION_SECRET: {
    SECRET: string;
  };
  SESSION_NAME: {
    NAME: string;
  };
  PROJECT_PORT: {
    PORT: number;
  };
  JWT_SECRET: {
    SECRET: string;
  };
  JWT_EXPIRES_IN: {
    EXPIRES_IN: number;
  };
  MACHINE_LEARNING:{
    ML_URL: string;
  };
  EMAIL: {
    SERVICE: string;
    USERNAME: string;
    PASSWORD: string;
  };
  DB: {
    URL: string;
  };
  SEND_IN_BLUE: {
    KEY: string;
    LIST: number | string;
  };
  DOS: {
    KEY_ID: string;
    SECRET: string;
    BUCKET_NAME: string;
    SPACE_LINK: string;
  };
  FIREBASE: {
    PROJECT_ID: string;
    PRIVATE_KEY: string;
    CLIENT_EMAIL: string;
  };
  SENDGRID: string;
  META_API_TOKEN: string;

  PAYPAL: {
    CLIENT_ID: string;
    SECRET_KEY: string;
    MODE: string;
  };
  PAYSTACK: {
    CLIENT_ID: string;
    SECRET_KEY: string;
  };

  CORS: {
    CORSORIGIN: string;
  };
}

export const environment: IEnvironment = {
  DATABASE: {
    TYPE: configService.getOrThrow('DB_TYPE'),
    HOST: configService.getOrThrow('DB_HOST'),
    PORT: configService.getOrThrow('DB_PORT'),
    USERNAME: configService.getOrThrow('DB_USERNAME'),
    PASSWORD: configService.getOrThrow('DB_PASSWORD'),
    NAME: configService.getOrThrow('DB_NAME'),
  },
  SESSION_SECRET: {
    SECRET: configService.getOrThrow('SESSION_SECRET'),
  },
  SESSION_NAME: {
    NAME: configService.getOrThrow('SESSION_NAME'),
  },
  CORS: {
    CORSORIGIN: configService.getOrThrow('CORS_ORIGIN'),
  },
  JWT_SECRET: {
    SECRET: configService.getOrThrow('JWT_SECRET'),
  },
  JWT_EXPIRES_IN:{
    EXPIRES_IN: configService.getOrThrow('JWT_EXPIRESIN'),
  },
  PROJECT_PORT: {
    PORT: configService.getOrThrow('PROJECT_PORT'),
  },
  MACHINE_LEARNING:{
    ML_URL: configService.getOrThrow('MACHINE_LEARNING_URL'),
  },
  EMAIL: {
    SERVICE: process.env.EMAIL_SERVICE,
    USERNAME: process.env.EMAIL_USERNAME,
    PASSWORD: process.env.EMAIL_PASSWORD,
  },
  DB: {
    URL: process.env.DATABASE_URL || process.env.DB_URL,
  },
  SEND_IN_BLUE: {
    KEY: process.env.SEND_IN_BLUE,
    LIST: process.env.SEND_IN_BLUE_LIST,
  },
  DOS: {
    KEY_ID: process.env.DOS_SPACES_KEYID,
    SECRET: process.env.DOS_SPACES_SECRET,
    BUCKET_NAME: process.env.DOS_BUCKET_NAME,
    SPACE_LINK: process.env.DOS_SPACE_LINK,
  },
  FIREBASE: {
    PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
    CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  },
  PAYPAL: {
    CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
    SECRET_KEY: process.env.PAYPAL_SECRET_KEY,
    MODE: process.env.PAYPAL_MODE,
  },
  PAYSTACK: {
    CLIENT_ID: process.env.PAYSTACK_CLIENT_ID,
    SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
  },

  SENDGRID: process.env.SENDGRID_KEY,
  META_API_TOKEN: process.env.META_API_TOKEN,
};
