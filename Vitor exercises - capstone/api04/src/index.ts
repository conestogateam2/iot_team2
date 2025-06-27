import express, { Request, Response } from 'express';
import pg from 'pg';
import config from '../config.json';

const PORT = 4000;

// Safely parse integer with fallback
function parseInteger(input: any, fallback: number): number {
  const n = parseInt(input?.toString() ?? '', 10);
  return Number.isNaN(n) ? fallback : n;
}

async function main() {
  const app = express();

  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  app.get('/', (req, res) => {
    res.send('Telemetry Filter API is online 🛰️');
  });

  const apiRouter = express.Router();

  apiRouter.use((req, res, next) => {
    console.log('→ Entered /api router');
    next();
  });

  apiRouter.get('/filter', async (req: Request, res: Response) => {
    console.log('🚀 Route handler: /api/filter');

    const metric = req.query.metric as string | undefined;
    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;
    const last = parseInteger(req.query.last, 10);

    const conditions: string[] = [];
    if (metric) conditions.push(`metric = '${metric}'`);
    if (from) conditions.push(`timestamp >= '${from}'`);
    if (to) conditions.push(`timestamp <= '${to}'`);

    let query = 'SELECT * FROM telemetry';
    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ` ORDER BY timestamp DESC LIMIT ${last}`;

    console.log('🔍 SQL:', query);

    const client = new pg.Client(config.sqlConfig);
    try {
      await client.connect();
      const result = await client.query(query);
      console.log(`📦 ${result.rows.length} row(s) returned`);
      res.json(result.rows);
    } catch (err: any) {
      console.error('❌ Database error:', err.message);
      res.status(500).json({ error: err.message });
    } finally {
      await client.end();
      console.log('🔌 Connection closed');
    }
  });

  app.use('/api', apiRouter);

  app.listen(PORT, () => {
    console.log(`✅ Server is running at http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('💥 Unhandled error in main():', err.message);
});