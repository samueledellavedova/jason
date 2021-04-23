const Jason = require('../lib');
const { performance: Performance } = require('perf_hooks');

(async () => {
  const sizes = [ 1, 10, 100, 1000, 10000 ];
  const results = {};
  
  for (const size of sizes) {
    const db = new Jason(__dirname + '/db', [ 'users' ]);
    await db.connect();

    const users = [];

    for (let i = 0; i < size; i++)
      users.push({
        name: `User ${i}`,
        age: Math.floor(Math.random() * 10),
        address: 'Idk'
      });
      
    const collection = db.collection('users');
    
    const run = async (op, instruction, deleted) => {
      console.log(`[Size: ${size}] [Operation: ${op}] Running...`);

      const start = Performance.now();

      if (op === 'Delete Collection') await instruction.run.call(db, ...instruction.args);
      else deleted = await instruction.run.call(collection, ...(instruction.args || []));

      const finish = Performance.now() - start;

      if (op.includes('Delete') && deleted) {
        console.log(`[Size: ${size}] Recreating deleted documents...`);
        await run('Bulk Create', { run: collection.create, args: [ deleted ] }, deleted);
      }

      return finish.toFixed(0) + 'ms';
    };
    
    const operations = {
      'Bulk Create': { run: collection.create, args: [ users ] },
      'Count': { run: collection.count },

      'Find All': { run: collection.find },
      'Find All (with filter)': { run: collection.find, args: [ { age: 5 } ] },
      'Find One': { run: collection.findOne },
      'Find One (with filter)': { run: collection.findOne, args: [ { age: 5 } ] },

      'Update All': { run: collection.update, args: [ {}, { address: 'Now I know the address' } ] },
      'Update All (with filter)': { run: collection.update, args: [ { age: 5 }, { address: 'I forgot the address' } ] },
      'Update One': { run: collection.updateOne, args: [ {}, { address: 'Some address here' } ] },
      'Update One (with filter)': { run: collection.updateOne, args: [ { age: 5 }, { address: 'Huh?' } ] },

      'Delete All': { run: collection.delete },
      'Delete All (with filter)': { run: collection.delete, args: [ { age: 5 } ] },
      'Delete One': { run: collection.deleteOne },
      'Delete One (with filter)': { run: collection.deleteOne, args: [ { age: 5 } ] },

      'Delete Collection': { run: db.delete, args: [ 'users' ] }
    };

    for (const op in operations) {
      if (!results[op]) results[op] = {};
      results[op][size] = await run(op, operations[op]);
    }
  }

  console.table(results);
})();