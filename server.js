// TODO Add validations

require("dotenv").config();
const express = require("express");
const { ObjectId } = require("mongodb");
const mongo = require("mongodb").MongoClient;
const app = express();
const url = process.env.URL;

let db;

mongo.connect(

  url,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err, client) => {
    if (err) {
      console.error(err);
      return;
    }
    db = client.db(process.env.DB);
    users = db.collection(process.env.COLLECTION);
  }
);
app.use(express.json());

// Users Section
// [x] List all owner records
app.get("/users", (req, res) => {
  users.find().toArray((err, items) => {
    if (err) {
      console.error(err);
      res.status(500).json({ err: err });
      return;
    }
    res.status(200).json(items);
  });
});

// [x] Retrieve an owner
app.get("/users/:userId", (req, res) => {
  const userId = req.params["userId"].toString();
  users.find({ _id: ObjectId(userId) }).toArray((err, items) => {
    if (err) {
      console.error(err);
      res.status(500).json({ err: err });
      return;
    }
    res.status(200).json(items);
  });
});

// [x]: Create a new Owner
app.post("/users/adduser", (req, res) => {
  const { firstName, lastName, email } = req.body;

const dbEmail = users.findOne({ email: email } );
console.log(await dbEmail)
  // users.insertOne(
  //   {
  //     firstName,
  //     lastName,
  //     email,
  //   },
  //   (err, result) => {
  //     if (err) {
  //       console.error(err);
  //       res.status(500).json({ err: err });
  //       return;
  //     }
  //     console.log(result);
  //     res.status(200).json(result);
  //   }
  // );
});

// [x]: Update the owner
app.post("/users/edituser/:id", (req, res) => {
  const id = req.params["id"].toString();
  users.updateOne({ _id: ObjectId(id) }, { $set: req.body }, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json({ err: err });
      return;
    }
    res.status(200).json(result);
  });
});

// [x]: Delete an owner.
app.delete("/users/deleteuser/:id", (req, res) => {
  const id = req.params["id"].toString();
  users.deleteOne({ _id: ObjectId(id) }, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json({ err: err });
      return;
    }
    res.status(200).json(result);
  });
});

//Devices Section

// [x]: List all device records
app.get("/devices/", (req, res) => {
  users
    .find()
    .project({ devices: 1, _id: 0 })
    .toArray((err, items) => {
      if (err) {
        console.error(err);
        res.status(500).json({ err: err });
        return;
      }
      res.status(200).json(items);
    });
});

// [ ]: Retrieve a device
// BUG Its returning the whole user record.
// BUG Need to change path.
// app.get("/devices/:deviceId", (req, res) => {
//   const deviceId = req.params["deviceId"].toString();
//   console.log(deviceId);
//   users
//     .find({ "devices.deviceId": ObjectId(deviceId) })
//     //.project({ devices: 1, _id: 0 })
//     .toArray((err, items) => {
//       if (err) {
//         console.error(err);
//         res.status(500).json({ err: err });
//         return;
//       }
//       res.status(200).json(items);
//     });
// });

// [x]: List all owner device records
app.get("/devices/:userId", (req, res) => {
  const userId = req.params["userId"].toString();

  users
    .find({ "_id": ObjectId(userId) })
    .project({ devices: 1, _id: 1 })
    .toArray((err, items) => {
      console.log(items)
      if (err) {
        console.error(err);
        res.status(500).json({ err: err });
        return;
      }
      res.status(200).json(items);
    });
});

// [x]: Create a new device
app.post("/devices/adddevice/:userId", async (req, res) => {
  const userId = req.params["userId"].toString();
  const { deviceName, deviceLocation } = req.body;

  users.updateOne(
    { _id: ObjectId(userId) },
    {
      $push: {
        devices: {
          deviceId: ObjectId(),
          deviceName,
          deviceLocation,
        },
      },
    },
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ err: err });
        return;
      }
      res.status(200).json(result);
    }
  );
});

// [x]: Delete a device and all corresponding device renewal records.
app.delete("/devices/deletedevice/:deviceId", (req, res) => {
  const deviceId = req.params["deviceId"].toString();
  users.updateOne(
    {},
    {
      $pull: {
        devices: {
          deviceId: ObjectId(deviceId)
        },
      },
    },
    (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json({ err: err });
      return;
    }
    res.status(200).json(result);
  });
});


// [ ]: Update the device record with a new Renewal record
// [ ]: List all device renewal records

app.listen(3000, () => console.log("Server ready"));
