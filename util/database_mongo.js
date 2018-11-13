const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb://localhost:27017/shop';

let _db;

const mongoConnect = (cb) => {
    MongoClient.connect(uri, {useNewUrlParser:true})
        .then( client => {
            _db = client.db();
            cb();
        })
        .catch( err => {
            console.log(err);
            throw err;
        });
}

const getDb = () => {
    if(_db) { 
        return _db; 
    } else {
        throw 'No database found';
    }
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;