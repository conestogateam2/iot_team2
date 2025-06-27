import * as fs from 'fs';

interface Config {
  protocol: string;
  ip: string;
  port: number;
  resource: string;
}

async function main() {
  const configFile = fs.readFileSync('./config.json', 'utf-8');
  const config: Config = JSON.parse(configFile);
  const fullUrl = `${config.protocol}${config.ip}:${config.port}${config.resource}`;
  console.log('Fetching from URL:', fullUrl);

  try {
    const response = await fetch(fullUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.text();
    console.log('Data fetched from server:');
    console.log(data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

main();