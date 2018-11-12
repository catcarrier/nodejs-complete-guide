const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb://localhost:27017/shop';
let _client;

// TODO how to handle lost connection
const connect = async (callback) => {
    try {
        MongoClient.connect(uri, {useNewUrlParser:true}, (err, client) => {
            _client = client;
            return callback(err);
        })
    } catch (e) {
        throw e
    }
}

const getClient = () => _client;

const disconnect = () => _db.close();

module.exports = { connect, getClient, disconnect }
