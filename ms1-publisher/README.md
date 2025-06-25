# MS1: Robot OPC-UA to MQTT Publisher

This microservice was developed to connect to any robot in the Conestoga Smart Center using OPC UA and publish data to an MQTT Broker following the UNS (Unified Namespace) standard.

## Objective

The objective of this microservice is to obtain and publish real-time data (raw data) representing the current status of the robot, including position, torque, and status bits.

The publishing interval can be configured as needed. For real-time monitoring, a recommended interval is between 100 to 300 ms. For simple data logging, 1 second is sufficient.

## Features
- Connects to OPC UA server to extract robot data
- Publishes data to an MQTT broker using UNS-compliant topics
- Supports TLS and CA certificate for secure MQTT connections
- Configurable publishing interval
- Configurable OPC UA tags

## Project Structure

- src
    - functions
        - functions.ts
        - logger.ts
    - helper
        -opctags.ts
    - interfaces
        -interfaces.ts
    - types
    - index.ts
- env.example
- Dockerfile
- docker-compose.yml
- README.md

## Getting Started

To run this microservice on your local machine, connect to the IoT network and create a .env file with the necessary configuration based on your robot.

### 1. Clone the Repository

```bash
git clone https://github.com/conestogateam2/iot_team2.git

cd ms1-publisher
```

### 2. Connect to the IoT Network
Ensure your computer is connected to the same network and you can ping the opc server and mqtt broker.



### 3. .env Configuration
Create a .env file in the root directory with the following structure:

```bash 
opcendPointURL = 'opc.tcp://192.168.0.212:26543'

mqtt_Host="mqtt://192.168.0.211"
mqtt_username="user"
mqtt_password="pass"
mqtt_topic = "m/conestoga/team2/robotEvent"
mqtt_port=1883

FREQ_MS=1000
robot_name="DR1"

ROBOT_SPEED="ns=1;s=HMI_GVL.M.Rob1.SPEEDPERCENTAGE"
ROBOT_X="ns=1;s=HMI_GVL.M.Rob1.ROBOTPOS.X"
ROBOT_Y="ns=1;s=HMI_GVL.M.Rob1.ROBOTPOS.Y"
ROBOT_Z="ns=1;s=HMI_GVL.M.Rob1.ROBOTPOS.Z"
ROBOT_W="ns=1;s=HMI_GVL.M.Rob1.ROBOTPOS.W"

ROBOT_TORQUE1="ns=1;s=HMI_GVL.M.Rob1.MACTTORQUE[1]"
ROBOT_TORQUE2="ns=1;s=HMI_GVL.M.Rob1.MACTTORQUE[2]"
ROBOT_TORQUE3="ns=1;s=HMI_GVL.M.Rob1.MACTTORQUE[3]"
ROBOT_TORQUE4="ns=1;s=HMI_GVL.M.Rob1.MACTTORQUE[4]"

ROBOT_INITIALIZED ="ns=1;s=HMI_GVL.M.Rob1.INITIALIZED"
ROBOT_RUNNING="ns=1;s=HMI_GVL.M.Rob1.RUNNING"
ROBOT_VIOLATION="ns=1;s=HMI_GVL.M.Rob1.WSVIOLATION"
ROBOT_PAUSED="ns=1;s=HMI_GVL.M.Rob1.PAUSED"
```
> ⚠️ **Important:** Make sure to update the robot name, MQTT topic and OPC UA tags according to your specific robot setup. 

### 4. Run!

```bash
##Just first time
npm install
npm install typescript

## Run!
npm run start
```

Once that you tested and everything is running correctly, stop and deploy!

## Deploy Microservice

### 1. Create a docker-compose.yml File

Here's an example you can use, updating the values based on your robot:


