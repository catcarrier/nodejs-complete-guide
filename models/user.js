const getDb = require('./../util/database_mongo').getDb;
const mongo = require('mongodb');

class User {
    constructor(username, email, cart, id) {
        this.name = username;
        this.email = email;
        this.cart = cart; // {items: []}
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


    /**
     * Add this product to the user's cart, or increment the quantity
     * 
     * @param {*} product 
     */
    addToCart(product) {
        console.log(this.cart.items)
        let cartItem;
        const updatedCart = {...this.cart};
        console.log(product._id)
        const cartIndex = updatedCart.items.findIndex(item => item.productId == product._id);
        console.log(cartIndex);
        if(cartIndex >= 0) {
            cartItem = updatedCart.items[cartIndex];
            cartItem.quantity++;
        } else {
            cartItem = {productId: new mongo.ObjectId(product._id), quantity: 1};
            updatedCart.items.push(cartItem);
        }

        // Save the user's cart to the table
        const db = getDb();
        return db
            .collection('users')
            .updateOne(
                {_id: new mongo.ObjectId(this._id)}, 
                {$set: {cart: updatedCart}}
            );
    }

    static findById(id) {
        const db = getDb();
        return db.collection('users').findOne({_id:new mongo.ObjectID(id)});
    }
}


module.exports = User;