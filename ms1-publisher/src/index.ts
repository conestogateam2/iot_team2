import dotenv from 'dotenv';
import mqtt from 'mqtt';
import {opcTagsArray } from './helper/opctags.js';
import {setupOpcUaConnection, tagValueMonitore, shutDown} from './functions/functions.js';
import logger from './functions/logger.js';


// Load environment variables from .env file
dotenv.config();

// Check if required environment variables for remote modeare set
let mqttUser = process.env.mqtt_username || '';
let mqttPassword = process.env.mqtt_password || '';
let mqttPort: number = parseInt(process.env.mqtt_port || '1883', 10);
let mqttHost: string = process.env.mqtt_Host || '';




logger.info(` Connecting to MQTT -> -host: ${mqttHost} -port: ${mqttPort} -username: ${mqttUser}`,);

// MQTT client setup
const MQTT_CLIENT: mqtt.MqttClient = mqtt.connect(`${process.env.mqtt_Host}`, {
  port: mqttPort,
  username: mqttUser,
  password: mqttPassword,
  clientId: `ms1-publisher-${Math.floor(100000 + Math.random() * 900000)}`,
  rejectUnauthorized: false,
});

process.on('uncaughtException', (err) => {
  logger.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});

// -----------------------------------------------------------------Main
const main = async () => {
  try {
    // MQTT Connection
    logger.info('----------------Connecting to MQTT broker...');
    MQTT_CLIENT.on('connect', () => {
      logger.info('Connected to MQTT broker 😊');
    });
    MQTT_CLIENT.on('error', async (err: Error) => {
      logger.error('Error connecting to MQTT broker:', err);
    });


    // Setup OPC Connection
    const {
      opcclient: opcclient,
      opcsession: opcsession,
      opcsubscription: opcsubscription,
    } = await setupOpcUaConnection(process.env.opcendPointURL ?? '');

    logger.info('OPC UA Connection established 😊');
    // Tag Monitor

    const opcTag = opcTagsArray.map(row => row[0]);
    const variableName = opcTagsArray.map(row => row[1]);

    tagValueMonitore(opcsubscription, variableName, opcTag,  MQTT_CLIENT);

    //Handle shutdown signals
    const shutdown = async () => {
      await shutDown(opcclient, opcsession, opcsubscription, MQTT_CLIENT);
      process.exit(0);
    };
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logger.error('Error during OPC UA setup:', error);
    process.exit(1);
  }
};

main();
