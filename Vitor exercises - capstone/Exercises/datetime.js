/*

function Dates() {
const d = new Date(0);
console.log("today's date is: " + d);
return d;
}

Dates();

*/


const startTime = new Date(); //function

for (let i = 0; i < 1000; i++) { // this is to set the loop
    const currentDate = new Date();
    console.log(currentDate.toISOString());
  }

  const endTime = new Date(); // time after loop

const durationMs = endTime - startTime; // total duration in milliseconds
const averageMs = durationMs / 1000; // average time per iteration in ms


console.log(`Total time: ${durationMs} ms`);
console.log(`Average time per iteration: ${averageMs.toFixed(3)} ms`);
