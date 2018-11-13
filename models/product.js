const Cart = require('./cart');
const getDb = require('./../util/database_mongo').getDb;
const mongodb = require('mongodb');

class Product {
    constructor( title, imageUrl, description, price ) {
        //this._id = id,
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    save() {
        const db = getDb();
        const productsCollection = db.collection('products');
        const test = require('assert');

        /**
         * If this is an object we created and are now inserting,
         * _id will be undefined.
         * If this is a product we fetched from mongo, _id will
         * be an object id as a string.
         */ 
        if (!updatedProduct._id) {
            return db.collection('products')
                .insertOne(updatedProduct)
                .then( r => {
                    test.equal(1, r.insertedCount);
                })
                .catch( err => {
                    console.log(err);
                } );
        } else {
            return db.collection('products')
                .findOneAndReplace({ _id: new mongodb.ObjectID(updatedProduct._id) })
                .then( r => {
                    test.equal(1, r.ok);
                } )
                .catch( err => {
                    console.log(err);
                } )
        };
    }

    static fetchAll() {
        const db = getDb();
        return db
            .collection('products')
            .find({})
            .toArray()
            .then( products => {
                return products;
            })
            .catch(err => {
                console.log(err);
                throw err;
            });
    }

    static getProductById(id) {
        const db = getDb();
        return db.collection('products')
            .findOne({ _id: new mongodb.ObjectID(id) })
            .then( product => product )
            .catch( err => console.log(err) );
    }

    static removeById(id) {
        const db = getDb();
        return db.collection('products').findOne({_id: new mongodb.ObjectID(id) })
            .then( product => {
                console.log('Product.removeById got product ' + product.description);
                return product.price; // need this to update the cart 
            } )
            .then( productPrice => {
                console.log('Product.removeById got productPrice ' + productPrice);
                return Cart.deleteProduct(id, productPrice);
            } )
            .catch( err => {
                console.log(err);
                throw err;
            });
    }
}

module.exports = Product;