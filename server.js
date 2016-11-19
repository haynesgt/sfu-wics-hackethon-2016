var JsonDB = require('node-json-db');
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var _ = require('lodash');

function createId() {
  // it should return a bunch of random digits
  // it should return something matching [0-9]*
  // it should return at least 5 digits
  return (Math.random() + '').slice(2);
}

var db = new JsonDB(
  'database/ants',
  true, // save after each push
  true // not human readable
);

var app = express();

app.use(cookieParser());

// parse application/x-www-form-urlencoded parser
app.use(bodyParser.urlencoded({extended: false}));

app.use('/', express.static('client'));

app.post('/api/users', function(req, res, next) {
  // it should create a user in the database
  // it should give the user a unique id
  // it should return {userId: number, user: {created: dateString}}
  var users;
  try { users = db.getData('/users'); }
  catch (e) { users = []; }
  var userId;
  do { userId = createId(); }
  while (users[userId]);
  var user = {created: (new Date())};
  db.push('/users/' + userId, user);
  res.json({id: userId, user: user});
});

app.get('/api/colonies', function(req, res, next) {
  // it should return a list of all colonies that exist
  var colonies;
  try { colonies = db.getData('/colonies'); }
  catch (error) { colonies = []; }
  res.json(colonies);
});

app.get('/api/colonies/:colonyId', function(req, res, next) {
  try { res.json(db.getData('/colonies/' + req.params.colonyId)); }
  catch (error) { res.end('error'); }
});

app.post('/api/colonies', function(req, res, next) {
  // it should reject requests that have no userId
  // it should reject requests that have no colonyName
  // it should update a colony when the user already has one
  // it should create a colony when the user has none
  var userId = req.body.userId;
  if (!userId) {
    res.end('error: no userId');
    return;
  }
  var colonyName = req.body.colonyName;
  if (!colonyName) {
    res.end('error: no colonyName');
    return;
  }
  // find the user
  var user;
  try { user = db.getData('/users/' + userId); }
  catch (error) { }
  if (!user) {
    res.end('error: userId ' + userId + ' does not match any user');
    return;
  }
  if (user.colonyId) {
    // update a colony when the user already has one
    var colony = { name: colonyName, location: {x: 0, y: 0} };
    try {
      db.push('/colonies/' + user.colonyId, colony);
    }
    catch (error) {
      res.end('error: could not update colony');
      return;
    }
    var colonyId = user.colonyId;
    res.json({id: colonyId, colony: colony});
  } else {
    // create a colony when the user has none
    var colonies = {};
    try { colonies = db.getData('/colonies'); }
    catch (error) { res.end(''); }
    var colonyId;
    do { colonyId = createId(); }
    while (colonies[colonyId]);
    colony = {name: colonyName, location: {x: 0, y: 0}};
    try {
      db.push('/users/' + userId, {colonyId: colonyId}, false);
      db.push('/colonies/' + colonyId, colony);
    } catch (error) {
      res.end('error: could not create colony');
      return;
    }
    res.json({id: colonyId, colony: colony});
  }
});

app.listen(8080, function() {
  console.log('app listening on port 8080...');
});