```bash
version: "3.8"

services:
  robot-monitor:
    image: ms1:latest  
    container_name: robot-dr1
    restart: unless-stopped
    environment:
      - opcendPointURL=opc.tcp://192.168.0.212:26543
      - mqtt_Host=mqtt://192.168.0.211
      - mqtt_username=user
      - mqtt_password=pass
      - mqtt_topic=m/conestoga/recycling/team2/line/recyclingLine/robotEvent
      - mqtt_port=1883
      - FREQ_MS=300
      - robot_name=DR1
      - ROBOT_SPEED=ns=1;s=HMI_GVL.M.Rob1.SPEEDPERCENTAGE
      - ROBOT_X=ns=1;s=HMI_GVL.M.Rob1.ROBOTPOS.X
      - ROBOT_Y=ns=1;s=HMI_GVL.M.Rob1.ROBOTPOS.Y
      - ROBOT_Z=ns=1;s=HMI_GVL.M.Rob1.ROBOTPOS.Z
      - ROBOT_W=ns=1;s=HMI_GVL.M.Rob1.ROBOTPOS.W
      - ROBOT_TORQUE1=ns=1;s=HMI_GVL.M.Rob1.MACTTORQUE[1]
      - ROBOT_TORQUE2=ns=1;s=HMI_GVL.M.Rob1.MACTTORQUE[2]
      - ROBOT_TORQUE3=ns=1;s=HMI_GVL.M.Rob1.MACTTORQUE[3]
      - ROBOT_TORQUE4=ns=1;s=HMI_GVL.M.Rob1.MACTTORQUE[4]
      - ROBOT_INITIALIZED=ns=1;s=HMI_GVL.M.Rob1.INITIALIZED
      - ROBOT_RUNNING=ns=1;s=HMI_GVL.M.Rob1.RUNNING
      - ROBOT_VIOLATION=ns=1;s=HMI_GVL.M.Rob1.WSVIOLATION
      - ROBOT_PAUSED=ns=1;s=HMI_GVL.M.Rob1.PAUSED
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  robot-monitor2:
    image: ms1:latest  
    container_name: robot-dr2
    restart: unless-stopped
    environment:
      - opcendPointURL=opc.tcp://192.168.0.212:26543
      - mqtt_Host=mqtt://192.168.0.211
      - mqtt_username=user
      - mqtt_password=pass
      - mqtt_topic=m/conestoga/recycling/team2/line/recyclingLine2/robotEvent
      - mqtt_port=1883
      - FREQ_MS=300
      - robot_name=DR2
      - ROBOT_SPEED=ns=1;s=HMI_GVL.M.Rob2.SPEEDPERCENTAGE
      - ROBOT_X=ns=1;s=HMI_GVL.M.Rob2.ROBOTPOS.X
      - ROBOT_Y=ns=1;s=HMI_GVL.M.Rob2.ROBOTPOS.Y
      - ROBOT_Z=ns=1;s=HMI_GVL.M.Rob2.ROBOTPOS.Z
      - ROBOT_W=ns=1;s=HMI_GVL.M.Rob2.ROBOTPOS.W
      - ROBOT_TORQUE1=ns=1;s=HMI_GVL.M.Rob2.MACTTORQUE[1]
      - ROBOT_TORQUE2=ns=1;s=HMI_GVL.M.Rob2.MACTTORQUE[2]
      - ROBOT_TORQUE3=ns=1;s=HMI_GVL.M.Rob2.MACTTORQUE[3]
      - ROBOT_TORQUE4=ns=1;s=HMI_GVL.M.Rob2.MACTTORQUE[4]
      - ROBOT_INITIALIZED=ns=1;s=HMI_GVL.M.Rob2.INITIALIZED
      - ROBOT_RUNNING=ns=1;s=HMI_GVL.M.Rob2.RUNNING
      - ROBOT_VIOLATION=ns=1;s=HMI_GVL.M.Rob2.WSVIOLATION
      - ROBOT_PAUSED=ns=1;s=HMI_GVL.M.Rob2.PAUSED
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  robot-monitor3:
    image: ms1:latest  
    container_name: robot-hbot
    restart: unless-stopped
    environment:
      - opcendPointURL=opc.tcp://192.168.0.212:26543
      - mqtt_Host=mqtt://192.168.0.211
      - mqtt_username=user
      - mqtt_password=pass
      - mqtt_topic=m/conestoga/recycling/team2/line/recyclingLine0/robotEvent
      - mqtt_port=1883
      - FREQ_MS=300
      - robot_name=HBOT
      - ROBOT_SPEED=ns=1;s=HMI_GVL.M.Rob3.SPEEDPERCENTAGE
      - ROBOT_X=ns=1;s=HMI_GVL.M.Rob3.ROBOTPOS.X
      - ROBOT_Y=ns=1;s=HMI_GVL.M.Rob3.ROBOTPOS.Y
      - ROBOT_Z=ns=1;s=HMI_GVL.M.Rob3.ROBOTPOS.Z
      - ROBOT_W=ns=1;s=HMI_GVL.M.Rob3.ROBOTPOS.W
      - ROBOT_TORQUE1=ns=1;s=HMI_GVL.M.Rob3.MACTTORQUE[1]
      - ROBOT_TORQUE2=ns=1;s=HMI_GVL.M.Rob3.MACTTORQUE[2]
      - ROBOT_TORQUE3=ns=1;s=HMI_GVL.M.Rob3.MACTTORQUE[3]
      - ROBOT_TORQUE4=ns=1;s=HMI_GVL.M.Rob3.MACTTORQUE[4]
      - ROBOT_INITIALIZED=ns=1;s=HMI_GVL.M.Rob3.INITIALIZED
      - ROBOT_RUNNING=ns=1;s=HMI_GVL.M.Rob3.RUNNING
      - ROBOT_VIOLATION=ns=1;s=HMI_GVL.M.Rob3.WSVIOLATION
      - ROBOT_PAUSED=ns=1;s=HMI_GVL.M.Rob3.PAUSED
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"


```

### 2. Deploy the Container

```bash
docker-compose up -d --build
```

> ⚠️ Note: You must be connected to the internet to build the container, and connected to the IoT network to run the service successfully.


## Payload
The JSON will be published with the following structure:

```json
{
  "Version": "1.0.0",
  "Timestamp": "2025-06-23T16:35:50.147Z",
  "RobotName": "DR1",
  "Status": {
    "Initialized": false,
    "Running": false,
    "Paused": false,
    "WsViolation": false
  },
  "SpeedPercentage": 25,
  "RobotPosition": {
    "X": 77.875,
    "Y": 82.3957,
    "Z": -95.3786,
    "W": 0
  },
  "RobotTorque": {
    "T1": -15.8,
    "T2": -13.5,
    "T3": -10.9,
    "T4": 3.3
  }
}

```

### Monitoring & Logs
The service includes logging for:
- OPC connection
- Validation errors
- MQTT connection status
- MQTT Publishing messages

Logs are output to the console and saved in Docker logs. You can view them using:


### Fault Tolerance
If the script encounters an error or crashes, Docker will automatically restart the container due to the restart: unless-stopped policy. This ensures continuous service availability without manual intervention.


## Final Notes
- Make sure the .env and Docker Compose configurations match the setup of your robot
- All OPC UA node IDs should be validated before deployment
- For production, ensure MQTT credentials and connection are secured via TLS/SSL

## Authors 
- Juan Jimenez
- Magnus Eriksson
- Vitor Medeiros
- Yuvrajsinh Adajania






