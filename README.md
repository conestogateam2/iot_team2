# IoT Academy: Team2
- __MS1 (Data extraction and publish):__ This microservice uses an OPC connection to extract the data from the robot and publish this data to the MQTT Broker

- __MS2 (Ingestion App):__ This application suscribed to the MQTT broker will validate the data published by MS1, will do some calculations and save the final data to the database.

- __MS3 (Data exposure service):__ This microservice connects to a posgreSQL database and exposes its data through a RESTful API. It enables frontend applications and other services to securely query and retrieve structured information, acting as a bridge between the database and external consumers.

- __HBot Dashboard:__ This dashboard will show the movements of the Hbot in 3 cases. Real time, Historical Data and Manual Movement. You will see a 3D animation of the robot and the data that is being published about it.