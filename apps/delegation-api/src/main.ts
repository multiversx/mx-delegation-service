import { Express } from './express';
import { NestFactory } from '@nestjs/core';
import { PrivateAppModule } from './private.app.module';
import { TransactionProcessorModule } from './common/services/transaction-processor/transaction.processor.module';

/**
 * Main class for the app. Used to initialize and start the Express server
 */
class Main {

  constructor() {
    this.main().catch(error => console.log(error));
  }

  /**
   * Initialize express server
   */
  private async main() {
    if (process.env.DELEGATION_API_ENABLE === 'true') {
      const express = new Express();
      await express.init();
      await express.listen(process.env.PORT);
      console.log('Delegation API Server is running at PORT: %s', process.env.PORT);
    }

    if (process.env.TRANSACTION_PROCESSOR_ENABLE === 'true') {
      await NestFactory.createApplicationContext(TransactionProcessorModule);
      console.log('Transaction processor is running');
    }

    const privateApp = await NestFactory.create(PrivateAppModule);
    await privateApp.listen(process.env.PRIVATE_PORT);

  }
}

/**
 * Create a new instance
 */
new Main();

