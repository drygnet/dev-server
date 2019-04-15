const express = require('express');
const app = express();
const mongodb = require('mongodb');
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()

const config = require('./db');
const PORT = 4000;
const client = mongodb.MongoClient;


client.connect(config.DB, function(err, client) {
    if(err) {
        console.log('database is not connected')
    }
    else {
        console.log('connected')
        dbclient = client
    }
});

app.get('/', function(req, res) {
    res.json({"hello": "world"});
});

app.get('/:db/:collection', function(req, res) {
    var db = dbclient.db(req.params.db);
    db.collection(req.params.collection, function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
});

app.get('/:db/:collection/schema', function(req, res) {
    var db = dbclient.db(req.params.db);
    db.listCollections({name: req.params.collection})
    .next(function(err, collinfo) {
        if (collinfo) {
            res.send(collinfo)
        }
    });
});

app.post('/:db/:collection/schema', jsonParser, function(req, res) {
    var db = dbclient.db(req.params.db);
    db.command({
        "collMod": req.params.collection,
        "validator": req.body,
        "validationLevel": "strict"
      },function(err, info){
          res.send(info)
      });
})

app.post('/:db/:collection/find', jsonParser, function(req, res) {
    var db = dbclient.db(req.params.db);
    db.collection(req.params.collection, function(err, collection) {
        collection.find(req.body).toArray(function(err, items) {
            res.send(items);
        });
    });
});

app.post('/:db/:collection', jsonParser, function(req, res){
    var db = dbclient.db(req.params.db);
    db.collection(req.params.collection, function (err, collection) {
        collection.insertOne(req.body, function(err, dbresp){
            if(err){
                res.status(400)
                res.send(err)
            } else {
            res.send(dbresp.ops[0])
            }
        })
    });
});

app.listen(PORT, function(){
    console.log('Your node js server is running on PORT:',PORT);
});