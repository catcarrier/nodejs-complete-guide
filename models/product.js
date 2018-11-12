const Cart = require('./cart');
const mongo = require('./../util/database_mongo');

module.exports = class Product {
    constructor(id /* or null */, title, imageUrl, description, price) {
        this.id = id,
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    save() {
        const client = mongo.getClient();
        const productsCollection = client.db().collection('products');

        // Out object uses 'id' but mongo calls it _id.
        // replace 'id' with '_id' before saving to mongo.
        var updatedProduct = {...this};
        updatedProduct._id = updatedProduct.id;
        delete updatedProduct.id;

        if(!updatedProduct.id) {
            /* No id - is new product - do an insert */
            return new Promise( (resolve, reject) => {
                productsCollection.insertOne(updatedProduct, {}, (err, result) => {
                    if(err) {
                        reject(err.message);
                    } else {
                        resolve();
                    }
                });
            });
        } else {
            /* not null -> is existing product, do update */
            return new Promise( (resolve, reject) => {
                productsCollection.findOneAndReplace({_id : new require('mongodb').ObjectID(updatedProduct._id)}, this, (err, result) => {
                    if(err) {
                        reject(err.message);
                    } else {
                        resolve();
                    }
                });
            });
        };
    }

    static fetchAll() {
        return new Promise((resolve, reject) => {
            const client = mongo.getClient();
            const productsCollection = client.db().collection('products');
            productsCollection.find({}).toArray( (err, docs) => {
                if(err) {
                    reject(err);
                } else {
                    const products = [];
                    docs.forEach( doc => {
                        const product = new Product( doc._id, doc.title, doc.imageUrl, doc.description, doc.price );
                        products.push(product);
                    });
                    resolve(products);
                };
            });
        });
    }

    static getProductById(id) {
        //console.log("Product.getProductById", id);
        return new Promise( (resolve, reject) => {
            const client = mongo.getClient();
            const productsCollection = client.db().collection('products');
            productsCollection.findOne({_id: new require('mongodb').ObjectID(id)}, {}, (err, result) => {
                if(!err) {
                    const product = new Product(
                        result._id, 
                        result.title, 
                        result.imageUrl, 
                        result.description, 
                        result.price);
                    return resolve(product);
                } else {
                    return reject(err);
                }
            });
        });
    }

    static removeById(id) {
        return new Promise( (resolve, reject) => {
            // TODO


        })


        // Product.fetchAll(products => {
        //     const product = products.find(p => p.id === id);
        //     const productPrice = product.price; // need this to update the cart
        //     const updatedProducts = products.filter(p => p.id != id);
        //     fs.writeFile(p, JSON.stringify(updatedProducts), err => {
        //         if (!err) {
        //             Cart.deleteProduct(id, productPrice);
        //         }
        //     });
        // });


    }
}