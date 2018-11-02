const express = require('express');
const path = require('path');

const router = express.Router();

router.get( "/", (req, res, next) => {
    // starting from the current folder, go up one level, then down into views
    res.sendFile( path.join( __dirname, '../', 'views', 'shop.html' ));
} );

module.exports = router;