const User = require('../models/user');
const bcrypt = require('bcryptjs');

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: 'login',
        pageTitle: 'Login',
        isAuthenticated: false
    })
}

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                // TODO add error message that no such user
                return res.redirect('/login');
            }

            console.log('starting password compare')
            bcrypt.compare(password, user.password)
                .then(result => {
                    console.log('compare -> ', result);
                    if (result) {
                        req.session.user = user;
                        req.session.isLoggedIn = true;
                        console.log('saving the user...')
                        return req.session.save((err) => {
                            if (err) { console.log(err) }
                            console.log('saving the user... done')
                            return res.redirect('/');
                        });
                    } else {
                        console.log('redirecting to login')
                        // TODO add error message that password does not match
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
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        isAuthenticated: false
    })
}

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    // TODO validate

    // Is there a user matching this info?
    User.findOne({ email: email })
        .exec()
        .then(user => {
            if (user) {
                // TODO show an error message that user already defined
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
