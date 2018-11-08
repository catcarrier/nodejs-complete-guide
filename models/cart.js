const fs = require('fs');
const path = require('path');

const p = path.join(path.dirname(process.mainModule.filename), 'data', 'cart.json');

const getCartContentsFromFile = cb => {
    fs.readFile(p, (err, fileContent) => {
        let cart = { products: [], totalPrice: 0 }
        if (!err) {
            cart = JSON.parse(fileContent);
        }
        cb(cart);
    });
}

module.exports = class Cart {

    static addProduct(id, productPrice) {

        // fetch the previous cart
        // check if this id is in the cart
        // add new product or increment quantity
        getCartContentsFromFile(cart => {
            const existingProductIndex = cart.products.findIndex(prod => prod.id === id);
            const existingProduct = cart.products[existingProductIndex];
            if (existingProduct) {
                var updatedProduct = { ...existingProduct };
                updatedProduct.quantity = updatedProduct.quantity + 1;
                cart.products[existingProductIndex] = updatedProduct;
            } else {
                var newProduct = { id: id, quantity: 1 };
                cart.products = [...cart.products, newProduct];
            }
            cart.totalPrice = cart.totalPrice + productPrice;
            this.save(cart);
        });
    }

    static save(cart) {
        fs.writeFile(p, JSON.stringify(cart), err => {
            if (err) { console.log(err); }
        });
    }

    static fetchAll(cb) {
        getCartContentsFromFile(cb);
    }


}