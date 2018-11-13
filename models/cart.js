const getDb = require('./../util/database_mongo').getDb;
const mongo = require('mongodb');

module.exports = class Cart {

    static addProduct(id) {
        const db = getDb();
        // console.log('Cart.addProduct starting...');

        // look up the product, to confirm it exists, and get the price
        return db.collection('products').findOne({ _id: new require('mongodb').ObjectID(id) })
            .then(product => {
                // console.log('Cart.addProduct got product ' + product.description);
                return product;
            })
            .then(product => {
                // console.log('Cart.addProduct fetching cart...');
                return Cart.getCart()
                    .then(cart => {
                        // console.log('Cart.addProduct got cart:');
                        // console.log(cart);
                        // console.log('Cart.addProduct product is ' + product);

                        // Is this product in the cart? Need to adjust total price.
                        const existingProductIndex = cart.products.findIndex(prod => prod._id === id);
                        const existingProduct = cart.products[existingProductIndex];

                        // If product is in cart, replace with a copy with an incremented quantity
                        if (existingProduct) {
                            var updatedProduct = { ...existingProduct };
                            updatedProduct.quantity = updatedProduct.quantity + 1;
                            cart.products[existingProductIndex] = updatedProduct;
                        } else {
                            var newProduct = { _id: id, quantity: 1 };
                            cart.products = [...cart.products, newProduct];
                        }

                        cart.totalPrice = cart.totalPrice + product.price;

                        //console.log('cart is now ', cart);

                        Cart.save(cart);
                    })
            })
            .catch(err => {
                console.log(err);
                throw err;
            })
    };

    static save(cart) {
        const db = getDb();
        const collection = db.collection('cart');
        collection.findOneAndDelete({})
            .then( () => {
                collection.insertOne(cart);
            })
            .catch( err => {
                console.log(err);
            } )
    }

    // static fetchAll() {
    //     const db = getDb();
    //     return db.collection('cart').findOne({})
    //         .then(cart => {
    //             if (cart) {
    //                 return cart;
    //             } else {
    //                 return { products: [], totalPrice: 0 }; // empty cart
    //             }
    //         })
    //         .catch(err => {
    //             console.log(err);
    //             throw err
    //         });
    // }

    static deleteProduct(id, price) {
        const db = getDb();
        db.collection('cart').findOne({})
            .then(cart => {
                // if there is no cart
                if (!cart) { return; }

                // or if contains no products
                if (cart.products.length < 1) { return; }

                // is this product in the cart? If no, bail out.
                const product = cart.products.find(p => p._id === id);
                if (!product) { return; }

                // make a copy of the cart
                // Note the assumption that the product appears just once, irrespective of qty
                const updatedCart = { ...cart };
                const quantity = product.quantity;

                // Filter that product out of the products array.
                // Decrement the total price.
                updatedCart.totalPrice -= quantity * Number.parseFloat(price);
                updatedCart.products = updatedCart.products.filter(p => p._id != product._id);

                return Cart.save(updatedCart);
            })
            .catch(err => {
                console.log(err);
            })
    }

    static getCart() {
        const db = getDb();
        return db.collection('cart').findOne({})
            .then(cart => { 
                if(cart) {
                    return cart;
                } else { 
                    return { "products": [], "totalPrice": 0 };
                }
            })
            .catch(err => {
                console.log('Cart.getCart: No cart found. Returning an empty cart.');
            })
    }
}