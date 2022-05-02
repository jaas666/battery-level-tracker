console.log('test 00')

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.connect('mongodb://127.0.0.1:27017/BatteryLvL');
//tests

const newUserID = Schema.newID;
const newDeviceID = Schema.newID;

const user = new Schema({
  userID: String,
  userName: String,
  email: String,
});

const device = new Schema({
    userID: String,
    deviceID: String,
    deviceName: String,
    deviceLocation: String,
  });
    
  const deviceDataPoint = new Schema({
    userID: String,
    deviceID: String,
    deviceName: String,
    deviceLocation: String,
  });
  
  const MyModelUsers = mongoose.model('user', user);
  const MyModelDevice = mongoose.model('device', device);
  const MyModelData = mongoose.model('deviceDataPoint', deviceDataPoint);


  console.log('test 99')