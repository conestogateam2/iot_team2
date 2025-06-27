import * as opcua from 'node-opcua-client';
import config from './config.json';

async function main() {
    console.log("Hello opc01");
    console.log("endpoint: ", config.opc.endpoint);

    let tags: string[] = ["HMI_GVL.M.Rob1.ROBOTPOS.X"];

    try {
        const opcClient = opcua.OPCUAClient.create(config.opc.connection);

        await opcClient.connect(config.opc.endpoint);
        console.log("Connected to OPC UA Server at: ", config.opc.endpoint);

        let session = await opcClient.createSession();
        console.log("Session created");

        let data;
        let nodeID: string;

        for (let x = 0; x < tags.length; x++) {
            nodeID = "ns=1;s=" + tags[x];
            data = await session.read({
                nodeId: nodeID,
                attributeId: opcua.AttributeIds.Value
            });
            console.log(`Tag data for ${tags[x]} is ${data.value.value}`);
        }

        await opcClient.disconnect();
        console.log("Disconnected from OPC UA Server");
    } catch (err) {
        console.log("Error: ", err);
    }
}

main();