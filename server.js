var JsonDB = require('node-json-db');
var express = require('express');
var cookieParser = require('cookie-parser');

var db = new JsonDB(
  'database/ants',
  true, // save after each push
  true // not human readable
);

var app = express();

app.use(cookieParser());

app.use('/', express.static('client'));

app.get('/api', function(req, res, err) {
  var colonies = db.getData('/colonies');
  db.push('/access[]', (new Date()).toJSON());
  res.end(JSON.stringify(colonies));
});

app.listen(8080, function() {
  console.log('app listening on port 8080...');
});
