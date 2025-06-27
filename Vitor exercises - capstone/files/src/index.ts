/*


import * as fs from 'fs';

class DataReading {
  public value: number;
  public timestamp: string;

  constructor() {
    this.value = Math.random() * 100;
    const d: Date = new Date();
    this.timestamp = d.toISOString();

    console.log(`DataReading created - value: ${this.value.toFixed(2)}, timestamp: ${this.timestamp}`);
  }

  outputDataReading(filename: string): void {
    const jsonData = JSON.stringify(this, null, 2);
    fs.writeFileSync(filename, jsonData, 'utf-8');
    console.log(`Data saved to file: ${filename}`);
  }

  /**
   * Reads JSON data from a file and updates the current object's data members.
   * @param filename - The file path to read JSON data from.
   */

  /*
  inputDataReading(filename: string): void {
    // Read the file contents as a string
    const fileContent = fs.readFileSync(filename, 'utf-8');

    // Parse the JSON string into an object
    const obj = JSON.parse(fileContent);

    // Copy the data from the object to this instance's members
    this.value = obj.value;
    this.timestamp = obj.timestamp;

    console.log(`Data read from file: ${filename}`);
    console.log(`Value: ${this.value}, Timestamp: ${this.timestamp}`);
  }
}

function main() {
  // Create an instance and save it to file
  const reading = new DataReading();
  reading.outputDataReading('./mydata.json');

  // Now create a new instance and load data from 'test.json'
  const newReading = new DataReading(); // This will create with random values initially
  newReading.inputDataReading('./test.json'); // Overwrites values with those from the file
}

main();
*/



import * as fs from 'fs';

interface Config {
  protocol: string;
  ip: string;
  port: number;
  resource: string;
}

function main() {
  // This is to read the file
  const configFile = fs.readFileSync('./config.json', 'utf-8');

  // To parsre the JSON data
  const config: Config = JSON.parse(configFile);

  // Build the URL
  const fullUrl = `${config.protocol}${config.ip}:${config.port}${config.resource}`;

  // Output 
  console.log('Full URL:', fullUrl);
}

main();