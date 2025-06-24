import express from 'express';
import { pool } from '../functions/db';
import { iRobotSchema } from '../interfaces/interfaces';
import dotenv from 'dotenv';


dotenv.config();
const dataTable = process.env.DB_TABLE || "table";
const robotColumnName = process.env.DB_COLUMN_ROBOT_NAME || "robot_name";

const router = express.Router();

//Get latest row of specific robot
router.get('/latest/:robot_name', async (req, res) => {
  const { robot_name } = req.params;

  try {
    const result = await pool.query<iRobotSchema>(
      `SELECT * FROM ${dataTable} WHERE ${robotColumnName} = $1 ORDER BY timestamp DESC LIMIT 1`,
      [robot_name]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Robot not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error obtaining last robot state' });
  }
});


//Period of time GET /robots?from=2025-06-18T00:00:00Z&to=2025-06-18T23:59:59Z
router.get('/', async (req, res) => {
    const { from, to, robot_name } = req.query;
  
    // Validate strings
    if (!from || !to || typeof from !== 'string' || typeof to !== 'string') {
      return res.status(400).json({ error: '"from" and "to" are required and must be isostring' });
    }
  
    const fromDate = new Date(from);
    const toDate = new Date(to);
  
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return res.status(400).json({ error: 'Invalid dates in "from" o "to"' });
    }

  
    // Base SQL query
    let query = `
      SELECT * FROM ${dataTable} 
      WHERE timestamp >= $1 AND timestamp <= $2
    `;
    const values: any[] = [fromDate.toISOString(), toDate.toISOString()];
  
    // Filtering robot
    if (robot_name && typeof robot_name === 'string') {
      query += ` AND ${robotColumnName} = $3`;
      values.push(robot_name);
    }
  
    query += ' ORDER BY timestamp ASC';
  
    try {
  
        const result = await pool.query<iRobotSchema>(query, values);
        return res.json(result.rows);
      } catch (err) {
        console.error('Error ejecutando query:', err);
        res.status(500).json({ error: 'Error obtaining registers' });
      }
  });


  

export default router;


