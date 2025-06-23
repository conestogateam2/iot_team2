# MS2: Ingestion app

This microservice was developed to catch all robotEvent payloads and store them in the database.

## Objective

This microservice subscribes to all robotEvent messages using a wildcard (+). This allows it to capture payloads from all robots publishing under the same topic structure.

The microservice validates the data and ingests it into the database.

## Features
- Subscribes to MQTT topics with wildcard support
- Connects to a PostgreSQL database
- Validates and ingests data
- Logs information and errors to monitor microservice status
- Automatically restarts in Docker if the script fails
- A single instance handles ingestion for all robots

## Project Structure

- src
    - functions
        - functions.ts
        - logger.ts
    - helper
    - interfaces
        -interfaces.ts
    - types
    - index.ts
- env.example
- Dockerfile
- docker-compose.yml
- README.md

## Getting Started

To run this microservice locally, connect to the IoT network and create a .env file with the required configuration based on your robot.

### 1. Connect to the IoT Network
Ensure your computer is connected to the IoT network and that you can reach the MQTT broker and Database. 

### 2. Clone the Repository

```bash
git clone https://github.com/conestogateam2/iot_team2.git

cd ms2-ingestion
```

### 3. .env Configuration
Create a .env file in the root directory with the following structure:

1. Update your credentials
2. Update your topic


```bash 
MQTT_BROKER_URL=mqtt://192.168.0.211
MQTT_BROKER_PORT=1883
MQTT_BROKER_USERNAME=""
MQTT_BROKER_PASSWORD=""
MQTT_TOPICS=m/conestoga/recycling/team2/line/+/robotEvent

DB_USER=postgres
DB_PORT=3306
DB_HOST=localhost
DB_DATABASE=academy00
DB_PASSWORD=academy2024!
DB_TABLE=robot_data_team2
```
### 4. Database Configuration
If the table doesn't exist, run the following SQL script in pgAdmin:

```sql
-- Table: public.robot_data_team2

-- DROP TABLE IF EXISTS public.robot_data_team2;

CREATE TABLE IF NOT EXISTS public.robot_data_team2
(
    id integer NOT NULL DEFAULT nextval('robot_data_team2_id_seq'::regclass),
    version text COLLATE pg_catalog."default",
    "timestamp" timestamp with time zone,
    robot_name text COLLATE pg_catalog."default",
    is_initialized boolean,
    is_running boolean,
    is_paused boolean,
    has_violation boolean,
    position_x real,
    position_y real,
    position_z real,
    position_w real,
    speed_percentage real,
    torque_1 real,
    torque_2 real,
    torque_3 real,
    torque_4 real,
    CONSTRAINT robot_data_team2_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.robot_data_team2
    OWNER to postgres;

```


### 5. Run!

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


## Payload
The JSON received must have the following configuration

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
- Incoming messages
- Validation errors
- Database insert operations
- MQTT connection status

Logs are output to the console and saved in Docker logs. You can view them using:

```bash
docker logs -f robot-ingestion-app
```

### Fault Tolerance
If the script encounters an error or crashes, Docker will automatically restart the container due to the restart: unless-stopped policy. This ensures continuous service availability without manual intervention.

### Validate Data Ingestion
To check if data is being ingested, run the following query in pgAdmin:

```sql
SELECT * FROM public.robot_data_team2
ORDER BY id DESC
LIMIT 100;
```


## Authors 
- Juan Jimenez
- Magnus Eriksson
- Vitor Medeiros
- Yuvrajsinh Adajania






