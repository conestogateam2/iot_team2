import * as fs from "fs";
import * as path from "path";
import * as mqtt from "mqtt";

let config: any;

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

    // Basic CSV format: timestamp, topic, value
    const csvdata = `"${payload.timestamp}","${topic}",${payload.value}\n`;
    console.log("our parsed data:", csvdata);

    // Append to database.csv
    fs.appendFileSync("C:/Users/iot-group2/Desktop/capstone/mqtt02/csvdata/database.csv", csvdata);

    // Optional: Split topic into components and write to database2.csv
    const topicParts = topic.split("/");
    const csvdata2 = `"${payload.timestamp}","${topicParts.join('","')}",${payload.value}\n`;
    fs.appendFileSync("C:/Users/iot-group2/Desktop/capstone/mqtt02/csvdata/database2.csv", csvdata2);

  } catch (err) {
    console.error("Error processing message:", err);
  }
}

function main() {
  try {
    const configFileName = setConfigurationFilename("config.json");
    config = readFileAsJSON(configFileName);

    let baseTopic = config.mqtt.baseTopic;
    if (!baseTopic.endsWith("/")) {
      baseTopic += "/";
    }

    const url = `${config.mqtt.brokerUrl}:${config.mqtt.mqttPort}`;
    console.log("Connecting to MQTT broker at URL:", url);

    const mqttClient = mqtt.connect(url);

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

    mqttClient.on("message", (topic, message) => {
      processMessageReceived(topic, message);
    });

    const shutdown = () => {
      console.log("Shutting down gracefully...");
      mqttClient.end(() => {
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
