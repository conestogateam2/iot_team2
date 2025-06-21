import express from 'express';
import { pool } from '../functions/db';
import { iRobotSchema } from '../interfaces/interfaces';

const router = express.Router();

//Get latest row of specific robot
router.get('/latest/:robot_name', async (req, res) => {
  const { robot_name } = req.params;

  try {
    const result = await pool.query<iRobotSchema>(
      'SELECT * FROM robot_data_team2 WHERE robot_name = $1 ORDER BY timestamp DESC LIMIT 1',
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
      SELECT * FROM robot_data_team2 
      WHERE timestamp >= $1 AND timestamp <= $2
    `;
    const values: any[] = [fromDate.toISOString(), toDate.toISOString()];
  
    // Filtering robot
    if (robot_name && typeof robot_name === 'string') {
      query += ' AND robot_name = $3';
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



  router.get('/statistics/totalcount', async (req, res) => {
    const { from, to, robot_name } = req.query;
  
    if (!from || !to || typeof from !== 'string' || typeof to !== 'string' || !robot_name || typeof robot_name !== 'string') {
      return res.status(400).json({ error: ' "from", "to" and "robot_name" are required and must be strings.' });
    }
  
    const fromDate = new Date(from);
    const toDate = new Date(to);
  
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return res.status(400).json({ error: 'Invalid dates "from" or "to"' });
    }
  
    const query = `
      SELECT id, position_y, timestamp, is_running, is_paused, has_violation FROM robot_data_team2
      WHERE timestamp >= $1 AND timestamp <= $2 AND robot_name = $3
      ORDER BY timestamp ASC
    `;
    const values = [fromDate.toISOString(), toDate.toISOString(), robot_name];
  
    try {
      const result = await pool.query<{
        position_y: number;
        timestamp: string;
        is_running: boolean;
        is_paused: boolean;
        has_violation: boolean;
      }>(query, values);
  
      let countA = 0; 
      let countB = 0; 
  
      let prevY: number | null = null;
      let prevTimestamp: number | null = null;
  
      const timestampsA: number[] = [];
      const timestampsB: number[] = [];
  
      // Times of different states
      let runningTime = 0;
      let pausedTime = 0;
      let violationTime = 0;
      let idleTime = 0;
  
      // Calculate of idle time 
      let idleStartTimestamp: number | null = null;
  
      for (let i = 0; i < result.rows.length; i++) {
        const row = result.rows[i];
        const y = row.position_y;
        const ts = new Date(row.timestamp).getTime();
  
        // Counting parts
        if (prevY !== null) {
          if (prevY >= 0 && y < 0) {
            countB++;
            timestampsB.push(ts);
          } else if (prevY < 0 && y >= 0) {
            countA++;
            timestampsA.push(ts);
          }
        }
  
        // Idle time calculous
        const positionDiff = prevY !== null ? Math.abs(y - prevY) : 0;
  
        if (prevTimestamp !== null) {
          const timeDiff = ts - prevTimestamp; 
  
          if (positionDiff < 0.01) {
            // position in y is constant
            if (idleStartTimestamp === null) {
              idleStartTimestamp = prevTimestamp; // idle starting
            }
          } else {
            // movement detected
            if (idleStartTimestamp !== null) {
              const idleDuration = prevTimestamp - idleStartTimestamp; // ms
              if (idleDuration >= 2000) { // if idle was more than 2 seconds, add it 
                idleTime += idleDuration;
              }
              idleStartTimestamp = null;
            }
          }
  
          // Count times betwin rows
          if (result.rows[i - 1]) {
            const prevRow = result.rows[i - 1];
            const prevTs = new Date(prevRow.timestamp).getTime();
            const interval = ts - prevTs;
  
            if (prevRow.is_running) runningTime += interval;
            if (prevRow.is_paused) pausedTime += interval;
            if (prevRow.has_violation) violationTime += interval;
          }
        }
  
        prevY = y;
        prevTimestamp = ts;
      }
  
      // Close idle period
      if (idleStartTimestamp !== null && prevTimestamp !== null) {
        const idleDuration = prevTimestamp - idleStartTimestamp;
        if (idleDuration >= 2000) {
          idleTime += idleDuration;
        }
      }
  
      // Average of cycles time
      function averageCycleTime(timestamps: number[]): number | null {
        if (timestamps.length < 2) return null;
        let totalDiff = 0;
        for (let i = 1; i < timestamps.length; i++) {
          totalDiff += timestamps[i] - timestamps[i - 1];
        }
        return totalDiff / (timestamps.length - 1);
      }
  
      const avgCycleTimeAms = averageCycleTime(timestampsA);
      const avgCycleTimeBms = averageCycleTime(timestampsB);
  
      const avgCycleTimeA = avgCycleTimeAms !== null ? avgCycleTimeAms / 1000 : null;
      const avgCycleTimeB = avgCycleTimeBms !== null ? avgCycleTimeBms / 1000 : null;
  
      const diffMs = toDate.getTime() - fromDate.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
  
      const totalParts = countA + countB;
      const partsPerHour = diffHours > 0 ? totalParts / diffHours : 0;
      const partsPerHourA = diffHours > 0 ? countA / diffHours : 0;
      const partsPerHourB = diffHours > 0 ? countB / diffHours : 0;
  
      return res.json({
        robot_name,
        from,
        to,
        total_time_seconds: diffHours * 60*60,
        production: {
          total_parts: {
            Count: totalParts,
            Parts_per_hour: partsPerHour.toFixed(2)
          },
          PartA: {
            Count: countA,
            Parts_per_hour: partsPerHourA,
            avg_cycle_time_seconds: avgCycleTimeA !== null ? avgCycleTimeA.toFixed(2) : 'N/A'
          },
          PartB: {
            Count: countB,
            Parts_per_hour: partsPerHourB,
            avg_cycle_time_seconds: avgCycleTimeB !== null ? avgCycleTimeB.toFixed(2) : 'N/A'
          },
          Time: {
            Running_seconds: (runningTime / 1000).toFixed(2),
            Paused_seconds: (pausedTime / 1000).toFixed(2),
            Violation_seconds: (violationTime / 1000).toFixed(2),
            Idle_seconds: (idleTime / 1000).toFixed(2),
            EffectiveRunningTime: ((runningTime / 1000)-(idleTime / 1000)).toFixed(2)
          }
        }
      });
  
    } catch (err) {
      console.error('Error executing query:', err);
      return res.status(500).json({ error: 'error counting cycles' });
    }
  });
  

export default router;


