require("dotenv").config();
const express = require("express");
const { MongoDBNamespace, ObjectID } = require("mongodb");
const mongo = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
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
    db = client.db("BatteryLvL");
    users = db.collection("users-juan");
  }
);
app.use(express.json());

// Users Section



app.get("/users", (req, res) => {
//  users.find({}).project({firstName:1, lastName:1, email:1}).toArray((err, items) => {
    users.find({}).toArray((err, items) => {

    if (err) {
      console.error(err);
      res.status(500).json({ err: err });
      return;
    }
    res.status(200).json({ users: items });
  });
});

app.post("/users/adduser", async (req, res) => {
  const firstName = req.body.firstname;
  const lastName = req.body.lastname;
  const email = req.body.email;
  //const dbEmail = await users.findOne({ email: email }, {email:1});
console.log(`The email is ${dbEmail}`)
  if (dbEmail !== null){
    
    users.insertOne(
      { 
        firstName: firstName,
        lastName: lastName,
        email: email
      },
      (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).json({ err: err });
          return;
        }
        console.log(result);
        res.status(200).json({ ok: true });
      }
    );
  }
 
});

app.post("/users/edituser/:id", (req, res) => {
  const id = req.params["id"].toString();;
  console.log(req.body);
  users.updateOne({ _id: ObjectId(id) }, { $set: req.body }, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json({ err: err });
      return;
    }
    res.status(200).json({ result });
  });
});

app.delete("/users/deleteuser/:id", (req, res) => {
  const id = req.params["id"].toString();
  users.deleteOne({ _id: ObjectId(id) }, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json({ err: err });
      return;
    }
    res.status(200).json({ result });
  });
});

//Devices Section

app.get("/devices/:userId", (req, res) => {
  const userId = req.params["userId"].toString();

  users.find({_id: ObjectId(userId)}).project({devices:1, _id:0}).toArray((err, items) => {

    if (err) {
      console.error(err);
      res.status(500).json({ err: err });
      return;
    }
    res.status(200).json({ users: items });
  });
});

app.post("/devices/adddevice/:userId", async (req, res) => {
  const userId = req.params["userId"].toString();
  const deviceName = req.body.deviceName;
  const deviceLocation = req.body.deviceLocation;
    
    users.updateOne(
      {_id:ObjectId(userId)},
      { "$push": {"devices":{"deviceId":ObjectId(),"deviceName":deviceName,"deviceLocation":deviceLocation}}},
      (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).json({ err: err });
          return;
        }
        console.log(result);
        res.status(200).json({ ok: true });
      }
    );
});


app.listen(3000, () => console.log("Server ready"));
