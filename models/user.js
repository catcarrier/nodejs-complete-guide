const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Order = require('./order');
const Product = require('./product');

const userSchema = new Schema({
    //name: { type: String, required: true },
    email: { 
        type: String, 
        required: true 
    },
    password: {
        type: String,
        required: true
    },
    resetToken: {
        type: String
    },
    resetTokenExpiration: {
        type: Date
    },
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
    return this.save();
}

userSchema.methods.removeFromCart = function (productId) {
    const updatedCartItems = this.cart.items.filter(i => i.productId.toString() != productId);
    this.cart.items = updatedCartItems;
    return this.save();
}

userSchema.methods.clearCart = function(){
    this.cart.items = [];
    return this.save();
}

module.exports = mongoose.model('User', userSchema);