# MS3: APIs

This microservice was developed to connect to the database and publish securely information about the robots. This information is obtained from the database. 

## Objective

This microservice enable the APIs that will allow a user to obtain information about reall time statos of the robot, historical data and some calculations. 

## Features
- Connects to the PosgreSQL databas
- Enable 3 APIs
- Logs information and errors to monitor microservice status
- Automatically restarts in Docker if the script fails

## APIs

### Latest status
This API will give you the last updated status of the specified robot.
The structure for calling this API is:

    /robots/latest/robotname

And the example is 
    /robots/latest/HBOT


```bash
http://localhost:3000/robots/latest/HBOT
```

The response for this, will be the following JSON

```json
{
  "id": 133784,
  "version": "1.0.0",
  "timestamp": "2025-06-23T16:03:15.033Z",
  "robot_name": "HBOT",
  "is_initialized": false,
  "is_running": false,
  "is_paused": false,
  "has_violation": false,
  "position_x": 176.2543,
  "position_y": 206.382,
  "position_z": 0,
  "position_w": 0,
  "speed_percentage": 25,
  "torque_1": -1.4,
  "torque_2": 6.1,
  "torque_3": -7.2,
  "torque_4": 0
}
```

### Historical Data
This API will give you the historical data in a specific period of time. 
The structure for calling this API is:

```bash
/robots?from=2025-06-20T20:30:00Z&to=2025-06-20T20:31:00Z&robot_name=HBOT
```

As you can see, there are 3 parameters that the API requires. 
- from
- to
- robot_name

The response for this, will be the following JSON

```json
[
  {
    "id": 95078,
    "version": "1.0.0",
    "timestamp": "2025-06-20T20:30:00.106Z",
    "robot_name": "HBOT",
    "is_initialized": false,
    "is_running": false,
    "is_paused": false,
    "has_violation": false,
    "position_x": -600.0041,
    "position_y": 600.002,
    "position_z": 0,
    "position_w": 0,
    "speed_percentage": 25,
    "torque_1": 0,
    "torque_2": 0,
    "torque_3": -0.1,
    "torque_4": 0
  },
  {
    "id": 95082,
    "version": "1.0.0",
    "timestamp": "2025-06-20T20:30:00.607Z",
    "robot_name": "HBOT",
    "is_initialized": false,
    "is_running": false,
    "is_paused": false,
    "has_violation": false,
    "position_x": -600.004,
    "position_y": 600.0021,
    "position_z": 0,
    "position_w": 0,
    "speed_percentage": 25,
    "torque_1": -0.1,
    "torque_2": 0,
    "torque_3": -0.1,
    "torque_4": 0
  },
]
```
As you can see, the json received will contain all the rows that were captured in the database, for this specific robot, in this period of time (In this case, just as an example, just 2 rows are shown)

### Calculations
The last API will show some calculations for the robots. for now, the microservice is configured just to calculate statistics for a robot separing two different parts, assuming that PartA is being dropped to the right, and partB to the left.  

To call this API the structured is similar to the historical one, you will need to provide from, to, and robot name, as shown. 


``` bash
http://localhost:3000/robots/statistics/totalcount?from=2025-06-18T20:30:00Z&to=2025-06-18T20:51:10Z&robot_name=DR1
```

The JSON that will be returned, has the following structure.

```json
{
  "robot_name": "DR1",
  "from": "2025-06-18T20:30:00Z",
  "to": "2025-06-18T20:51:10Z",
  "total_time_seconds": 1270,
  "production": {
    "total_parts": {
      "Count": 358,
      "Parts_per_hour": "1014.80"
    },
    "PartA": {
      "Count": 179,
      "Parts_per_hour": 507.40157480315,
      "avg_cycle_time_seconds": "7.02"
    },
    "PartB": {
      "Count": 179,
      "Parts_per_hour": 507.40157480315,
      "avg_cycle_time_seconds": "7.02"
    },
    "Time": {
      "Running_seconds": "1254.64",
      "Paused_seconds": "0.00",
      "Violation_seconds": "0.00",
      "Idle_seconds": "105.02",
      "EffectiveRunningTime": "1149.62"
    }
  }
}
```

