const path = require('path');

const p = path.join( path.dirname( process.mainModule.filename ), 'data', 'cart.json' );

const getCartContentsFromFile = cb => {
    fs.readFile(p, (err,fileContent) => {
        if(err) {
            return cb([]); // exit here
        }
        cb( JSON.parse(fileContent) );
    });
}

module.exports = class Cart {
    
    constructor() {
        this.itemsToAdd = []; 
    }

    add(p) {
        this.itemsToAdd.push(p);
        this.save();
    }

    save() {
        getCartContentsFromFile( list => {
            if(this.itemsToAdd.length > 0) { list.push(this.itemsToAdd); }
            this.itemsToAdd.length=0;
            fs.writeFile(p, JSON.stringify(list), err => {
                if(err) { console.log(err); }
            });  
        });
    }

    static fetchAll(cb) {
        getCartContentsFromFile(cb);
    }


}