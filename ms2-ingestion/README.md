# Devices Connected

This microservice is intended to measure the quantity of payloads being published in a division, the total number of topics, and the active topics over a period of time.


# Env

The following example shows the env variables required to run the script

```bash
MQTT_BROKER_URL="mqtts://div-1234.magna.global"
MQTT_BROKER_PORT=8883
MQTT_BROKER_USERNAME="username"
MQTT_BROKER_PASSWORD="pass"
MQTT_TOPICS="m/div/#"
DIVISION="DIV"
DURATION_MINUTES=20
EXPIRY_TIME_MINUTES=2
```

# Docker Compose for run multiple divisions

The following example shows how to create a Docker Compose file to make it easier to run the script for multiple divisions simultaneously.

It is possible to add as many divisions as needed.

```bash
version: '3'
services:
  app1:
    image: condev:latest
    container_name: condev_grx  
    environment:
      - SELECTED_BROKER_INDEX=0
      - MQTT_BROKER_URL=mqtt://div1.intranet.global.com
      - MQTT_BROKER_PORT=1883
      - MQTT_BROKER_USERNAME=user
      - MQTT_BROKER_PASSWORD=pass
      - MQTT_TOPICS=m/#
      - DIVISION=div1

    
  app2:
    image: condev:latest
    container_name: condev_ath  
    environment:
      - SELECTED_BROKER_INDEX=1
      - MQTT_BROKER_URL=mqtts://ath-197-uns.magna.global
      - MQTT_BROKER_PORT=8883
      - MQTT_BROKER_USERNAME=username
      - MQTT_BROKER_PASSWORD=pass
      - MQTT_TOPICS=m/div2/#
      - DIVISION=DIV2
```

# Copy Files from the Containers to Your Endpoint

The microservice generates two CSV files: one is the list of total topics and how many messages they have received, and the other shows the total topics, active topics, and total messages over time.

These files can be copied from the Docker container using the following instruction.

```bash
docker cp devcon_div:/app/csv/. ./csvfiles
```

**./csvfiles** is the folder where all the files will be copied and **devcon_div** is the name of the source container


# Versions
- 1.0.0 - Initial Version

# Author(s)
- `Juan Jiménez (juan.jimenez@magna.com)`
- `Rodolfo P Martinez (rodolfo.martinez1@magna.com)`


