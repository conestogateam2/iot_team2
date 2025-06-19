export interface iRobotSchema {
    id: number;
    version: string;
    timestamp: string;
    robot_name: string;
    is_initialized: boolean;
    is_running: boolean;
    is_paused: boolean;
    has_violation: boolean;
    position_x: number;
    position_y: number;
    position_z: number;
    position_w: number;
    torque_1: number;
    torque_2: number;
    torque_3: number;
    torque_4: number;
    speed_percentage: number;
  }
  