
function timesTable(number) { //function to multiple the numbers from the given number until 10
    for (let i = 1; i <= 10; i++) {
      console.log(`${i} x ${number} = ${i * number}`);
    }
  }

  
  /* This is the main function that will be called and automatically call the timestable function, the main function will run a loop calling the timestable function 
  setting the number variable from 1 to 12. */
  function main() {
    for (let num = 1; num <= 12; num++) {
      timesTable(num);
      console.log(""); // print a blank line for readability
    }
  }
  

  main(); // to run the main function