import { createLogger, transports, format, Logger } from 'winston';
import path from 'path';
import { fileURLToPath } from "url";
import { dirname } from "path";
import 'winston-daily-rotate-file';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logDir = path.join(__dirname, 'logs', 'client_logs');

// Hosted platforms (e.g. GoDaddy Node.js hosting) may not allow writing log files.
// Console logging always works; set LOG_TO_FILE=true to also write rotating files.
const logTransports: any[] = [new transports.Console()];
if (process.env.LOG_TO_FILE === 'true') {
  logTransports.unshift(
    new transports.DailyRotateFile({
      dirname: logDir,
      filename: '%DATE%.log',
      datePattern: 'YYYY-MM-DD-HH',
      frequency: '6h',
      utc: true,
      maxFiles: '7d',
    })
  );
}

const logger: Logger = createLogger({
  format: format.combine(
    format.timestamp({ format: () => new Date().toLocaleString() }),
    format.json()
  ),
  transports: logTransports
});

export default logger;
