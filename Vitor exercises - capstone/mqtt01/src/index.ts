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

function processMessageReceived(topic: string, message: Buffer) {
  console.log(`Received message: ${message.toString()} on topic: ${topic}`);
  // TODO: Add further processing (e.g., save to DB) here
}

function main() {
  try {
    const configFileName = setConfigurationFilename("config.json");
    config = readFileAsJSON(configFileName);

    let baseTopic = config.mqtt.baseTopic;
    if (!baseTopic.endsWith("/")) {
      baseTopic += "/";
    }

    const url = config.mqtt.brokerUrl + ":" + config.mqtt.mqttPort;
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
