const getDb = require('./../util/database_mongo').getDb;
const mongo = require('mongodb');

class User {
    constructor(username, email, cart, id) {
        this.name = username;
        this.email = email;
        this.cart = cart; // {items: []}
        this._id = id ? new mongo.ObjectID(id) : null;
    }

    save() {
        const db = getDb();
        let op;
        if (this._id) {
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
        //console.log( this.cart ? this.cart : "User: cart is null");
        let updatedCart;
        let cartItem;

        //console.log(product);

        // Get a copy of the user's cart, or an empty cart
        if (this.cart) {
            updatedCart = { ...this.cart };
        } else {
            updatedCart = { items: [] };
        }

        // console.log(this.cart);
        // console.log(updatedCart);

        // Does the @product exist in the user's cart?
        const cartIndex = updatedCart.items.findIndex(item => item.productId.equals(product._id));

        // console.log("product is at index ", cartIndex);

        if (cartIndex >= 0) {
            // console.log("updating existing cart item");
            cartItem = updatedCart.items[cartIndex];
            cartItem.quantity++;
        } else {
            // console.log("adding new cart item");
            cartItem = { productId: product._id, quantity: 1 };
            updatedCart.items.push(cartItem);
        }

        // Overwrite the user's cart with the updated copy
        // and then overwrite the one in the user object to match
        const db = getDb();
        return db
            .collection('users')
            .updateOne(
                { _id: this._id },
                { $set: { cart: updatedCart } }
            ).then(() => {
                this.cart = updatedCart;
            })
    }

    /**
     * Return a copy of the cart with product details filled in
     */
    getCart() {
        const db = getDb();
        // get all the _ids in the cart items
        const productIds = this.cart.items.map(item => item.productId);

        // for each product, add the quantity value of the matching product in the cart
        return db.collection('products')
            .find({ _id: { $in: productIds } })
            .toArray()
            .then(products => {
                return products.map(p => {
                    return {
                        ...p,
                        quantity: this.cart.items.find(i => i.productId.equals(p._id)).quantity
                    };
                })
            })
            .catch(err => { console.log(err) })
    }

    removeFromCart(productId) {
        const db = getDb();
        const updatedCart = { items: [...this.cart.items.filter(i => !(i.productId.equals(productId)))] };
        return db.collection('users')
            .updateOne({ _id: this._id }, { $set: { cart: updatedCart } })
            .catch(err => {
                console.log(err);
            });
    }

    /**
     * Create an order fom the user's cart.
     * Empty the user's cart.
     */
    addOrder() {
        const db = getDb();
        return this.getCart()
            .then(products => { /* product details + quantity */
                const order = {
                    user: {
                        userId: this._id,
                        name: this.name,
                        email: this.email
                    },
                    items: products
                };
                return db.collection('orders').insertOne(order)
            })
            .then(result => {
                this.cart = { items: [] };
                return db.collection('users')
                    .updateOne(
                        { _id: this._id },
                        { $set: { cart: this.cart } }
                    );
            });
    }

    getOrders() {
        const db = getDb();
        return db.collection('orders')
            .find({ 'user.userId': this._id })
            .toArray()
            .then(orders => {
                return orders;
            })
    }

    static findById(id) {
        const db = getDb();
        return db.collection('users').findOne({ _id: new mongo.ObjectID(id) });
    }
}


module.exports = User;