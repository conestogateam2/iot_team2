//interfaces.ts
import * as mqtt from 'mqtt'; // Import the mqtt type if needed

export interface BrokerClient {
  client: mqtt.MqttClient;
  name: string;
  topics?: string[];
}

export interface TopicInfo {
  count: number;         // Number of payloads received
  lastTimestamp: number; // Timestamp of the last message received
}
export interface robotPayload {
  Version: string;
  Timestamp: string;
  RobotName: string;
  Status: iStatus;
  SpeedPercentage: number;
  RobotPosition: iRobotPosition;
  RobotTorque: iRobotTorque
}

interface iRobotPosition {
  X: number;
  Y: number;
  Z: number;
  W: number;
}

interface iRobotTorque{
  T1: number,
  T2: number,
  T3: number,
  T4: number,
}

interface iStatus {
  Initialized: boolean
  Running: boolean
  Paused: boolean
  WsViolation: boolean
}


export interface iRobotSchema{
  version: string,
  timestamp: string,
  robot_name: string,
  is_initialized: boolean,
  is_running: boolean,
  is_paused: boolean,
  has_violation: boolean,
  position_x: number,
  position_y: number,
  position_z: number,
  position_w: number,
  torque_1: number,
  torque_2: number,
  torque_3: number,
  torque_4: number,
  speed_percentage: number
}


