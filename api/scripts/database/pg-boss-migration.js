import { JobClient } from '../../src/shared/infrastructure/jobs/JobClient.js';
import { logger } from '../../src/shared/infrastructure/utils/logger.js';

try {
  console.log('run pgboss migrations');
  await JobClient.instance.initialize();
} catch (error) {
  logger.error(error);
  process.exitCode = 1;
} finally {
  await JobClient.instance.stop();
}
