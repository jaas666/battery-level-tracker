const express = require("express");
const LVLfunctions = require("./LVLfunctions");

// Adds collection (w/ validation), if it does not exist
LVLfunctions.addSchemas().catch(console.dir);

// creates express app
const app = express();
app.use(express.json());

// set API functionality
LVLfunctions.setAPI(app);

// Listen for requests
app.listen(process.env.PORT, () => console.log("Server ready"));