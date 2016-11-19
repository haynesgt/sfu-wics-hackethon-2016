var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var low = require('lowdb');
var _ = require('lodash');

function createId() {
  // it should return a bunch of random digits
  // it should return something matching [0-9]*
  // it should return at least 5 digits
  return (Math.random() + '').slice(2);
}

var db = low('database/ants.json');

db.defaults({colonies: {}, users: {}, workers: {}});

var app = express();

app.use(cookieParser());

// parse application/x-www-form-urlencoded parser
app.use(bodyParser.urlencoded({extended: false}));

app.use(bodyParser.json());

app.use('/', express.static('client'));

app.post('/api/users', function(req, res, next) {
  // it should create a user in the database
  // it should give the user a unique id
  // it should return {userId: number, user: {created: dateString}}
  var users;
  users = db.get('users').value();
  if (!users) {
    users = {};
  }
  var userId;
  do { userId = createId(); }
  while (users[userId]);
  var user = {created: (new Date())};
  db.set('users.' + userId, user).value();
  res.json({id: userId, user: user});
});

app.get('/api/colonies', function(req, res, next) {
  // it should return a list of all colonies that exist
  var colonies;
  try { colonies = db.get('colonies').value(); }
  catch (error) { colonies = {}; }
  res.json(colonies);
});

app.get('/api/colonies/:colonyId', function(req, res, next) {
  try { res.json(db.get('/colonies/' + req.params.colonyId).value()); }
  catch (error) { res.end('error'); }
});

app.post('/api/colonies', function(req, res, next) {
  // it should reject requests that have no userId
  // it should reject requests that have no colonyName
  // it should update a colony when the user already has one
  // it should create a colony when the user has none
  var userId = req.body.userId;
  if (!userId) {
    res.status(500);
    res.end('error: no userId');
    return;
  }
  var colonyName = req.body.colonyName;
  if (!colonyName) {
    res.status(500);
    res.end('error: no colonyName');
    return;
  }
  // find the user
  var user;
  try { user = db.get('users.' + userId).value(); }
  catch (error) { }
  if (!user) {
    res.status(500);
    res.end('error: no user having id ' + userId);
    console.log(db.data);
    return;
  }
  if (user.colonyId) {
    // update a colony when the user already has one
    var colony = { name: colonyName, location: {x: 0, y: 0} };
    try {
      db.set('colonies' + user.colonyId, colony).value();
    }
    catch (error) {
      res.status(500);
      res.end('error: could not update colony');
      return;
    }
    var colonyId = user.colonyId;
    res.json({id: colonyId, colony: colony});
  } else {
    // create a colony when the user has none
    var colonies;
    colonies = db.get('colonies').value();
    if (!colonies) { colonies = {}; }
    var colonyId;
    do { colonyId = createId(); }
    while (colonies[colonyId]);
    colony = {name: colonyName, location: {x: 0, y: 0}};
    try {
      db.set('colonies.' + colonyId, colony).value();
      db.set('users.' + userId + '.colonyId', colonyId).value();
    } catch (error) {
      res.status(500);
      res.end('error: could not create colony');
      return;
    }
    res.json({id: colonyId, colony: colony});
  }
});

app.get('/api/food', function(req, res, next) {
  var resources = [];
  try { resources = db.get('food'); }
  catch (error) { }
  res.json(resources);
});

app.get('/api/workers', function(req, res, next) {
  var workers = {};
  try { workers = db.get('workers'); }
  catch (error) { }
  res.json(workers);
});

app.post('/api/workers', function(req, res, next) {
  // it should create a worker if the user's colony supports it
});

app.listen(8080, function() {
  console.log('app listening on port 8080...');
});

