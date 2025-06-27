import * as fs from "fs";
import * as path from "path";
import * as opcua from "node-opcua";
import * as mqtt from "async-mqtt";

let config: any;

function readFileAsArray(fname: string): string[] {
  return fs.readFileSync(fname).toString().split("\r\n");
}

function readFileAsJSON(fname: string): any {
  return JSON.parse(fs.readFileSync(fname).toString());
}

function setConfigurationFilename(fname: string): string {
  return path.join(__dirname, "..", fname);
}

async function publishWithRetry(
  client: mqtt.AsyncMqttClient,
  topic: string,
  payload: string,
  retries = 3
) {
  for (let i = 0; i < retries; i++) {
    try {
      await client.publish(topic, payload, { qos: 1 });
      return;
    } catch (err) {
      console.error(`❌ MQTT publish failed (attempt ${i + 1}/${retries}):`, err);
      await new Promise(res => setTimeout(res, 1000));
    }
  }
  console.error(`❌ Failed to publish after ${retries} attempts:`, topic);
}

async function processReadRequest(
  opcsession: opcua.ClientSession,
  tags: string[],
  friendly_tags: string[],
  mqttclient: mqtt.AsyncMqttClient
) {
  for (let x = 0; x < tags.length; x++) {
    try {
      if (!tags[x] || tags[x].trim() === "") {
        console.warn(`⚠️ Skipping blank tag at index ${x}`);
        continue;
      }

      const nodeID = "ns=1;s=" + tags[x];
      console.log("🔍 Reading:", nodeID);

      const data = await opcsession.read({
        nodeId: nodeID,
        attributeId: opcua.AttributeIds.Value,
      });

      if (data.statusCode.name !== "Good") {
        console.warn(`⚠️ OPC UA read not good for ${nodeID}:`, data.statusCode.toString());
        continue;
      }

      const friendly = friendly_tags[x];
      const parts = friendly.split("_");
      const robotName = parts[0];
      const subTopic = parts.slice(1).join("_");

      const topic = `${config.mqtt.baseTopic}${robotName}/${subTopic}`;
      const payload = JSON.stringify({
        timestamp: new Date().toISOString(),
        value: data.value.value.toString(),
      });

      await publishWithRetry(mqttclient, topic, payload);
      console.log("📤 Published:", topic, "Payload:", payload);
    } catch (err) {
      console.error(`❌ Error processing tag ${tags[x]}:`, err);
    }
  }
}

async function main() {
  try {
    const configFileName = setConfigurationFilename("config.json");
    const tagsFileName = setConfigurationFilename("tags.txt");
    const friendlyTagsFileName = setConfigurationFilename("friendly_tags.txt");

    config = readFileAsJSON(configFileName);
    const tags: string[] = readFileAsArray(tagsFileName);
    const friendly_tags: string[] = readFileAsArray(friendlyTagsFileName);

    if (tags.length !== friendly_tags.length) {
      throw new Error("Mismatch: tags.txt and friendly_tags.txt must have the same number of lines.");
    }

    console.log("✅ Loaded tag mappings:");
    tags.forEach((tag, i) => {
      console.log(`  ${tag} → ${friendly_tags[i]}`);
    });

    const url = `${config.mqtt.brokerUrl}:${config.mqtt.mqttPort}`;
    const mqttclient = await mqtt.connect(url);
    console.log("📡 MQTT connected:", url);

    mqttclient.on("error", err => console.error("🚨 MQTT Error:", err));
    mqttclient.on("offline", () => console.warn("⚠️ MQTT Offline"));
    mqttclient.on("reconnect", () => console.log("🔁 MQTT Reconnecting"));

    await publishWithRetry(mqttclient, config.mqtt.baseTopic + "heartbeat", JSON.stringify({
      timestamp: new Date().toISOString(),
      status: "alive"
    }));

    const client = opcua.OPCUAClient.create(config.opc.connection);
    await client.connect(config.opc.endpoint);
    const session = await client.createSession();
    console.log("🔌 OPC UA connected:", config.opc.endpoint);

    const readIntervalMs = config.readIntervalMs || 5000;

    while (true) {
      await processReadRequest(session, tags, friendly_tags, mqttclient);
      await new Promise(res => setTimeout(res, readIntervalMs));
    }

    // Optional cleanup block if using loop exit conditions
    // await session.close();
    // await client.disconnect();
    // await mqttclient.end();
    // console.log("✅ Done.");
  } catch (err) {
    console.error("❌ Error in main():", err);
  }
}

// Global error handler
process.on("unhandledRejection", (reason, promise) => {
  console.error("🚨 Unhandled Rejection at:", promise, "reason:", reason);
});

main();
