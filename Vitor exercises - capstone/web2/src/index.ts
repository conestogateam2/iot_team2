async function fetchData() {
  const url = "http://192.168.0.210/plcdata/HMI_GVL.M.Rob2.ROBOTPOS.Z.json";

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const jsonData = await response.json();
    console.log(jsonData);
  } catch (err) {
    console.error("Error fetching data:", err);
  }
}

function startFetching() {
  fetchData(); // fetch immediately on start
  setInterval(fetchData, 1000); // then fetch every 1000ms (1 second)
}

startFetching();