const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Order = require('./order');
const Product = require('./product');

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    cart: {
        items: [{
            productId: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }]
    }
});

// no fat arrow on this signature
userSchema.methods.addToCart = function (product) {

    const updatedCart = { ...this.cart };
    const cartProductIndex = updatedCart.items.findIndex(item => item.productId.equals(product._id));

    if (cartProductIndex >= 0) {
        updatedCart.items[cartProductIndex].quantity++;
    } else {
        const cartItem = { productId: product._id, quantity: 1 };
        updatedCart.items.push(cartItem);
    }
    this.cart = updatedCart;
    return this.save()
}

userSchema.methods.removeFromCart = function (productId) {
    const updatedCartItems = this.cart.items.filter(i => i.productId.toString() != productId);
    this.cart.items = updatedCartItems;
    return this.save();
}

userSchema.methods.addOrder = function () {
    if (this.cart.length < 1) { return; }

    const order = new Order({
        user: {
            userId: this._id
        },
        items: [...this.cart.items]
    });

    return order.save()
        .then( result => {
            this.cart.items.length=0;
            return this.save();
        } )
        .catch(err => {
            console.log(err);
        })
}

/**
 * Return the orders for this, marked up with additional details
 * from the product collection.
 */
userSchema.methods.getOrders = function() {
    return Order.find({'user.userId': this._id})
        .exec()
        .then( orders => {
            //console.log(orders);

            // work off a temporary copy
            const tempOrders = [...orders];

            // add the product title, description...
            tempOrders.forEach(order => {
                order.items.forEach(item => {
                    Product.findOne({_id:item.productId})
                        .exec()
                        .then( product=> {
                            console.log('found matching product ', product)
                            item.title = product.title;
                            item.price = product.price;
                            item.description = product.description;
                            item.imageUrl = product.imageUrl;

                            console.log('item is now ', item)
                        } );
                });
            });

            tempOrders.forEach( o => {
                o.items.forEach(i => {
                    console.log(i)
                })
            });
            



            return tempOrders
        } )
        .catch(err => {
            console.log(err);
        })
}

module.exports = mongoose.model('User', userSchema);


//     getOrders() {
//         const db = getDb();
//         return db.collection('orders')
//             .find({ 'user.userId': this._id })
//             .toArray()
//             .then(orders => {
//                 return orders;
//             })
    // }

//     static findById(id) {
//         const db = getDb();
//         return db.collection('users').findOne({ _id: new mongo.ObjectID(id) });
//     }
// }