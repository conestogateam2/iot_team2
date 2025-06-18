// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

export const opcTagsArray = 
  [
    //Analogs
    [process.env.ROBOT_SPEED || '', 'Speed'],
    [process.env.ROBOT_X || '', 'RobotPositionX'],
    [process.env.ROBOT_Y || '', 'RobotPositionY'],
    [process.env.ROBOT_Z || '', 'RobotPositionZ'],
    [process.env.ROBOT_W || '', 'RobotPositionW'],

    [process.env.ROBOT_TORQUE1 || '', 'T1'],
    [process.env.ROBOT_TORQUE2 || '', 'T2'],
    [process.env.ROBOT_TORQUE3 || '', 'T3'],
    [process.env.ROBOT_TORQUE4 || '', 'T4'],

    //Status Tags
    [process.env.ROBOT_INITIALIZED || '','Initialized'],
    [process.env.ROBOT_RUNNING || '','Running'],
    [process.env.ROBOT_VIOLATION || '','WsViolation'],
    [process.env.ROBOT_PAUSED || '','Paused'],


];