- **total_time_seconds:** Robot running status in true. 
- **total_parts.Count":** The sum of partA and partB sorted by the robot in the selected period of time
- **total_parts.Parts_per_hour**  Calculation based on the parts sorted in the selected period of time
- **PartA.Count:** Total parts produced in the selected period
- **PartA.Parts_per_hour:** Part A produced in this period of time
- **PartA.avg_cycle_time_seconds:** Average time that takes pick one partA and drop it in seconds. 
- **PartB.Count:** Total parts B produced in the selected period
- **PartB.Parts_per_hour:** Part B produced in this period of time
- **PartB.avg_cycle_time_seconds:** Average time that takes pick one partB and drop it in seconds. 
- **Time.Running_seconds:** Total running time in seconds based on the status running. 
- **Time.Paused_seconds:** Total paused time in seconds based on the status paused. 
- **Time.Violation_seconds:** Total violation time in seconds based on the violation status.
- **Time.Idle_seconds:** Total time that the robot was in Running status but not moving. 
- **Time.EffectiveRunningTime:** Total expected time according to period - Idle time=Effective running time. 

## Project Structure

- src
    - functions
        - functions.ts
        - logger.ts
    - helper
    - interfaces
        -interfaces.ts
    - types
    - routes
        - robots.ts
    - index.ts
- env.example
- Dockerfile
- docker-compose.yml
- README.md

## Getting Started

To run this microservice locally, connect to the IoT network and create a .env file with the required configuration based on your robot.

### 1. Clone the Repository

```bash
git clone https://github.com/conestogateam2/iot_team2.git

cd ms2-ingestion
```

### 2. Connect to the IoT Network
Ensure your computer is connected to the IoT network and that you can reach the MQTT broker and Database. 

### 3. .env Configuration
Create a .env file in the root directory with the following structure:

1. Update your credentials
2. Update your topic


```bash 
DB_USER=postgres
DB_PORT=3306
DB_HOST=localhost
DB_DATABASE=academy00
DB_PASSWORD=academy2024!
DB_TABLE=robot_data_team2
```

### 4. Run!

```bash
##Just first time
npm install
npm install typescript

## Run!
npm run dev
```

Once you've verified it works correctly, you can proceed to deploy the service.


## Deploy Microservice

### 1. Create a docker-compose.yml File

Here's an example you can use, updating the values based on your robot:


```bash
version: "3.8"

services:
  robot-monitor:
    image: ms2:latest
    container_name: robot-ingestion-app
    restart: unless-stopped
    environment:
      - MQTT_BROKER_URL=mqtt://192.168.0.211
      - MQTT_BROKER_PORT=1883
      - MQTT_BROKER_USERNAME=user
      - MQTT_BROKER_PASSWORD=pass
      - MQTT_TOPICS=m/conestoga/recycling/team2/line/+/robotEvent
      - DB_USER=postgres
      - DB_PORT=3306
      - DB_HOST=host.docker.internal
      - DB_DATABASE=academy00
      - DB_PASSWORD=academy2024!
      - DB_TABLE=robot_data_team2
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

```

> ⚠️ **Important:** Notice that for running in docker, the **DB_HOST** must be changed to **host.docker.internal** 

### 2. Deploy the Container

```bash
docker-compose up -d --build
```

> ⚠️ Note: You must be connected to the internet to build the container, and connected to the IoT network to run the service successfully.


### Monitoring & Logs
The service includes logging for:
- Validation errors
- Database query errors
- Connection errors

Logs are output to the console and saved in Docker logs. 



### Fault Tolerance
If the script encounters an error or crashes, Docker will automatically restart the container due to the restart: unless-stopped policy. This ensures continuous service availability without manual intervention.


## Authors 
- Juan Jimenez
- Magnus Eriksson
- Vitor Medeiros
- Yuvrajsinh Adajania






