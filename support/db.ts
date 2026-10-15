import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from 'pg';
import { environment } from '../config/environment';

/** Optional integration example: SauceDemo has no database accessible to this suite. */
export class Database {
  private pool?: Pool;

  async connect(): Promise<void> {
    const { host, port, database, user, password, ssl } = environment.db;
    if (!host || !database || !user || !password) {
      throw new Error('DB_HOST, DB_NAME, DB_USER, and DB_PASSWORD are required to connect to PostgreSQL.');
    }
    this.pool = new Pool({ host, port, database, user, password, ssl: ssl ? { rejectUnauthorized: true } : undefined });
    try {
      await this.pool.query('SELECT 1');
    } catch (error) {
      await this.close();
      throw new Error('Could not connect to the configured PostgreSQL database.', { cause: error });
    }
  }

  async query<Row extends QueryResultRow = QueryResultRow>(sql: string, values: unknown[] = []): Promise<QueryResult<Row>> {
    if (!this.pool) throw new Error('Database is not connected. Call connect() first.');
    try {
      return await this.pool.query<Row>(sql, values);
    } catch (error) {
      throw new Error('Database query failed.', { cause: error });
    }
  }

  async withTransaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
    if (!this.pool) throw new Error('Database is not connected. Call connect() first.');
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await work(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool?.end();
    this.pool = undefined;
  }
}
