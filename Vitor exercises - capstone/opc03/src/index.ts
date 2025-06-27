import * as opcua from "node-opcua";

async function listEndpoints(endpointUrl: string) {
  const client = opcua.OPCUAClient.create({});
  await client.connect(endpointUrl);
  const endpoints = await client.getEndpoints();
  console.log("Available endpoints:");
  endpoints.forEach((ep) => {
    console.log(`${ep.endpointUrl} - securityMode: ${opcua.MessageSecurityMode[ep.securityMode]} - securityPolicy: ${ep.securityPolicyUri}`);
  });
  await client.disconnect();
}

listEndpoints("opc.tcp://192.168.0.212:26543").catch(console.error);