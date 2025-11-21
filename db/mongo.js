// db/mongo.js
require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

if (!uri) throw new Error('MONGO_URI not defined in .env');
if (!dbName) throw new Error('DB_NAME not defined in .env');

const client = new MongoClient(uri);
let db;

async function connect() {
  if (!db) {
    await client.connect();
    db = client.db(dbName);
    console.log(`[MongoDB] Connected to database: ${dbName}`);
  }
  return db;
}

module.exports = { connect };

