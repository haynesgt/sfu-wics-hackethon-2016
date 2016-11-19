var JsonDB = require('node-json-db');
var db = new JsonDB('database/ants',
  true, // save after each push
  false // not human readable
);

db.push('/colonies/1', 'colony1');
