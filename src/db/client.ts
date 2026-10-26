import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import * as schema from './schema';

const DATABASE_NAME = 'chugumi.db';

const sqlite = openDatabaseSync(DATABASE_NAME, { enableChangeListener: true });
sqlite.execSync('PRAGMA foreign_keys = ON;');

export const db = drizzle(sqlite, { schema });

export type Database = typeof db;
/** db.transaction 콜백이 받는 트랜잭션 객체. repository가 db 대신 받을 수 있게 공개. */
export type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];
export type DbExecutor = Database | Transaction;
