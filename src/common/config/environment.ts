import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
dotenv.config();

const configService = new ConfigService();

interface IEnvironment {
  DATABASE: {
    URL: string;
    TYPE: string;
  };
  PROJECT_PORT: number;
}

export const environment: IEnvironment = {
  DATABASE: {
    TYPE: process.env.DB_TYPE || 'mongodb', // Should be 'mongodb'
    URL: process.env.DB_URI, // Use the full MongoDB connection string
  },
  PROJECT_PORT: parseInt(configService.getOrThrow('PROJECT_PORT')) || 3000,
};
