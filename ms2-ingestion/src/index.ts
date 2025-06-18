import * as mqtt from 'mqtt'; 
import { getFormattedTimestamp } from './functions/functions.js'; 
import dotenv from 'dotenv';
import logger from './functions/logger.js';

dotenv.config();

const mqttHost=process.env.MQTT_BROKER_URL || 'mqtt://localhost';
const mqttPort = parseInt(process.env.MQTT_BROKER_PORT || '1883', 10);
const mqttUsername=process.env.MQTT_BROKER_USERNAME || 'admin';
const mqttPassword=process.env.MQTT_BROKER_PASSWORD || 'admin';
const mqttTopic=process.env.MQTT_TOPICS || 'm/#';
const divisionName=process.env.DIVISION || 'GRX';
const duration = parseInt(process.env.DURATION_MINUTES || '30', 10);
const expiry = parseInt(process.env.EXPIRY_TIME_MINUTES || '2', 10);

logger.info(`Division Name: ${divisionName}`);
logger.info(`MQTT Broker URL: ${mqttHost}`);
logger.info(`MQTT Broker Port: ${mqttPort}`);
logger.info(`MQTT Broker Username: ${mqttUsername}`);
logger.info(`MQTT Topic: ${mqttTopic}`);

//Variables to check connection state
let isConnected = false;

const client = mqtt.connect(mqttHost, {
  username: mqttUsername,
  password: mqttPassword,
  port: mqttPort,
  clientId: `com.magna.csb.condev-${Math.floor(100000 + Math.random() * 900000)}`,

});

    // Subscribe to a list of topics for this client
    if (mqttTopic.length > 0) {
      client.subscribe(mqttTopic, (err) => {
        if (err) {
          logger.error(`Subscription error for topic ${mqttTopic} on ${divisionName}: ${err.message}`);
        } else {
          logger.info(`Subscribed to ${mqttTopic} on ${divisionName}`);
        }
      });
    } else {
      // If topic not specified 
      client.subscribe('m/#', (err) => {
        if (err) {
          logger.error(`Subscription error for topic '#' on ${divisionName}: ${err.message}`);
        } else {
          logger.info(`Subscribed to '#' on ${divisionName}`);
        }
      });
    }

      client.on('connect', () => {
    isConnected = true;
    logger.info(`MQTT_CLIENT_CONNECTED { Broker: ${divisionName} Username: ${mqttUsername}}`);
   

  });

  client.on('error', (error) => {
    isConnected = false;
    logger.error(`MQTT_CLIENT_ERROR { Broker: ${divisionName} Username: ${mqttUsername} Error: ${error.message}}`);
  });

  client.on('reconnect', () => {
    isConnected = false;
    logger.error(`MQTT_CLIENT_RECONNECTING { Broker: ${divisionName} Username: ${mqttUsername}}`);
  });

  client.on('offline', () => {
    isConnected = false;
    logger.error(`MQTT_CLIENT_OFFLINE { Broker: ${divisionName} Username: ${mqttUsername}}`);
  });
  
  client.on('close', () => {
    isConnected = false;
    logger.error(`MQTT_CLIENT_CLOSED { Broker: ${divisionName} Username: ${mqttUsername}}`);
  });

// Manage messaging
client.on('message', (topic: string, payload: Buffer) => {
  const timestamp = Date.now();
  const formattedTimestamp = getFormattedTimestamp();
  const data: string = `${formattedTimestamp} ${divisionName} -> ${topic} -> ${payload.toString()}`;

  console.log(data);
  

});




