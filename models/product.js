const fs = require('fs');
const path = require('path');
const Cart = require('./cart');
const p = path.join(path.dirname(process.mainModule.filename), 'data', 'products.json');

const getProductsFromFile = cb => {
    fs.readFile(p, (err, fileContent) => {
        if (err) {
            return cb([]); // exit here
        }
        if(fileContent.length < 1) {
            // file exists but is empty
            return cb([]);
        }
        cb(JSON.parse(fileContent));
    });
}

module.exports = class Product {
    constructor(id /* or null */, title, imageUrl, description, price) {
        this.id = id,
            this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    save() {
        getProductsFromFile(products => {
            if (this.id /* not null -> is existing product, should be in storage */) {
                const existingProductIndex = products.findIndex(p => p.id === this.id);
                let updatedProducts = [...products];
                updatedProducts[existingProductIndex] = this;
                fs.writeFile(p, JSON.stringify(updatedProducts), err => {
                    if (err) console.log(err);
                });
            } else {
                this.id = Math.random().toString();
                let updatedProducts = [...products];
                updatedProducts.push(this);
                fs.writeFile(p, JSON.stringify(updatedProducts), err => {
                    if (err) console.log(err);
                });
            }

        });
    }



    static fetchAll(cb) {
        getProductsFromFile(cb);
    }

    static getProductById(id, cb) {
        getProductsFromFile(products => {
            const product = products.find(p => p.id === id);
            cb(product);
        });
    }

    static removeById(id) {
        Product.fetchAll(products => {
            const product = products.find(p => p.id === id);
            const productPrice = product.price; // need this to update the cart
            const updatedProducts = products.filter(p => p.id != id);
            fs.writeFile(p, JSON.stringify(updatedProducts), err => {
                if (!err) {
                    Cart.deleteProduct(id, productPrice);
                }
            });
        });
    }
}