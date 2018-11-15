const mongo = require('mongodb');
const User = require('./models/user');
const mongoConnect = require('./util/database_mongo').mongoConnect;
const getDb = require('./util/database_mongo').getDb;

mongoConnect(() => {
    User.findById("5beb4c7eb643ca9904122437")
        .then(user => {
            console.log(user);
            const id = new mongo.ObjectId("5beaee5190b2e7c7ad30491a");
            // console.log( id == user.cart.items[0].productId );

            // console.log( id instanceof mongo.ObjectId );
            // console.log( user.cart.items[0].productId instanceof mongo.ObjectId );
            console.log( id, user.cart.items[0].productId );
            console.log( id.equals(user.cart.items[0].productId) );
            console.log( id.equals("5beaee5190b2e7c7ad30491a") );

            getDb( (db) => db.close() );
            return process.exit(0);

        })
        .catch(err => {
            console.log(err)
        })
})


