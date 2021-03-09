# Jason, a JSON database (lol)

I was bored, so i made this. I wouldn't recommend using it for production software.

## Install

```bash
$ npm install @samueledellavedova/jason
```

## Example

```js
const Jason = require('@samueledellavedova/jason');

const db = new Jason('./some/folder/here', [ 'users', 'posts' ]);
await db.connect();

await db.collection('users').create({
  _id: '1234567890', // The _id property is optional as it would be generated automatically if not provided
  name: 'User',
  age: 17,
  address: 'Idk'
});

await db.collection('users').updateOne({ name: 'User' }, { address: 'Now i know the address' });
await db.collection('users').deleteByID('1234567890');
```

## Documentation

### Jason
#### new Jason()
`new Jason(path, collections)`
- Creates an instance of Jason
- **`path (String)`** - The path to the folder where the JSON files will be stored
- **`collections (Array<String>)`** - The collections to load when connecting to the database, if some isn't found it will be created
#### Jason.connect()
`Jason.connect()`
- Initializes the database and loads the collections
- **`returns`** - `Promise<void>`
#### Jason.load()
`Jason.load(collections)`
- Loads the specified collections
- **`collections (Array<String>)`** - The collections to load, if some isn't found it will be created
- **`returns`** - `Promise<void>`
#### Jason.collection()
`Jason.collection(name)`
- Returns a collection matching a name
- **`name (String)`** - The collection's name
- **`returns`** - `Collection`
#### Jason.delete()
`Jason.delete(name)`
- Deletes a collection from the database
- **`name (String)`** - The collection's name
- **`returns`** - `Promise<Array<Object>>`
#### Jason.destroy()
`Jason.destroy()`
- Deletes every existing collection from the database
- **`returns`** - `Promise<Object>`
---
### Collection
#### Collection.count()
`Collection.count()`
- Counts the number of documents in the collection
- **`returns`** - `Promise<Number>`
#### Collection.create()
`Collection.create(data)`
- Adds one or more documents to the collection
- **`data (Array<Object> | Object)`** - The document(s) to be added
- **`returns`** - `Promise<Array<Object>>`
#### Collection.find()
`Collection.find(filter)`
- Searches for documents matching a filter 
- **`filter (Object)`** - The query filter
- **`returns`** - `Promise<Array<Object>>`
#### Collection.findOne()
`Collection.findOne(filter)`
- Searches for the first document matching a filter
- **`filter (Object)`** - The query filter
- **`returns`** - `Promise<Object | undefined>`
#### Collection.findByID()
`Collection.findByID(id)`
- Searches for a document matching an ID
- **`id (String)`** - The document's ID
- **`returns`** - `Promise<Object | undefined>`
#### Collection.update()
`Collection.update(filter, data)`
- Updates one or more documents in the collection
- **`filter (Object)`** - The query filter
- **`data (Object)`** - The object containing the data to update
- **`returns`** - `Promise<Array<Object>>`
#### Collection.updateOne()
`Collection.updateOne(filter, data)`
- Updates the first document matching a filter
- **`filter (Object)`** - The query filter
- **`data (Object)`** - The object containing the data to update
- **`returns`** - `Promise<Object | undefined>`
#### Collection.updateByID()
`Collection.updateByID(id, data)`
- Updates a document matching an ID
- **`id (String)`** - The document's ID
- **`data (Object)`** - The object containing the data to update
- **`returns`** - `Promise<Object | undefined>`
#### Collection.delete()
`Collection.delete(filter)`
- Deletes one or more documents in the collection
- **`filter (Object)`** - The query filter
- **`returns`** - `Promise<Array<Object>>`
#### Collection.deleteOne()
`Collection.deleteOne(filter)`
- Deletes the first document matching a filter
- **`filter (Object)`** - The query filter
- **`returns`** - `Promise<Object | undefined>`
#### Collection.deleteByID()
`Collection.deleteByID(id)`
- Deletes a document matching an ID
- **`id (String)`** - The document's ID
- **`returns`** - `Promise<Object | undefined>`

## Performance

### Benchmark
To validate the following results you can clone this repository and run:
```bash
$ node benchmark/index.js
```
### Results
Average results of a few benchmarks:
| ⬇️ Operation / Size ➡️    | 1   | 10  | 100  | 1000  | 10000  | 100000   |
| ------------------------ | --- | --- | ---- | ----- | ------ | -------- |
| Bulk Create              | 3ms | 4ms | 23ms | 184ms | 1561ms | 14745ms  |
| Count                    | 0ms | 0ms | 1ms  | 1ms   | 8ms    | 88ms     |
| Find All                 | 0ms | 0ms | 1ms  | 2ms   | 7ms    | 74ms     |
| Find All (with filter)   | 0ms | 0ms | 1ms  | 1ms   | 9ms    | 89ms     |
| Find One                 | 0ms | 0ms | 1ms  | 1ms   | 8ms    | 70ms     |
| Find One (with filter)   | 0ms | 0ms | 1ms  | 1ms   | 8ms    | 85ms     |
| Update All               | 1ms | 1ms | 1ms  | 3ms   | 48ms   | 2844ms   |
| Update All (with filter) | 1ms | 1ms | 1ms  | 3ms   | 23ms   | 455ms    |
| Update One               | 1ms | 1ms | 1ms  | 2ms   | 18ms   | 176ms    |
| Update One (with filter) | 1ms | 1ms | 1ms  | 3ms   | 18ms   | 179ms    |
| Delete All               | 1ms | 1ms | 1ms  | 2ms   | 37ms   | 2730ms   |
| Delete All (with filter) | 1ms | 1ms | 1ms  | 3ms   | 36ms   | 1265ms   |
| Delete One               | 1ms | 1ms | 1ms  | 3ms   | 17ms   | 189ms    |
| Delete One (with filter) | 1ms | 1ms | 1ms  | 2ms   | 20ms   | 182ms    |
| Delete Collection        | 0ms | 0ms | 0ms  | 1ms   | 5ms    | 77ms     |

## License

[Creative Commons](LICENSE.md)