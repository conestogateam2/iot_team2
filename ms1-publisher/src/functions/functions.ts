import {
  AttributeIds,
  ClientMonitoredItem,
  ClientSubscription,
  DataValue,
  OPCUAClient,
  ReadValueIdOptions,
  MonitoringParametersOptions,
  ClientSession,
  TimestampsToReturn,
} from 'node-opcua-client';
import pTimeout from 'p-timeout';
import mqtt from 'mqtt';
import dotenv from 'dotenv';
import {robotPayload} from '../interfaces/interfaces.js';
import logger from './logger.js';


let freq_ms: number = parseInt(process.env.FREQ_MS || '1000', 10);



const keyValueObj: { [key: string]: any } = {};
let payload: robotPayload;

// Load environment variables from .env file
dotenv.config();
let RobotName = process.env.robot_name || '';

//-------------------------------------------------------------------------Get Local Time
export function getLocalTimeInISOFormat(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

  // Format the local time in ISO 8601
  const localISOString = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;

  return localISOString;
}
//-------------------------------------------------------------------------MQTT Publish
const publishMessage = (
  mqttclient: mqtt.MqttClient,
  topic: string,
  messageObject: Record<string, any>,
) => {
  const message = JSON.stringify(messageObject);
  mqttclient.publish(topic, message, (error?: Error ) => {

    if (error) {
      logger.error('Publish error:', error);
    } else {
      logger.info(`Data published👍: RobotEvent: ${message} `);

    }
  });
};
//-------------------------------------------------------------------------Opc Connection
/**
 * Connects to the OPC UA server, creates a session, and sets up a subscription.
 * @param {string} endpointURL - The URL of the OPC UA server endpoint.
 * @returns {Promise<{ opcclient: OPCUAClient; opcsession: ClientSession; opcsubscription: ClientSubscription}>} - The created client, session, and subscription.
 * @throws Will throw an error if any of the operations fail.
 */
export async function setupOpcUaConnection(
  endpointURL: string,
): Promise<{ opcclient: OPCUAClient; opcsession: ClientSession; opcsubscription: ClientSubscription }> {
  const opccreateClient = () => OPCUAClient.create({ endpointMustExist: false });
  const opcclient = opccreateClient();

  // Connect to OPC UA server
  try {
    await pTimeout(opcclient.connect(endpointURL), { milliseconds: 8000 });
    logger.info('Connected to OPC UA server.');
  } catch (error) {
    logger.error('Failed to connect to OPC UA server:', error);
    process.exit(1);
  }

  // Create session
  let opcsession: ClientSession;
  try {
    opcsession = await pTimeout(opcclient.createSession(), { milliseconds: 8000 });
    logger.info('OPC Session created.');
  } catch (error) {
    logger.error('Failed to create Opc session:', error);
    process.exit(1);
  }

  let opcsubscription: ClientSubscription;
  try {
    opcsubscription = ClientSubscription.create(opcsession, {
      requestedPublishingInterval: 500,
      requestedLifetimeCount: 2400,
      requestedMaxKeepAliveCount: 10,
      maxNotificationsPerPublish: 0,
      publishingEnabled: true,
      priority: 0,
    });

    opcsubscription
      .on('started', function () {
        logger.info('Opc Subscription started');
      })
      .on('keepalive', function () {
        logger.info('Alive ⏳');
      });
  } catch (error) {
    logger.error('Failed to create Opc subscription:', error);
    process.exit(1);
  }

  return { opcclient: opcclient, opcsession: opcsession, opcsubscription: opcsubscription };
}


//-------------------------------------------------------------------------Parse Payload
function parsePayload(keyValueObj: any): robotPayload {
  return {
    Version: '1.0.0',
    Timestamp: getLocalTimeInISOFormat(),
    RobotName: RobotName,
    Status: {
      Initialized: keyValueObj.Initialized ?? false,
      Running: keyValueObj.Running ?? false,
      Paused: keyValueObj.Paused ?? false,
      WsViolation: keyValueObj.WsViolation ?? false,
    },
    SpeedPercentage: keyValueObj.Speed ?? -1,
    RobotPosition: 
      {
        X: keyValueObj.RobotPositionX ?? -1,
        Y: keyValueObj.RobotPositionY ?? -1,
        Z: keyValueObj.RobotPositionZ ?? -1,
        W: keyValueObj.RobotPositionW ?? -1,
      },
    RobotTorque:
    {
      T1: keyValueObj.T1 ?? -1,
      T2: keyValueObj.T2 ?? -1,
      T3: keyValueObj.T3 ?? -1,
      T4: keyValueObj.T4 ?? -1,
    }

  };
}




//-------------------------------------------------------------------------Tag Value Monitor

export const tagValueMonitore = (
  subscription: ClientSubscription,
  tags: string[],
  opctags: string[],
  mqttclient: mqtt.MqttClient
) => {
  const parameters: MonitoringParametersOptions = {
    samplingInterval: 100,
    discardOldest: true,
    queueSize: 10,
  };

  const baseNodeId = process.env.BASE_NODE_ID || '';
  const Topic = process.env.mqtt_topic || '';

  tags.forEach((tag, index) => {
    const opctag = opctags[index];
    const nodeId = `${baseNodeId}${opctag}`;

    const itemToMonitor: ReadValueIdOptions = {
      nodeId,
      attributeId: AttributeIds.Value,
    };

    const tagvalue = ClientMonitoredItem.create(subscription, itemToMonitor, parameters);

    tagvalue.on('changed', (dataValue: DataValue) => {
      let value;
      switch (dataValue.value.dataType) {
        case 1:
          value = dataValue.value.value === true;
          break;
        case 10:
        case 11:
          value = parseFloat(dataValue.value.value.toFixed(6));
          break;
        case 12:
          value = dataValue.value.value.trim();
          break;
        default:
          value = dataValue.value.value;
      }
      keyValueObj[tag] = value;
    });
  });

  // Publishing every freq_ms
  setInterval(() => {
      payload = parsePayload(keyValueObj);
      publishMessage(mqttclient, Topic, payload);

  }, freq_ms);
};

//-------------------------------------------------------------------------shutDown
export const shutDown = async (
  opcclient: OPCUAClient,
  opcsession: ClientSession,
  opcsubscription: ClientSubscription,
  mqttclient: mqtt.MqttClient,
) => {
  logger.info('Now terminating OPC subscription');
  await opcsubscription.terminate();
  logger.info('Subscription terminated');
  logger.info('Closing session');
  await opcsession.close();
  logger.info('Session terminated.');
  logger.info('Disconnecting from OPC UA server');
  await opcclient.disconnect();
  logger.info('Disconnected from OPC UA server.');
  logger.info('Closing MQTT client');
  mqttclient.end();
  process.exit(0);
};



