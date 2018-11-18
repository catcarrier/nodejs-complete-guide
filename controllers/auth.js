const User = require('../models/user');

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: 'login',
        pageTitle: 'Login',
        isAuthenticated: false
    })
}

exports.postLogin = (req, res, next) => {
    // session is added to request by express-session middleware

    // TODO authenticate, look up the real user and attach to session
    // look up the dummy user, attach to session
    User.findById("5beb8feeb37097168acc95a3")
        .exec()
        .then(user => {
            req.session.user = user;
            req.session.isLoggedIn = true;
            req.session.save((err) => {
                if(err) { console.log(err)}
                return res.redirect('/');
            });
        })
        .catch(err => {
            console.log(err);
            res.redirect('/');
        });
}

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        if(err) { console.log(err) }
        res.redirect('/')
    })
}