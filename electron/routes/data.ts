import { ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';
// const connectPostgres = require('../databases/postgres');
import connectPostgres from '../databases/postgres';
// const connectMongo = require('../databases/mongo');
import connectMongo from '../databases/mongo';
// const CommunicationModel = require('../models/nonrelational/communicatonSchema');
import CommunicationModel from '../models/nonrelational/communicatonSchema';
// const HealthModelFunc = require('../models/nonrelational/healthSchema');
import HealthModelFunc from '../models/nonrelational/healthSchema';
import ServicesModel from '../models/nonrelational/servicesSchema';
//  const DockerModelFunc = require('../models/nonrelational/DockerModel');
import DockerModelFunc from '../models/nonrelational/DockerModel';
// Initiate pool variable for SQL setup
let pool: any;

// Stores database type: 1) MongoDB or 2) SQL
let currentDatabaseType: string;

/**
 * @event   connect
 * @desc    Connects user to database and sets global currentDatabaseType which
 *          is accessed in info.commsData and info.healthData
 */
ipcMain.on('connect', (message: Electron.IpcMainEvent, index: number) => {
  // Extract databaseType and URI from settings.json at particular index
  // get index from application context
  const fileContents = fs.readFileSync(path.resolve(__dirname, '../user/settings.json'), 'utf8');

  const userDatabase = JSON.parse(fileContents).services[index];
  // We get index from sidebar container: which is the mapplication (DEMO)
  const [databaseType, URI] = [userDatabase[1], userDatabase[2]];

  // Connect to the proper database
  if (databaseType === 'MongoDB') connectMongo(index, URI);
  if (databaseType === 'SQL') pool = connectPostgres(index, URI);

  // Currently set to a global variable
  currentDatabaseType = databaseType;
});

/**
 * @event   serviceRequest/serviceResponse
 * @desc    Query to services table for all microservices of a specific app
 */
ipcMain.on('servicesRequest', async (message: Electron.IpcMainEvent) => {
  let result: any;

  // Mongo Database
  if (currentDatabaseType === 'MongoDB') {
    // Get all documents from the services collection
    result = await ServicesModel.find();
  }

  // SQL Database
  if (currentDatabaseType === 'SQL') {
    // Get all rows from the services table
    const query = `SELECT * FROM services`;
    result = await pool.query(query);
    result = result.rows;
  }

  // Async event emitter - send response
  message.sender.send('servicesResponse', JSON.stringify(result));
});

/**
 * @event   commsRequest/commsResponse
 * @desc    Query for all communication data
 */
ipcMain.on('commsRequest', async (message: Electron.IpcMainEvent, index: number) => {
  try {
    let result: any;

    // Mongo Database
    if (currentDatabaseType === 'MongoDB') {
      // Get all documents
      result = await CommunicationModel.find().exec();
    }

    // SQL Database
    if (currentDatabaseType === 'SQL') {
      // Get all rows
      const getCommunications = 'SELECT * FROM communications';
      result = await pool.query(getCommunications);
      result = result.rows;
    }

    // Async event emitter - send response
    message.sender.send('commsResponse', JSON.stringify(result));
  } catch (error) {
    // Catch errors
    console.log('Error in info.commsData', error.message);
    message.sender.send('commsResponse', {});
  }
});

/**
 * @event   healthRequest/healthResponse
 * @desc    Query for health data for a particular microservice (last 50 data points)
 */
ipcMain.on('healthRequest', async (message: Electron.IpcMainEvent, service: string) => {
  try {
    let result: any;

    // Mongo Database
    if (currentDatabaseType === 'MongoDB') {
      // Get document count
      let num = await HealthModelFunc(service).countDocuments();
      console.log('what is service------>', service);
      // Get last 50 documents. If less than 50 documents, get all
      num = Math.max(num, 50);
      result = await HealthModelFunc(service)
        .find()
        .skip(num - 50);
    }

    // SQL Database
    if (currentDatabaseType === 'SQL') {
      // Get last 50 documents. If less than 50 get all
      const query = `
          SELECT * FROM ${service}
          ORDER BY _id DESC
          LIMIT 50`;

      // Execute query
      result = await pool.query(query);
      result = result.rows.reverse();
    }

    // Async event emitter - send response
    message.sender.send('healthResponse', JSON.stringify(result));
  } catch (error) {
    // Catch errors
    console.log('Error in info.healthData', error.message);
    message.sender.send('healthResponse', {});
  }
});

/**
 * @event   dockerRequest/DockerResponse
 * @desc    Query for health data for a particular microservice (last 50 data points)
 */
ipcMain.on('dockerRequest', async (message, service) => {
  console.log('dockerRequest just hit');
  try {
    let result: any;
    console.log('im in the first try in docker endpoint');
    // Mongo Database
    if (currentDatabaseType === 'MongoDB') {
      console.log('before model FUNC service =>>', service);
      // Get document count
      console.log('the docker model', DockerModelFunc);
      let num = await DockerModelFunc.countDocuments();

      //Get last 50 documents. If less than 50 documents, get all
      num = Math.max(num, 50);
      console.log('docker data -----> ', result, 'can i get service --------->', service);
      result = await DockerModelFunc.find().skip(num - 50);
      console.log('docker data---->', result);
    }

    // SQL Database
    if (currentDatabaseType === 'SQL') {
      // Get last 50 documents. If less than 50 get all
      const query = `
          SELECT * FROM ${service}
          ORDER BY _id DESC
          LIMIT 50`;

      // Execute query
      result = await pool.query(query);
      result = result.rows.reverse();
    }

    // Async event emitter - send response
    message.sender.send('dockerResponse', JSON.stringify(result));
  } catch (error) {
    // Catch errors
    console.log('Error in info.dockerData', error.message);
    message.sender.send('dockerResponse', {});
  }
});