import * as opcua from "node-opcua-client";
import * as fs from "fs";
import config from "./config.json";

async function processReadRequest(session: opcua.ClientSession, tags: string[]) {
  for (let x = 0; x < tags.length; x++) {
    const nodeID = "ns=1;s=" + tags[x];
    try {
      const data = await session.read({
        nodeId: nodeID,
        attributeId: opcua.AttributeIds.Value,
      });

      console.log(`data for ${tags[x]} is ${data.value.value}`);

      // Optional: Save data to file
      /*
      const filename = `C:/capstone/data/${tags[x]}.json`;
      const fileContent = {
        timestamp: new Date().toISOString(),
        value: data.value.value,
      };
      fs.writeFileSync(filename, JSON.stringify(fileContent, null, 2));
      */

      
    } catch (err) {
      console.error(`Error reading tag ${tags[x]}:`, err);
    }
  }
}

async function main() {
  console.log("Hello opc02");
  console.log("endpoint: ", config.opc.endpoint);

  const tags: string[] = ["HMI_GVL.M.Rob1.ROBOTPOS.X"];

  const opcClient = opcua.OPCUAClient.create(config.opc.connection);

  try {
    await opcClient.connect(config.opc.endpoint);
    console.log("Connected to OPC UA Server at:", config.opc.endpoint);

    const session = await opcClient.createSession();
    console.log("Session created");

    // Start periodic reading every 1 second
    const intervalId = setInterval(() => {
      processReadRequest(session, tags).catch(console.error);
    }, 1000);

    // Graceful shutdown handler
    const shutdown = async () => {
      console.log("Disconnecting OPC UA client...");
      clearInterval(intervalId);
      await session.close();
      await opcClient.disconnect();
      console.log("Disconnected. Exiting process.");
      process.exit(0);
    };

    // Register shutdown signals
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

    // The program will now keep running until SIGINT/SIGTERM (e.g. CTRL+C)
  } catch (err) {
    console.error("Error in OPC UA client:", err);
    process.exit(1);
  }
}

main();