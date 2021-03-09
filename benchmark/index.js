const Jason = require('../lib');

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
    
    const run = async (op, instruction, deleted) => {
      console.log(`[Size: ${size}] [Operation: ${op}] Running...`);

      const start = Date.now();
      deleted = await eval(instruction);
      const finish = Date.now() - start;

      if (instruction.includes(').delete') && deleted) {
        console.log(`[Size: ${size}] Recreating deleted documents...`);
        await run('Bulk Create', 'db.collection(\'users\').create(deleted);', deleted);
      }

      return finish + 'ms';
    };

    const operations = {
      'Bulk Create': 'db.collection(\'users\').create(users);',
      'Count': 'db.collection(\'users\').count();',
      
      'Find All': 'db.collection(\'users\').find();',
      'Find All (with filter)': 'db.collection(\'users\').find({ age: 5 });',
      'Find One': 'db.collection(\'users\').findOne();',
      'Find One (with filter)': 'db.collection(\'users\').findOne({ age: 5 });',
  
      'Update All': 'db.collection(\'users\').update({}, { address: \'Now I know the address\' });',
      'Update All (with filter)': 'db.collection(\'users\').update({ age: 5 }, { address: \'I forgot the address\' });',
      'Update One': 'db.collection(\'users\').updateOne({}, { address: \'Some address here\' });',
      'Update One (with filter)': 'db.collection(\'users\').updateOne({ age: 5 }, { address: \'Huh?\' });',
  
      'Delete All': 'db.collection(\'users\').delete();',
      'Delete All (with filter)': 'db.collection(\'users\').delete({ age: 5 });',
      'Delete One': 'db.collection(\'users\').deleteOne();',
      'Delete One (with filter)': 'db.collection(\'users\').deleteOne({ age: 5 });',
  
      'Delete Collection': 'db.delete(\'users\');'
    };

    for (const op in operations) {
      if (!results[op]) results[op] = {};
      results[op][size] = await run(op, operations[op]);
    }
  }

  console.table(results);
})();