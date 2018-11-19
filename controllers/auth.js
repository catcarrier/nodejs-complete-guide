const User = require('../models/user');
const bcrypt = require('bcryptjs');
//const flash = require('connect-flash');

exports.getLogin = (req, res, next) => {

    let message = req.flash('errorMessage');
    if(message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }

    res.render('auth/login', {
        path: 'login',
        pageTitle: 'Login',
        errorMessage: message
    })
}


exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email: email })
        .then(user => {
            if (!user) {

                // Becuase we are redirecting, a new req/res will be created, and
                // there is no way to put an error msg onto the user's page.
                // This middleware inserts a msg into the session that persists until used.
                // See getLogin().
                req.flash('errorMessage', 'invalid email or password.');
                return res.redirect('/login');
            }

            bcrypt.compare(password, user.password)
                .then(result => {
                    if (result) {
                        req.session.user = user;
                        req.session.isLoggedIn = true;
                        return req.session.save((err) => {
                            if (err) { console.log(err) }
                            return res.redirect('/');
                        });
                    } else {
                        req.flash('errorMessage','Invalid username or password');
                        return res.redirect('/login');
                    }
                })
                .catch(err => {
                    console.log('compare error: ', err);
                    // TODO add err msg
                    return res.redirect('/login');
                });
        })
        .catch(err => {
            console.log(err);
        })
}

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) { console.log(err) }
        res.redirect('/')
    })
}

exports.getSignup = (req, res, next) => {

    let message = req.flash('errorMessage');
    if(message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }

    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: message
    })
}

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    if(email.length < 1) {
        req.flash('errorMessage','Email is required.');
        return res.redirect('/signup');
    }

    if(password.length==0 || confirmPassword.length==0) {
        req.flash('errorMessage','Type a non-blank value for password');
        return res.redirect('/signup');
    }

    if(password !== confirmPassword) {
        req.flash('errorMessage','Passwords must match');
        return res.redirect('/signup')
    }

    // Is there a user matching this info?
    User.findOne({ email: email })
        .exec()
        .then(user => {
            if (user) {
                req.flash('errorMessage','Email already in use.');
                return res.redirect('/signup')
            }

            return bcrypt.hash(password, 12)
                .then(hash => {
                    const newUser = new User({
                        email: email,
                        password: hash,
                        cart: { items: [] }
                    });
                    return newUser.save();
                })
                .then((result) => {
                    res.redirect('/login')
                });
        })
        .catch(err => {
            console.log(err);
        });
}
