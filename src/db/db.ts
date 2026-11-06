import "reflect-metadata";
import "../../env";
import { DataSource } from "typeorm";
import { events_entities } from "./events/index.entity";
import { SydneyTimeDisplayTransformer } from "../utils/sydneyTimeDisplayTransformer";

// Store connections for each domain
const domainConnections: { [domain: string]: DataSource } = {};

const EVENTS_DOMAIN = process.env.EVENTS_DOMAIN;

// Domain-specific database configurations
const dbConfig: { [domain: string]: any } = {
  [EVENTS_DOMAIN]: {
    type: process.env.DB_TYPE,
    host: process.env.EVENTS_DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.EVENTS_DB_USER_NAME,
    password: process.env.EVENTS_DB_PASSWORD,
    database: process.env.EVENTS_DB_DATABASE_NAME,
    entities: events_entities,
  },
};

// Function to get or create a database connection for a specific domain
export const getDatabaseConnection = async (
  domain: string
): Promise<DataSource> => {
  // This project has a single database. On GoDaddy the request hostname can be the
  // custom domain, a preview URL or a CDN hostname, so any hostname uses the one configured DB.
  if (!dbConfig[domain]) {
    domain = EVENTS_DOMAIN;
  }

  // Reuse existing connection
  if (domainConnections[domain]?.isInitialized) {
    return domainConnections[domain];
  }

  // Create a new connection
  const config = {
    ...dbConfig[domain],
    connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT) || 60000,
    synchronize: process.env.DB_SYNCHRONIZE === "true", // Auto-create tables from entities (keep false in production)
    logging: false, // Log queries (for debugging)
    migrations: [],
    subscribers: [],
    extra: {
      connectionLimit: Number(process.env.MAX_CONNECTION_LIMIT) || 5,
      idleTimeoutMillis: Number(process.env.IDLE_TIMEOUT_IN_MILI_SEC) || 30000,
      connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT) || 60000,
      dateStrings: true,
      sqlMode: "STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION"
    },
  };

  const dataSource = new DataSource(config);

  try {
    await dataSource.initialize();
    console.log(`Database connected successfully for domain: ${domain}`);

    try {
      await dataSource.query("SET time_zone = 'Australia/Sydney'");
    } catch (error) {
      console.warn(
        "Could not set MySQL session time_zone. Transformer will still apply the conversion."
      );
    }

    //  Patch ALL datetime columns globally
    dataSource.entityMetadatas.forEach((metadata) => {
      metadata.columns.forEach((column) => {
        const isDateTime =
          column.type === "datetime" || column.type === "timestamp";

        if (isDateTime && !column.transformer) {
          column.transformer = SydneyTimeDisplayTransformer;

          (column as any).type = "string";
        }
      });
    });

    domainConnections[domain] = dataSource; // Cache the connection
    return dataSource;
  } catch (error) {
    console.error(
      `Error connecting to the database for domain ${domain}:`,
      error.message
    );
    throw error;
  }
};
