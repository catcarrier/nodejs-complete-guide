const fs = require('fs');
const path = require('path');


module.exports = class Product {
    constructor(title) {
        this.title = title;
    }

    save() {
        const p = path.join( path.dirname( process.mainModule.filename ), 'data', 'products.json' );

        // get existing array by reading the file.
        // Will get error if no file exists -- in that case continue from empty array.
        fs.readFile(p, (err, fileContent) => {
            let products = [];
            if(!err) {
                products = JSON.parse(fileContent);
            }

            // This line is why we need an arrow function for the readfile handler.
            // With a traditional function we would not have the 'this' context.
            products.push( this );

            //console.log('products:', products);

            // write the updated array back into the file
            fs.writeFile(p, JSON.stringify(products), (err) => {
                if(err) { 
                    console.log(err); 
                } else {
                    console.log('updated product file ok');
                }
            });
        });
    }

    static fetchAll(cb) {
        const p = path.join( path.dirname( process.mainModule.filename ), 'data', 'products.json' );
        fs.readFile(p, (err,fileContent) => {
            if(err) {
                cb([]);
            }
            cb( JSON.parse(fileContent) );
        });
    }
}