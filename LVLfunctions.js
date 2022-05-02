const {
    MongoDBNamespace,
    ObjectID
  } = require("mongodb");
  const ObjectId = require("mongodb").ObjectId;
  const mongo = require("mongodb").MongoClient;
  // const mongoose = require('mongoose');
  // const Schema = mongoose.Schema;
  require('dotenv').config()
  
  
  async function setAPI(app) {
    // Create a new MongoClient
    const client = await getClient();
    await client.connect();
    console.log("Connected to server (setAPI)");
  
    db = client.db(process.env.DBNAME);
    users = db.collection(process.env.COLLECTION);
  
  
    // Users: 
  
    // Get all Users
    app.get("/Users", async (req, res) => {
      console.log("Get all Users");
  
      try {
        found = await users.find().toArray();
        if (!found) {
          throw "No Users found";
        }
  
        console.log(found);
        res.status(200).json({
          user: found
        });
      } catch (e) {
        console.error(e);
        res.status(500).json({
          errSet: e
        });
      }
  
    });
  
    // Delete all Users
    app.delete("/Users/", async (req, res) => {
      console.log(`Delete all Users`);
  
      users.deleteMany({}, (err, result) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            err: err
          });
          return;
        }
        res.status(200).json({
          result
        });
      });
    });
  
    // Get all Users-Devices
    app.get("/Users/Devices", async (req, res) => {
      console.log("Get all Users-Devices");
  
      try {
        found = await users.find().project({devices :1}).toArray();
        if (!found) {
          throw "No Users found";
        }
  
        console.log(found);
        res.status(200).json({
          DevicesByUserID: found
        });
      } catch (e) {
        console.error(e);
        res.status(500).json({
          errSet: e
        });
      }
  
    });
  
    // Get all Users-Devices-Data
    app.get("/Users/Data", async (req, res) => {
      console.log("Get all Users-Data");
  
      try {
        // found = await users.find().project({devices :1, }).toArray();
        found = await users.aggregate([
              { $project: { "devices" : { $objectToArray: "$devices" } } },
              { $project: { "devices.v.deviceName" : 0} },
              { $project: { "devices.v.deviceLocation" : 0} },
              { $project: { "devices" : { $arrayToObject: "$devices"} } }
           ]).toArray();
  
        
        if (!found) {
          throw "No Users found";
        }
  
        console.log(found);
        res.status(200).json({
          DataFromDevicesByUserID: found
        });
      } catch (e) {
        console.error(e);
        res.status(500).json({
          errSet: e
        });
      }
  
    });
  
  
  
    // User: 
  
    // Add User 
    app.post("/User", async (req, res) => {
  
      if (validateUser(req.body)) {
  
        users.insertOne({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            devices: {}
          },
          (err, result) => {
            if (err) {
              console.error(err);
              res.status(500).json({
                err: err
              });
              return;
            }
            console.log(result);
            res.status(200).json({
              ok: true
            });
          }
        );
      } else {
        console.log("User not validated: " + req.body.toString());
        res.status(500).json({
          ok: false
        });
      }
  
  
  
  
    });
  
    // Get User by ID
    app.get("/User/:userID", async (req, res) => {
      const good_id = new ObjectId(req.params.userID);
      console.log("Get User by ID:" + good_id);
  
      try {
        found = await users.findOne(good_id);
        if (!found) {
          throw "No User found";
        }
  
        console.log(found);
        res.status(200).json({
          user: found
        });
      } catch (e) {
        console.error(e);
        res.status(500).json({
          error: e
        });
        return;
      }
  
    });
  
    // Delete User by ID
    app.delete("/User/:userID", async (req, res) => {
      const good_id = new ObjectId(req.params.userID);
      console.log(`Delete User by ID: ${good_id}`);
  
      users.deleteOne({
        _id: good_id
      }, (err, result) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            err: err
          });
          return;
        }
        res.status(200).json({
          result
        });
      });
    });
  
    // Edit user
    app.patch("/User/:userID", async (req, res) => {
  
      const good_id = new ObjectId(req.params.userID);
      console.log(`Edit user: ${good_id}`)
      console.log(req.body);
      users.updateOne({
        _id: good_id
      }, {
        $set: req.body
      }, (err, result) => {
        if (err) {
          console.log(err);
          res.status(500).json({
            err: err
          });
          return;
        }
        res.status(200).json({
          result
        });
      });
    });
  
  
    // Device: 
  
    // Add Device
    app.post("/Device/:userID", async (req, res) => {
      const good_id = new ObjectId(req.params.userID);
      const device_id = new ObjectId();
      console.log(`Add Device to UserID: ${good_id}. New DeviceID: ${device_id}`);
  
      if (validateDevice(req.body)) {
        const filter = {
          _id: good_id
        };
  
        const update = {
          ["devices." + device_id]: {
            deviceName: req.body.deviceName,
            deviceLocation: req.body.deviceLocation,
            deviceData: []
          }
        };
  
        try {
          let newDoc = await users.updateOne(filter, {
            $set: update
          }, {
            returnNewDocument: true
          });
  
  
          // only prints promise info, not user/device (it does update the DB)
          res.status(200).json({
            newDoc
          });
          console.log(newDoc);
  
        } catch (e) {
          console.error(e);
          res.status(500).json({
            error: e
          });
          return;
        }
  
  
  
      } else {
        console.log("in-valid Device input")
      }
  
  
    });
  
    // Delete Device 
    app.delete("/Device/:userID/:deviceID", async (req, res) => {
      const user_id = new ObjectId(req.params.userID);
      const device_id = new ObjectId(req.params.deviceID);
      console.log(`Delete Device: ${device_id}. From user: ${user_id}`);
  
  
      try {
        let newDoc = await users.updateOne({
          _id: user_id
        }, {
          $unset: {
            ["devices." + device_id]: ''
          }
        }, {
          returnNewDocument: true
        });
        console.log(newDoc);
  
        res.status(200).json({
          deleted: newDoc
        });
      } catch (e) {
        console.error(e);
        res.status(500).json({
          error: e
        });
        return;
      }
    });
  
    // Get Device
    app.get("/Device/:userID/:deviceID", async (req, res) => {
      const user_id = new ObjectId(req.params.userID);
      const device_id = new ObjectId(req.params.deviceID);
      console.log(`Get Device: ${device_id}. From user: ${user_id}`);
  
  
      try {
        const newDoc = await users.findOne({
          _id: user_id
        });
        const deviceList = newDoc.devices;
        const device = deviceList[device_id];
  
        res.status(200).json({
          device: newDoc
        });
        console.log(device);
      } catch (e) {
        console.error(e);
        res.status(500).json({
          error: e
        });
        return;
      }
    });
  
    // Edit Device 
    app.patch("/Device/:userID/:deviceID", async (req, res) => {
      const user_id = new ObjectId(req.params.userID);
      const device_id = new ObjectId(req.params.deviceID);
      console.log(`Edit Device: ${device_id}. From user: ${user_id}`);
  
  
      try {
        for (x in req.body) {
          console.log({
            ["NEW: " + [x]]: req.body[x]
          });
  
          users.updateOne({
            _id: user_id
          }, {
            $set: {
              ["devices." + device_id + "." + x]: req.body[x]
            }
          }, (err, result) => {
  
            if (err) {
              console.log(err);
              res.status(500).json({
                err: err
              });
              return;
            }
            // console.log({
            //   [device_id]: req.body
            // });
          })
        };
  
  
        res.status(200).json({
          device: req.body
        });
      } catch (e) {
        console.error(e);
        res.status(500).json({
          error: e
        });
        return;
      }
    });
  
    // Get Device EOL
    app.get("/Device/EOL/:userID/:deviceID", async (req, res) => {
      const user_id = new ObjectId(req.params.userID);
      const device_id = new ObjectId(req.params.deviceID);
      console.log(`Get Device: ${device_id}. From user: ${user_id}`);
  
  
      try {
        const newDoc = await users.findOne({
          _id: user_id
        });
        const deviceList = newDoc.devices;
        const device = deviceList[device_id];
        const deviceData = device.deviceData.toString().split(",");
        // console.log(deviceData);
  
        dataLength = deviceData.length;
        data_first = deviceData[0];
        data_last = deviceData[dataLength-1];
        // console.log("data_last", data_last);
        dataDiff = data_last - data_first;
        // console.log("aaa", dataLength, dataDiff);
        dataAVG = dataDiff/dataLength;
        // console.log("dataAVG", dataAVG);
  
        dateLast = new Date(parseInt(data_last));
        // console.log("dateLast", dateLast);
        
        dateEOL = new Date(dateLast + dataAVG);
        dateEOLstring = dateEOL.toString();
        // console.log("bbb", dateEOLstring, dateEOL);
  
  
  
  
  
  
  
  
        res.status(200).json({
          dateEOL
        });
        console.log(dateEOL);
      } catch (e) {
        console.error(e);
        res.status(500).json({
          error: e
        });
        return;
      }
    });
  
  
    // Devices: 
  
    // Get all Devices
    app.get("/Device/:userID", async (req, res) => {
      const user_id = new ObjectId(req.params.userID);
      console.log(`Get all Devices from user: ${user_id}`);
  
      try {
        const newDoc = await users.findOne({
          _id: user_id
        });
        const deviceList = newDoc.devices;
  
        res.status(200).json({
          devices: deviceList
        });
        console.log(deviceList);
      } catch (e) {
        console.error(e);
        res.status(500).json({
          error: e
        });
        return;
      }
    });
  
    // Delete all Devices
    app.delete("/Device/:userID", async (req, res) => {
      const user_id = new ObjectId(req.params.userID);
      console.log(`Delete Devices from user:  ${user_id}`);
  
      try {
        let newDoc = await users.updateOne({
          _id: user_id
        }, {
          $unset: {
            "devices": ""
          }
        });
        res.status(200).json({
          deleted: newDoc
        });
      } catch (e) {
        console.error(e);
        res.status(500).json({
          error: e
        });
        return;
      }
    });
  
  
    // Record : 
  
    // Add Record
    app.post("/Record/:userID/:deviceID", async (req, res) => {
      const user_id = ObjectId(req.params.userID);
      const device_id = ObjectId(req.params.deviceID);
      console.log(`Add Record to UserID: ${user_id}. DeviceID: ${device_id}`);
  
      
      try {
        if (!req.body.time) {throw Error("Time")}
        console.log("given date");
        time = Date.parse(req.body.time);
      } catch {
        console.log("new date");
        time = Date.parse(new Date());
      }
  
  
      const filter = {
        _id: user_id
      };
      const update = {
        ["devices." + device_id + ".deviceData"]: time
      };
  
      try {
        let newDoc = await users.updateOne(filter, {
          $push: update
        }, {
          returnNewDocument: true
        });
  
  
        // only prints promise info, not user/device (it does update the DB)
        res.status(200).json({
          newDoc
        });
        console.log(newDoc);
  
      } catch (e) {
        console.error(e);
        res.status(500).json({
          error: e
        });
        return;
      }
  
  
  
  
  
  
    });
  
    // Delete Records
    app.delete("/Record/:userID/:deviceID", async (req, res) => {
      const user_id = ObjectId(req.params.userID);
      const device_id = ObjectId(req.params.deviceID);
      console.log(`Delete Records for UserID: ${user_id}. DeviceID: ${device_id}`);
  
  
      const filter = {
        _id: user_id
      };
      const update = {
        ["devices." + device_id + ".deviceData"]: []
      };
  
      try {
        let newDoc = await users.updateOne(filter, {
          $set: update
        }, {
          returnNewDocument: true
        });
  
  
        // only prints promise info, not user/device (it does update the DB)
        res.status(200).json({
          newDoc
        });
        console.log(newDoc);
  
      } catch (e) {
        console.error(e);
        res.status(500).json({
          error: e
        });
        return;
      }
  
  
  
  
  
  
    });
  
  
  
  
  
  
  }
  
  async function getClient() {
    //  // The database to use
    const uri = getURI();
  
    // Create a new MongoClient
    const client = new mongo(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  
    await makeConnection();
    return client;
  
  }
  
  function getURI() {
    const username = process.env.LOGINNAME;
    const password = process.env.PASSWORD;
    const clusterUrl = process.env.CLUSTERURL;
    const dbName = process.env.DBNAME;
    const authMechanism = process.env.AUTHMECHANISM;
  
    const uri =
      `mongodb+srv://${username}:${password}@${clusterUrl}/${dbName}/?authMechanism=${authMechanism}`;
    return uri;
  }
  
  async function makeConnection() {
    mongo.connect(
      getURI(), {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      (err, client) => {
        if (err) {
          console.error(err);
          return;
        }
  
      }
    );
  }
  
  async function getDBCollection(colName) {
    const client = await getClient();
    await client.connect();
    db = client.db(process.env.DBNAME);
    return db.collection(colName);
  
  }
  
  function validateUser(user) {
    const errors = [];
  
    if (!user) {
      errors.push("User is required");
    }
  
    if (!user.firstName) {
      errors.push("firstName is required");
    }
  
    if (!user.lastName) {
      errors.push("lastName is required");
    }
  
    if (!user.email) {
      errors.push("email is required");
    }
  
    if (errors.length != 0) {
      console.log(errors);
      return false
    }
    return true;
  
  
  }
  
  function validateDevice(device) {
    const errors = [];
  
    if (!device) {
      errors.push("device is required");
    }
  
    if (!device.deviceName) {
      errors.push("deviceName is required");
    }
  
    if (!device.deviceLocation) {
      errors.push("deviceLocation is required");
    }
  
    if (errors.length != 0) {
      console.log(errors);
      return false
    }
    return true;
  
  
  }
  
  async function addSchemas() {
  
    try {
      const client = await getClient();
  
      client.connect(async function (err) {
        // console.log("Connected to server (addSchemas)");
        if (err) console.log('Err::', err)
        const collection = await client.db(process.env.DBNAME).listCollections({}, {
          nameOnly: true
        }).toArray()
        // console.log('List of all collections :: ', JSON.stringify(collection[{"name":"users"}]))
  
        if (collection.find(x => x.name === process.env.COLLECTION)) {
          // console.log(`Collection (${process.env.COLLECTION}) already exists.`);
        } else {
          console.log("Collection doesn't exit, creating new...");
  
          db.createCollection("users", {
            validator: {
              $jsonSchema: {
                bsonType: "object",
                required: ["firstName", "lastName", "email"],
                properties: {
                  firstName: {
                    bsonType: "string",
                    description: "must be a string and is required"
                  },
                  lastName: {
                    bsonType: "string",
                    description: "must be a string and is required"
                  },
                  email: {
                    bsonType: "string",
                    description: "must be a string and is required XX"
                  },
                  devices: {
                    bsonType: "object",
                    description: "Optional object of {{deviceID, deviceName, deviceLocation, [dataPoints]}}"
                  },
                }
              }
            },
            validationLevel: "strict"
          })
  
        }
  
  
  
  
        client.close();
      });
  
  
  
  
  
    } catch (err) {
      console.log(err.stack);
    } finally {
      // await client.close();
    }
  }
  
  
  module.exports = {
    getClient,
    getURI,
    makeConnection,
    validateUser,
    addSchemas,
    setAPI,
    getDBCollection
  };