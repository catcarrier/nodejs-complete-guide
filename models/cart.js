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

    static deleteProduct(id, price) {

        getCartContentsFromFile( cart => {

            if(cart.products.length < 1) {return;}

            // is this product in the cart? If no, bail out.
            const product = cart.products.find(p => p.id===id);
            if(!product) { return; }

            // make a copy of the cart
            // Note the assumption that the product appears just once, irrespective of qty
            const updatedCart = {...cart};
            const quantity = product.quantity;

            // Filter that product out of the products array.
            // Decrement the total price.
            updatedCart.totalPrice -= quantity * Number.parseFloat(price);
            updatedCart.products = updatedCart.products.filter(p => p.id != product.id);

            Cart.save(updatedCart);
        } );
    }

    // todo duplicate of fetchAll
    static getCart(cb) {
        getCartContentsFromFile( cart => {
            return cb(cart);
        });
    }

}