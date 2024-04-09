import bodyParser from 'body-parser';
import errorHandler from 'errorhandler';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { NestInterceptor, ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor, MetricsService } from '@multiversx/sdk-nestjs-monitoring';
import { FieldsInterceptor } from '@multiversx/sdk-nestjs-http';

/**
 * Wrapper for Express server
 */
export class Express {
  /**
   * Express instance
   */
  private app;
  /**
   * Server instance
   */
  private server;

  /**
   * Init express server
   */
  async init() {
    const app = (this.app = await NestFactory.create<NestExpressApplication>(
      AppModule,
    ));

    const metricsService = app.get<MetricsService>(MetricsService);

    app.disable('x-powered-by');
    app.enable('trust-proxy');

    const corsOrigin = process.env.CORS_ORIGINS.split(',').map(item => new RegExp(item)) ?? [];

    app.enableCors({
      origin: corsOrigin,
    });

    if (process.env.NODE_ENV !== 'production') {
      const options = new DocumentBuilder()
        .setTitle('Elrond Delegation API')
        .setDescription('')
        .setVersion('1.0')
        .build();

      const document = SwaggerModule.createDocument(app, options);
      SwaggerModule.setup('api-docs', app, document);
    }

    // Configure ExpressJS
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));


    const globalInterceptors: NestInterceptor[] = [];
    globalInterceptors.push(new LoggingInterceptor(metricsService));
    globalInterceptors.push(new FieldsInterceptor());
    app.useGlobalInterceptors(...globalInterceptors);


    /*
     * Error Handler. Provides full stack - remove for production
     */
    app.use(errorHandler());

    /*
     * Protect the API of well-known web vulnerabilities
     */
    app.use(helmet());

    /*
     * Use global validation type
     */
    app.useGlobalPipes(new ValidationPipe());

    this.setKeepAlive(app);

    await app.startAllMicroservices();
  }

  private setKeepAlive(app: NestExpressApplication): void {
    const httpAdapterHostService = app.get<HttpAdapterHost>(HttpAdapterHost);
    const httpServer = httpAdapterHostService.httpAdapter.getHttpServer();
    httpServer.keepAliveTimeout = parseInt(
      process.env.KEEPALIVE_TIMEOUT_UPSTREAM,
    );
  }

  /**
   * Return the express instance
   */
  getExpressApp() {
    return this.app;
  }

  /**
   * Start the express server
   * @param port
   */
  listen(port) {
    return new Promise(res => {
      this.server = this.app.listen(port, res);
    });
  }
}
