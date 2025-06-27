// src/index.ts
import * as fs from "fs";
import * as path from "path";
import mqtt from "mqtt";
import { Client as PgClient, ClientConfig } from "pg";

interface MqttCfg {
  brokerUrl: string;
  mqttPort: number;
  baseTopic: string;
}

interface AppCfg {
  mqtt: MqttCfg;
  sqlConfig: ClientConfig;
}

function loadConfig(file: string): AppCfg {
  const raw = fs.readFileSync(path.resolve(__dirname, file), "utf-8");
  return JSON.parse(raw) as AppCfg;
}

async function handleMessage(
  fullTopic: string,
  msg: Buffer,
  db: PgClient,
  baseTopic: string
) {
  const payloadText = msg.toString();
  console.log(`⟵ Received on “${fullTopic}”: ${payloadText}`);

  // strip off the leading baseTopic
  if (!fullTopic.startsWith(baseTopic)) {
    console.warn("↳ Topic outside baseTopic, ignoring:", fullTopic);
    return;
  }

  const relative = fullTopic.slice(baseTopic.length);
  const parts = relative.split("/");
  if (parts.length < 2) {
    console.error("↳ Invalid topic segments:", relative);
    return;
  }

  const deviceId = parts[0].trim().substring(0, 50);
  const metric = parts.slice(1).join("/").trim().substring(0, 50);

  let payload: { value: number | string; timestamp?: string };
  try {
    payload = JSON.parse(payloadText);
  } catch {
    console.error("↳ Payload is not JSON:", payloadText);
    return;
  }

  const ts =
    payload.timestamp && !isNaN(Date.parse(payload.timestamp))
      ? payload.timestamp
      : new Date().toISOString();

  // Convert stringified numbers like "123.4" to actual number
  const rawValue = payload.value;
  const value =
    typeof rawValue === "string" ? parseFloat(rawValue) : rawValue;

  if (typeof value !== "number" || isNaN(value)) {
    console.error("↳ Payload.value is not a valid number:", payload);
    return;
  }

  const sql = `
    INSERT INTO telemetry (timestamp, deviceid, metric, value)
    VALUES ($1, $2, $3, $4)
  `;

  try {
    await db.query(sql, [ts, deviceId, metric, value]);
    console.log(`✔ Inserted: [${ts}] ${deviceId} → ${metric} = ${value}`);
  } catch (err) {
    console.error("❌ DB insert error:", err);
  }
}

async function main() {
  const cfg = loadConfig("../config.json");

  const base = cfg.mqtt.baseTopic.endsWith("/")
    ? cfg.mqtt.baseTopic
    : cfg.mqtt.baseTopic + "/";

  // 1) Connect to PostgreSQL
  const db = new PgClient(cfg.sqlConfig);
  await db.connect();
  console.log("✅ Connected to PostgreSQL");

  // 2) Connect to MQTT
  const mqttUrl = `${cfg.mqtt.brokerUrl}:${cfg.mqtt.mqttPort}`;
  const client = mqtt.connect(mqttUrl);

  client.on("connect", () => {
    console.log("✅ MQTT connected");
    client.subscribe(base + "#", { qos: 1 }, (err) => {
      if (err) console.error("❌ Subscribe failed:", err);
      else console.log("✅ Subscribed to", base + "#");
    });
  });

  client.on("message", (topic, message) =>
    handleMessage(topic, message, db, base)
  );
  client.on("error", (e) => console.error("MQTT Error:", e));

  // graceful shutdown
  const shutdown = async () => {
    console.log("🛑 Shutting down…");
    await client.end(true);
    await db.end();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
