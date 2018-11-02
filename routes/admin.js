const express = require('express');

const router = express.Router();

router.get('/add-product', (req,res,next) => {
    res.send('<form action="/admin/add-product" method="POST"><input type="text" name="product"><button type="submit">Save</button>');
});

router.post('/add-product', (req,res,next) => {
    res.redirect('/');
});

module.exports = router;