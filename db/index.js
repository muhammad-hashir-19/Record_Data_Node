const fs = require('fs');
const path = require('path');
const mongo = require('./mongo');
const recordUtils = require('./record');
const vaultEvents = require('../events');

const backupDir = path.join(__dirname, '..', 'backups');
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

// Backup function
async function createBackup() {
  const db = await mongo.connect();
  const data = await db.collection('vault').find().toArray();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `backup_${timestamp}.json`);
  fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));
  console.log(`[Backup] Created: ${backupFile}`);
}

// Add record
async function addRecord({ name, value }) {
  recordUtils.validateRecord({ name, value });
  const newRecord = {
    id: recordUtils.generateId(),
    name,
    value,
    createdAt: new Date().toISOString()
  };
  const db = await mongo.connect();
  const collection = db.collection('vault');
  await collection.insertOne(newRecord);
  vaultEvents.emit('recordAdded', newRecord);
  await createBackup();
  return newRecord;
}

// List records
async function listRecords() {
  const db = await mongo.connect();
  return await db.collection('vault').find().toArray();
}

// Update record
async function updateRecord(id, newName, newValue) {
  const db = await mongo.connect();
  const collection = db.collection('vault');
  const result = await collection.findOneAndUpdate(
    { id },
    { $set: { name: newName, value: newValue } },
    { returnDocument: 'after' }
  );
  if (!result.value) return null;
  vaultEvents.emit('recordUpdated', result.value);
  await createBackup();
  return result.value;
}

// Delete record
async function deleteRecord(id) {
  const db = await mongo.connect();
  const collection = db.collection('vault');
  const record = await collection.findOne({ id });
  if (!record) return null;
  await collection.deleteOne({ id });
  vaultEvents.emit('recordDeleted', record);
  await createBackup();
  return record;
}

// Search records 
async function searchRecords(keyword) {
  const db = await mongo.connect();
  const collection = db.collection('vault');

  const regex = new RegExp(keyword, 'i'); // case-insensitive partial match

  const results = await collection.find({
    $or: [
      { name: regex }, 
      { $expr: { $regexMatch: { input: { $toString: "$id" }, regex } } }
    ]
  }).toArray();

  return results;
}


// Sort records
async function sortRecords(field, order = 'asc') {
    const db = await mongo.connect();
    const collection = db.collection('vault');

    const records = await collection.find().toArray();

    // Sort case-insensitively for strings
    records.sort((a, b) => {
        let valA = a[field];
        let valB = b[field];

        // Only lowercase if field is a string
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return order === 'asc' ? -1 : 1;
        if (valA > valB) return order === 'asc' ? 1 : -1;
        return 0;
    });

    return records;
}




// Export vault to text file
async function exportVault() {
  const db = await mongo.connect();
  const collection = db.collection('vault');
  const data = await collection.find().toArray();
  const exportFile = path.join(__dirname, '..', 'export.txt');
  const now = new Date();
  const header = `=== NodeVault Export Report ===
File: export.txt
Exported At: ${now.toISOString()}
Total Records: ${data.length}
-------------------------------
`;
  const content = data.map(r => `ID: ${r.id} | Name: ${r.name} | Value: ${r.value} | Created: ${r.createdAt}`).join('\n');
  fs.writeFileSync(exportFile, header + content);
  console.log(`✅ Data exported successfully to ${exportFile}`);
}

// Vault statistics
async function getVaultStats() {
  const db = await mongo.connect();
  const collection = db.collection('vault');
  const data = await collection.find().toArray();
  if (data.length === 0) return null;

  const totalRecords = data.length;
  const lastModified = new Date(); 
  const longestNameObj = data.reduce((prev, curr) => (curr.name.length > prev.name.length ? curr : prev), data[0]);
  const dates = data.map(r => new Date(r.createdAt));
  const earliest = new Date(Math.min(...dates));
  const latest = new Date(Math.max(...dates));

  return {
    totalRecords,
    lastModified,
    longestName: { name: longestNameObj.name, length: longestNameObj.name.length },
    earliest,
    latest
  };
}

module.exports = {
  addRecord,
  listRecords,
  updateRecord,
  deleteRecord,
  searchRecords,
  sortRecords,
  exportVault,
  getVaultStats
};

