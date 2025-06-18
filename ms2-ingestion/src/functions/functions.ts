import * as fs from 'fs'; // Library for File System Operations
import logger from './logger.js';
import {Pool} from 'pg';
import {iRobotSchema, robotPayload} from '../interfaces/interfaces.js';



// Get the formatted timestamp
export const getFormattedTimestamp = (): string => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

export async function insertRobotData(payload: robotPayload, pool: Pool, dbTable: string) {

    const query = `
      INSERT INTO ${dbTable} (
        version, timestamp, robot_name,
        is_initialized, is_running, is_paused, has_violation,
        position_x, position_y, position_z, position_w,
        torque_1, torque_2, torque_3, torque_4,
        speed_percentage
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    `;
  
    const values = [
      payload.Version,
      payload.Timestamp,
      payload.RobotName,
      payload.Status.Initialized,
      payload.Status.Running,
      payload.Status.Paused,
      payload.Status.WsViolation,
      payload.RobotPosition.X,
      payload.RobotPosition.Y,
      payload.RobotPosition.Z,
      payload.RobotPosition.W,
      payload.RobotTorque.T1,
      payload.RobotTorque.T2,
      payload.RobotTorque.T3,
      payload.RobotTorque.T4,
      payload.SpeedPercentage
    ];
  
    try {
      await pool.query(query, values);
      logger.info('Data inserted into db');
    } catch (error) {
      logger.error('Error inserting data into db:', error);
    }
  }