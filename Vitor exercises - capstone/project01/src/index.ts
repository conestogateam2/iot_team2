/*
* index.ts
*/

/*
function main()
{
let s:string = "Hello project01";
console.log (s);
let x:number = 5; // let x:number = "Hello";
console.log (`x: ${x}`);



  // New variables for different types:
  let isActive: boolean = true;
  let pi: number = 3.14159;
  let name: string = "TypeScript";
  let nothing: null = null;
  let notDefined: undefined = undefined;
  
  console.log(`isActive: ${isActive}`);
  console.log(`pi: ${pi}`);
  console.log(`name: ${name}`);
  console.log(`nothing: ${nothing}`);
  console.log(`notDefined: ${notDefined}`)


}
main(); // execute main functio



*/



/**
 * Outputs a times table for a given number.
 * 
 * @param {number} n - The number to generate the times table for (default is 1).
 * @returns {void} - This function only logs output to the console.
 */
function times_table(n: number = 1): void {
    for (let i = 1; i <= 10; i++) {
      console.log(`${i} x ${n} = ${i * n}`);
    }
  }
  
  /**
   * Main function to test times_table().
   * Calls times_table() with different parameters and loops through 1 to 12.
   */
  function main(): void {
    console.log("Testing times_table with 3:");
    times_table(3);
  
    console.log("\nTesting times_table with default (1):");
    times_table();
  
    console.log("\nPrinting times tables from 1 to 12:");
    for (let i = 1; i <= 12; i++) {
      console.log(`\nTimes Table of ${i}:`);
      times_table(i);
    }
  }
  
  // Run the main function
  main();