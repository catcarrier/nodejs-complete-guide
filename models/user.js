const getDb = require('./../util/database_mongo').getDb;
const mongo = require('mongodb');

class User {
    constructor(username, email, id) {
        this.name = username;
        this.email = email;
        this._id = id ? new mongo.ObjectID(id) : null;
    }

    save(){
        const db = getDb();
        let op;
        if(this._id) {
            op = db.collection('users').findOneAndReplace({ _id: this._id }, this);
        } else {
            op = db.collection('users').insertOne(this);
        }
        return op;
    }

    static findById(id) {
        const db = getDb();
        return db.collection('users').findOne({_id:new mongo.ObjectID(id)});
    }
}


module.exports = User;