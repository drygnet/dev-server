const express = require('express');
const app = express();
const mongodb = require('mongodb');
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const Ajv = require('ajv')

const config = require('./db');
const PORT = 4000;
const client = mongodb.MongoClient;


client.connect(config.DB, function (err, client) {
    if (err) {
        console.log('database is not connected')
    }
    else {
        console.log('connected')
        dbclient = client
    }
});

app.get('/apa', function (req, res) {
    res.json({ "hello": "world" });
});

app.get('/:db/:collection', function (req, res) {
    var db = dbclient.db(req.params.db);
    db.collection(req.params.collection, function (err, collection) {
        collection.find().toArray(function (err, items) {
            res.send(items);
        });
    });
});


app.post('/:db/:collection/find', jsonParser, function (req, res) {
    var db = dbclient.db(req.params.db);
    db.collection(req.params.collection, function (err, collection) {
        collection.find(req.body).toArray(function (err, items) {
            res.send(items);
        });
    });
});

app.post('/:db/:collection', jsonParser, function (req, res) {
    var db = dbclient.db(req.params.db);
    db.collection(req.params.collection, function (err, collection) {
        collection.insertOne(req.body, function (err, dbresp) {
            if (err) {
                validate(req, res, err)
            } else {
                res.send(dbresp.ops[0])
            }
        })
    });
});

app.get('/:db/:collection/schema', async function (req, res) {
    var schema = await getShema(req.params.db, req.params.collection)
    console.log(schema)
    res.send(schema)

});

app.post('/:db/:collection/schema', jsonParser, function (req, res) {
    var db = dbclient.db(req.params.db);
    db.command({
        "collMod": req.params.collection,
        "validator": req.body,
        "validationLevel": "strict"
    }, function (err, info) {
        res.send(info)
    });
})

async function validate(req, res, err) {
    var schema = await getShema(req.params.db, req.params.collection)
    var data = req.body
    var ajv = new Ajv();
    var valid = ajv.validate(schema.$jsonSchema, data);
    if (!valid) {
        res.send({ error: err, validationError: ajv.errors })
    } else {
        res.send({error: err})
    }
}

async function getShema(dbname, collection) {
    var db = dbclient.db(dbname);
    collinfo = await db.listCollections({ name: collection }).next()
    return collinfo.options.validator;
}

app.listen(PORT, function () {
    console.log('Your node js server is running on PORT:', PORT);
});
