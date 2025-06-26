import express, { Request, Response } from 'express';
import pg from 'pg';
import cors from 'cors';
import config from '../config.json';

const PORT = 5000;

const app = express();
app.use(cors());

function parseInteger(input: any, fallback: number): number {
  const n = parseInt(input?.toString() ?? '', 10);
  return Number.isNaN(n) ? fallback : n;
}

async function main() {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  app.get('/', (req, res) => {
    res.send('Robot Data API is online 🤖');
  });

  const apiRouter = express.Router();

  apiRouter.get('/robotdata', async (req: Request, res: Response) => {
    console.log('🚀 Route handler: /api/robotdata');

    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;
    const robotIdParam = req.query.robot_id as string | undefined;
    const robotId = robotIdParam !== undefined && !isNaN(parseInt(robotIdParam))
      ? parseInt(robotIdParam, 10)
      : null;
    const limit = parseInteger(req.query.limit, 10);

    const conditions: string[] = [];
    if (robotId !== null) conditions.push(`rp.robot_id = ${robotId}`);
    if (from) conditions.push(`rp.timestamp >= '${from}'`);
    if (to) conditions.push(`rp.timestamp <= '${to}'`);

    let query = `
      SELECT 
        rs.position_id,
        rs.is_initialized,
        rs.is_running,
        rs.is_paused,
        rs.has_workcell_violation,
        rs.speed_percent,
        rp.x, rp.y, rp.z, rp.w,
        rp.timestamp,
        rt.t1, rt.t2, rt.t3, rt.t4,
        CASE WHEN rp.robot_id = 1 THEN 'DR1' ELSE rp.robot_id::text END AS robot_name
      FROM robot_status rs
      JOIN robot_position rp ON rs.position_id = rp.id
      LEFT JOIN robot_torque rt ON rs.position_id = rt.position_id
    `;

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY rp.timestamp DESC LIMIT ${limit};`;
    console.log('🔍 SQL:', query);

    const client = new pg.Client(config.sqlConfig);
    try {
      await client.connect();
      const result = await client.query(query);
      console.log(`📦 ${result.rows.length} row(s) returned`);
      res.json(result.rows);
    } catch (err: any) {
      console.error('❌ Database query error:', err.message);
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
