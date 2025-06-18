import * as mqtt from 'mqtt'; 
import { getFormattedTimestamp, insertRobotData } from './functions/functions.js'; 
import dotenv from 'dotenv';
import logger from './functions/logger.js';
import {Pool} from 'pg';



dotenv.config();

const mqttHost=process.env.MQTT_BROKER_URL || 'mqtt://localhost';
const mqttPort = parseInt(process.env.MQTT_BROKER_PORT || '1883', 10);
const mqttUsername=process.env.MQTT_BROKER_USERNAME || 'admin';
const mqttPassword=process.env.MQTT_BROKER_PASSWORD || 'admin';
const mqttTopic=process.env.MQTT_TOPICS || 'm/#';

const dbUser=process.env.DB_USER || 'user';
const dbHost=process.env.DB_HOST || 'localhost';
const dbDatabase=process.env.DB_DATABASE || 'db';
const dbPassword=process.env.DB_PASSWORD || 'pass';
const dbPort=parseInt(process.env.DB_PORT || '5432', 10);
const dbTable=process.env.DB_TABLE || 'test_table';


logger.info(`MQTT Broker URL: ${mqttHost}`);
logger.info(`MQTT Broker Port: ${mqttPort}`);
logger.info(`MQTT Broker Username: ${mqttUsername}`);
logger.info(`MQTT Topic: ${mqttTopic}`);

//Variables to check connection state
let isConnected = false;

const pool = new Pool({
  user: dbUser,
  host: dbHost,
  database: dbDatabase,
  password: dbPassword,
  port: dbPort
})

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
          logger.error(`Subscription error for topic ${mqttTopic}: ${err.message}`);
        } else {
          logger.info(`Subscribed to ${mqttTopic}`);
        }
      });
    } else {
      // If topic not specified 
      client.subscribe('m/#', (err) => {
        if (err) {
          logger.error(`Subscription error for topic '#' on: ${err.message}`);
        } else {
          logger.info(`Subscribed to '#'`);
        }
      });
    }

      client.on('connect', () => {
    isConnected = true;
    logger.info(`MQTT_CLIENT_CONNECTED {Username: ${mqttUsername}}`);
   

  });

  client.on('error', (error) => {
    isConnected = false;
    logger.error(`MQTT_CLIENT_ERROR {Username: ${mqttUsername} Error: ${error.message}}`);
  });

  client.on('reconnect', () => {
    isConnected = false;
    logger.error(`MQTT_CLIENT_RECONNECTING {Username: ${mqttUsername}}`);
  });

  client.on('offline', () => {
    isConnected = false;
    logger.error(`MQTT_CLIENT_OFFLINE {Username: ${mqttUsername}}`);
  });
  
  client.on('close', () => {
    isConnected = false;
    logger.error(`MQTT_CLIENT_CLOSED {Username: ${mqttUsername}}`);
  });

// Manage messaging
client.on('message', (topic: string, payload: Buffer) => {
  const timestamp = Date.now();
  const formattedTimestamp = getFormattedTimestamp();
  const data: string = `${formattedTimestamp} -> ${topic} -> ${payload.toString()}`;
  insertRobotData(JSON.parse(payload.toString()),pool, dbTable);
  console.log(data);
  

});



