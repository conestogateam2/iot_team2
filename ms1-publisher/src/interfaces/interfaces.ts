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

