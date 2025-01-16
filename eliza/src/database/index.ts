import { PostgresDatabaseAdapter } from "@elizaos/adapter-postgres";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeDatabaseWithSchema(db: PostgresDatabaseAdapter) {
  try {
    // Read and execute the schema.sql file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await db.query(schema);

    console.log('Database initialized with custom schema.');
  } catch (error) {
    console.error('Error initializing database with custom schema:', error);
    throw error;
  }
}

async function initializeDatabase() {
  const db = new PostgresDatabaseAdapter({
    connectionString: process.env.POSTGRES_URL,
  });

  
  await initializeDatabaseWithSchema(db);

  return db;
}

export { initializeDatabase };