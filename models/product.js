const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
    title: { type:String, required:true },
    price: { type:Number, required:true },
    description: { type:String, required:true },
    imageUrl: { type:String, required:true }
});

module.exports = mongoose.model('Product', productSchema);

// const Cart = require('./cart');
// const getDb = require('./../util/database_mongo').getDb;
// const mongodb = require('mongodb');

// class Product {

//     constructor(title, imageUrl, description, price, id, userId)  {
//         this.title = title;
//         this.imageUrl = imageUrl;
//         this.description = description;
//         this.price = price;
//         this._id = id ? new mongodb.ObjectID(id) : null;
//         this.userId = userId;
//     }

//     save() {
//         const db = getDb();
//         let op;

//         /**
//          * If this is an object we created and are now inserting,
//          * _id will be undefined.
//          * If this is a product we fetched from mongo, _id will
//          * be an object id as a string.
//          */
//         if (this._id) {
//             op = db.collection('products').findOneAndReplace({ _id: this._id }, this); // update all fields
//         } else {
//             op = db.collection('products').insertOne(this); 
//         }

//         return op
//             .then( (response) => {
//                 // TODO check response
//             })
//             .catch(err => {
//                 console.log(err);
//             });
//     }

//     static fetchAll() {
//         const db = getDb();
//         return db
//             .collection('products')
//             .find({})
//             .toArray()
//             .then(products => {
//                 return products;
//             })
//             .catch(err => {
//                 console.log(err);
//                 throw err;
//             });
//     }

//     static getProductById(id) {
//         const db = getDb();
//         return db.collection('products')
//             .findOne({ _id: new mongodb.ObjectID(id) })
//             .then(product => product)
//             .catch(err => console.log(err));
//     }

//     static removeById(id) {
//         const db = getDb();

//         /**
//          * 1. If such a product exists, return it and pass its id and price to the cart.
//          * 2. Cart removes that product and decrements the total price of the cart.
//          * 3. Remove from the products collection.
//          * 
//          */
//         return db.collection('products').findOne({ _id: new mongodb.ObjectID(id) })
//             .then(product => {
//                 if (product) {
//                     Cart.deleteProduct(id, product.price);
//                     return db.collection('products').findOneAndDelete({ _id: product._id})
//                 }
//             })
//             .catch(err => {
//                 console.log(err);
//                 throw err;
//             });
//     }
// }

// module.exports = Product;