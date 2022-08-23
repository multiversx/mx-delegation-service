import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerInterceptor } from './interceptors/logger-interceptor';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import * as winston from 'winston';
import * as Transport from 'winston-transport';
import { ElasticsearchTransport } from 'winston-elasticsearch';

const logTransports: Transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      nestWinstonModuleUtilities.format.nestLike(),
    ),
  }),
];

const logLevel = !!process.env.LOG_LEVEL? process.env.LOG_LEVEL: 'error';

if (!!process.env.ELASTICSEARCH_URL) {
  const clientOpts =  {
      node: process.env.ELASTICSEARCH_URL
    };
  if (process.env.ELASTICSEARCH_USERNAME && process.env.ELASTICSEARCH_PASSWORD) {
    clientOpts['auth'] = {
        username: process.env.ELASTICSEARCH_USERNAME,
        password: process.env.ELASTICSEARCH_PASSWORD
    };
  }
  logTransports.push(
    new ElasticsearchTransport({
      level: logLevel,
      clientOpts
    })
  )
}

if (!!process.env.LOG_FILE) {
  logTransports.push( new winston.transports.File({
    filename: process.env.LOG_FILE,
    dirname: 'logs',
    maxsize: 100000,
    level: logLevel
  }));
}

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: logTransports,
    }),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
    LoggerInterceptor
  ],
  exports: [
    WinstonModule,
  ]
})
export class LoggingModule {}