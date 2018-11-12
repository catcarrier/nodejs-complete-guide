const Client = require('./../util/database_mongo');
const mongo = require('mongodb');


module.exports = class Cart {

    static addProduct(id, productPrice) {

        //console.log("addProduct:", id, productPrice);

        return new Promise((resolve, reject) => {

            // Get the cart
            Cart.fetchAll()
                .then((cart) => {

                    // Check that this product 
                    const client = Client.getClient();
                    const productCollection = client.db().collection('products');
                    productCollection.findOne({ _id: new require('mongodb').ObjectID(id) }, {}, (err, result) => {

                        //console.log('Product.addProduct, findOne result =>', result);

                        if (err) {
                            return reject(err);
                        } else if (!result) {
                            return reject('No such product');
                        }
                    });

                    // Get the index of this product in the cart.
                    const existingProductIndex = cart.products.findIndex(prod => prod._id === id);

                    //console.log('existingProductIndex', existingProductIndex);

                    const existingProduct = cart.products[existingProductIndex];

                    //console.log('existingProduct', existingProduct);

                    if (existingProduct) {
                        var updatedProduct = { ...existingProduct };
                        updatedProduct.quantity = updatedProduct.quantity + 1;
                        cart.products[existingProductIndex] = updatedProduct;
                    } else {
                        var newProduct = { _id: id, quantity: 1 };
                        cart.products = [...cart.products, newProduct];
                    }

                    cart.totalPrice = cart.totalPrice + productPrice;

                    //console.log('cart is now ', cart);

                    Cart.save(cart);
                    resolve();
                })
                .catch( err => { 
                    reject(err)
                });
        }); // Promise
    }; // fx addProduct

    static save(cart) {
        const client = Client.getClient();
        const cartCollection = client.db().collection('cart');
        cartCollection.findOneAndDelete({}, (err, result) => {
            cartCollection.insertOne(cart, {}, (err, result) => {
                if(err) { console.log(err) }
            })
        })
    }

    static fetchAll() {
        const client = Client.getClient();
        const cartCollection = client.db().collection('cart');
        return new Promise((resolve, reject) => {
            cartCollection.findOne({}, (err, result) => {
                if (!err) {
                    if (result) {
                        resolve(result);
                    } else {
                        resolve({ _id: null, products: [], totalPrice: 0 })
                    }
                } else {
                    reject(err);
                }
            });
        });
    }

    static deleteProduct(id, price) {

        getCartContentsFromFile(cart => {

            if (cart.products.length < 1) { return; }

            // is this product in the cart? If no, bail out.
            const product = cart.products.find(p => p.id === id);
            if (!product) { return; }

            // make a copy of the cart
            // Note the assumption that the product appears just once, irrespective of qty
            const updatedCart = { ...cart };
            const quantity = product.quantity;

            // Filter that product out of the products array.
            // Decrement the total price.
            updatedCart.totalPrice -= quantity * Number.parseFloat(price);
            updatedCart.products = updatedCart.products.filter(p => p.id != product.id);

            Cart.save(updatedCart);
        });
    }

    static getCart() {
        const client = Client.getClient();
        const cartCollection = client.db().collection('cart');
        return new Promise((resolve, reject) => {
            cartCollection.findOne({}, (err, result) => {
                if (!err) {
                    console.log(result);
                    if (!result) {
                        resolve({ "products": [], "totalPrice": 0 });
                    } else {
                        resolve(result);
                    }
                } else {
                    reject(err);
                }
            });
        });
    }
}