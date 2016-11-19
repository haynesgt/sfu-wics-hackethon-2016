var JsonDB = require('node-json-db');
var db = new JsonDB(
  'database/ants',
  true, // save after each push
  false // not human readable
);

db.push('/colonies', {name: 'me'});

var express = require('express');
var app = express();

app.get('/', function(req, res, err) {
  res.end(JSON.stringify(db.getData('/colonies')));
});

app.listen(8080, function() {
  console.log('app listening on port 8080...');
});
