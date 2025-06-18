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
  Status: string;
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


