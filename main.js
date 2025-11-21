const readline = require('readline');
const db = require('./db'); // imports db/index.js

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


// Async wrapper for question
function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}


function showMenu() {
  console.log(`
===== NodeVault =====
1. Add Record
2. List Records
3. Update Record
4. Delete Record
5. Search Records
6. Sort Records
7. Export Data
8. View Vault Statistics
9. Exit
=====================
`);
}

async function main() {
  while (true) {
    showMenu();
    const choice = (await question('Choose option: ')).trim();

    try {
      switch (choice) {

        case '1': // Add Record
          try {
            const name = (await question('Enter name: ')).trim();
            const value = (await question('Enter value: ')).trim();
            const record = await db.addRecord({ name, value });
            console.log(`\n✅ Record added:\nID: ${record.id} | Name: ${record.name} | Value: ${record.value} | Created: ${record.createdAt.split('T')[0]}`);
          } catch (err) {
            console.error('❌ Error adding record:', err.message);
          }
          break;

        case '2': // List Records
          const records = await db.listRecords();
          if (records.length === 0) console.log('No records found.');
          else {
            console.log('\nCurrent Records:');
            records.forEach((r, i) => {
  const created = r.createdAt.replace('T', ' ').split('.')[0];
  console.log(`${i + 1}. ID: ${r.id} | Name: ${r.name} | Value: ${r.value} | Created: ${created}`);
});

          }
          break;

        case '3': // Update Record
          try {
            const updateId = Number(await question('Enter ID to update: '));
            const newName = (await question('Enter new name: ')).trim();
            const newValue = (await question('Enter new value: ')).trim();
            const updated = await db.updateRecord(updateId, newName, newValue);
            if (!updated) console.log('❌ Record not found.');
            else console.log(`\n✅ Record updated:\nID: ${updated.id} | Name: ${updated.name} | Value: ${updated.value} | Created: ${updated.createdAt.split('T')[0]}`);
          } catch (err) {
          }
          break;

        case '4': // Delete Record
          try {
            const deleteId = Number(await question('Enter ID to delete: '));
            const deleted = await db.deleteRecord(deleteId);
            if (!deleted) console.log('❌ Record not found.');
            else console.log(`\n✅ Record deleted:\nID: ${deleted.id} | Name: ${deleted.name} | Value: ${deleted.value} | Created: ${deleted.createdAt.split('T')[0]}`);
          } catch (err) {
            console.error('❌ Error deleting record:', err.message);
          }
          break;

       case '5': // Search Records
  const keyword = (await question('Enter search keyword: ')).trim();
  const results = await db.searchRecords(keyword);

  if (results.length === 0) {
    console.log('No records found.');
  } else {
    console.log(`Found ${results.length} matching record${results.length > 1 ? 's' : ''}:`);
    results.forEach((r, i) => {
      const created = r.createdAt.replace('T', ' ').split('.')[0]; // include date + time
      console.log(`${i + 1}. ID: ${r.id} | Name: ${r.name} | Created: ${created}`);
    });
  }
  await pause();
  break;



        case '6': // Sort Records
    const sortFieldInput = (await question('Choose field to sort by (name/createdAt): ')).trim().toLowerCase();
    const sortField = sortFieldInput === 'createdat' ? 'createdAt' : 'name';

    const sortOrderInput = (await question('Choose order (asc/desc): ')).trim().toLowerCase();
    const sortOrder = sortOrderInput === 'desc' ? 'desc' : 'asc';

    const sorted = await db.sortRecords(sortField, sortOrder);

    if (sorted.length === 0) {
        console.log('No records found.');
    } else {
        console.log('\nSorted Records:');
        sorted.forEach((r, i) => {
            console.log(`${i + 1}. ID: ${r.id} | Name: ${r.name}`);
        });
    }
    break;


        case '7': // Export Data
          try {
            await db.exportVault();
          } catch (err) {
            console.error('❌ Error exporting vault:', err.message);
          }
          break;

        case '8': // Vault Statistics
          const stats = await db.getVaultStats();
          if (!stats) console.log('Vault is empty.');
          else {
            console.log('\nVault Statistics:');
            console.log('--------------------------');
            console.log(`Total Records: ${stats.totalRecords}`);
            console.log(`Last Modified: ${stats.lastModified.toISOString().replace('T', ' ').split('.')[0]}`);
            console.log(`Longest Name: ${stats.longestName.name} (${stats.longestName.length} characters)`);
            console.log(`Earliest Record: ${stats.earliest.toISOString().split('T')[0]}`);
            console.log(`Latest Record: ${stats.latest.toISOString().split('T')[0]}`);
          }
          break;

        case '9': // Exit
          console.log('Exiting NodeVault. Goodbye!');
          rl.close();
          process.exit(0);
          break;

        default:
          console.log('❌ Invalid choice. Please try again.');
      }
    } catch (err) {
    }
  }
}

main();

