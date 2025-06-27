import * as fs from "fs";
import * as path from "path";
import * as mqtt from "mqtt";
import pg from "pg";

let config: any;
let dbclient: pg.Client;

function readFileAsJSON(fname: string): any {
  return JSON.parse(fs.readFileSync(fname).toString());
}

function setConfigurationFilename(fname: string): string {
  return path.join(__dirname, "..", fname);
}

async function processMessageReceived(topic: string, message: Buffer) {
  console.log(`Recv: ${message.toString()} on topic: ${topic}`);

  try {
    const payload = JSON.parse(message.toString());

    let timestamp = payload.timestamp || new Date().toISOString();
    const deviceid = topic;
    const metric = payload.metric || "unknown_metric";
    const value = Number(payload.value);

    const sql = `INSERT INTO telemetry (timestamp, deviceid, metric, value) VALUES ($1, $2, $3, $4)`;
    const values = [timestamp, deviceid, metric, value];

    await dbclient.query(sql, values);

    console.log(`Inserted telemetry data: timestamp=${timestamp}, deviceid=${deviceid}, metric=${metric}, value=${value}`);
  } catch (err) {
    console.error("Error processing message:", err);
  }
}

async function main() {
  try {
    const configFileName = setConfigurationFilename("config.json");
    config = readFileAsJSON(configFileName);

    let baseTopic = config.mqtt.baseTopic;
    if (!baseTopic.endsWith("/")) {
      baseTopic += "/";
    }

    const url = `${config.mqtt.brokerUrl}:${config.mqtt.mqttPort}`;
    console.log("Connecting to MQTT broker at URL:", url);

    // Connect to MQTT broker
    const mqttClient = mqtt.connect(url);

    // Setup PostgreSQL client
    dbclient = new pg.Client(config.sql_config);
    console.log("Database client created");

    // Connect to database
    await dbclient.connect();
    console.log("Connected to PostgreSQL database");

    // Create telemetry table if not exists
    const sqlCommand = fs.readFileSync('./sql/setup_create.txt').toString();
    await dbclient.query(sqlCommand);
    console.log("Telemetry table ensured");

    // === INSERTING A TEST ROW INTO TELEMETRY TABLE ===
    const d = new Date();
    const ts = d.toISOString(); // ISO timestamp
    const deviceid = "test_device";
    const metric = "PLCtag";
    const value = 555.55;
    
    const insertSql = `
      INSERT INTO telemetry (timestamp, deviceid, metric, value)
      VALUES ($1, $2, $3, $4)
    `;
    
    await dbclient.query(insertSql, [ts, deviceid, metric, value]);
    console.log(`Inserted test row: timestamp=${ts}, deviceid=${deviceid}, metric=${metric}, value=${value}`);

    // Subscribe to MQTT topic on connect
    mqttClient.on("connect", () => {
      console.log("MQTT connected!");
      const topic = baseTopic + "#";
      mqttClient.subscribe(topic, (err) => {
        if (err) {
          console.error("Subscription error:", err);
        } else {
          console.log("Subscribed to topic:", topic);
        }
      });
    });

    // Process received MQTT messages
    mqttClient.on("message", (topic, message) => {
      processMessageReceived(topic, message);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log("Shutting down gracefully...");
      try {
        await dbclient.end();
        console.log("Database client disconnected");
      } catch (e) {
        console.error("Error disconnecting database client:", e);
      }
      mqttClient.end(() => {
        console.log("MQTT client disconnected");
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

  } catch (err) {
    console.error("Error in main():", err);
  }
}

main();