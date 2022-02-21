import { Logger } from '@nestjs/common';

export function logMemoryUsage(message?: string): void {
  const usage = process.memoryUsage();
  const logger = new Logger('logMemoryUsage');

  usage.rss /= 10 ** 6;
  usage.heapUsed /= 10 ** 6;
  usage.heapTotal /= 10 ** 6;
  usage.arrayBuffers /= 10 ** 6;
  usage.external /= 10 ** 6;

  logger.log(`MEM_USAGE: ${message} -`, JSON.stringify(usage));
}
