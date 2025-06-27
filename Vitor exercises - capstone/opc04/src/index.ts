import * as opcua from "node-opcua";
import * as mqtt from "async-mqtt";
import * as config from "./config.json";

async function main() {
  try {
    // Build MQTT URL string
    let url: string = config.mqtt.brokerUrl + ":" + config.mqtt.mqttPort;
    console.log("URL: ", url);

    // Connect to MQTT broker asynchronously
    const mqttclient = await mqtt.connect(url);
    console.log("mqtt connected!");

    // TEST: publish 100 payloads to verify MQTT connectivity
    console.log("start mqtt publishing test!");
    let topic: string = config.mqtt.baseTopic + "mytest";
    for (let x = 0; x < 100; x++) {
      let d = new Date();
      let data = Math.random() * 100;
      let payload = {
        timestamp: d.toISOString(),
        value: data.toString(),
      };
      await mqttclient.publish(topic, JSON.stringify(payload));
      console.log("count:", x, "published:", topic, "with payload:", JSON.stringify(payload));
    }
    console.log("done mqtt publishing test!");

    // Create OPC UA client and session
    const client = opcua.OPCUAClient.create(config.opc.connection);
    await client.connect(config.opc.endpoint);
    const session = await client.createSession();

    const tags: string[] = config.opc.tags;

    // Read and publish PLC tag data via MQTT
    await processReadRequest(session, tags, mqttclient);

    // Cleanup
    await session.close();
    await client.disconnect();

    // Disconnect MQTT client cleanly
    await mqttclient.end();

  } catch (err) {
    console.error("Error in main():", err);
  }
}

async function processReadRequest(
  opcsession: opcua.ClientSession,
  tags: string[],
  mqttclient: mqtt.AsyncMqttClient
) {
  let nodeID = "";
  let data;

  // One common timestamp for all readings
  let d = new Date();

  for (let x = 0; x < tags.length; x++) {
    nodeID = "ns=1;s=" + tags[x];
    data = await opcsession.read({
      nodeId: nodeID,
      attributeId: opcua.AttributeIds.Value,
    });

    console.log(`data for ${tags[x]} is ${data.value.value}`);

    // Build topic and payload
    let topic = config.mqtt.baseTopic + tags[x];
    let payload = {
      timestamp: d.toISOString(),
      value: data.value.value.toString(),
    };

    // Publish to MQTT broker
    await mqttclient.publish(topic, JSON.stringify(payload));
    console.log("published:", topic, "with payload:", JSON.stringify(payload));
  }
}

main();