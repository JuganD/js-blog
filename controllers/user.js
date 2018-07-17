const encryption = require("../utilities/encryption");
const User = require('../models').User;

module.exports = {
    registerGet: (req, res) => {
        res.render('user/register');
    },

    registerPost: (req, res) => {
        let registerArgs = req.body;

        User.findOne({where: {email: registerArgs.email}}).then(user => {
            let errorMsg = '';
            if (user) {
                errorMsg = 'User with the same username exists!';
            } else if (registerArgs.password !== registerArgs.repeatedPassword) {
                errorMsg = 'Passwords do not match!'
            }

            if (errorMsg) {
                registerArgs.error = errorMsg;
                res.render('user/register', registerArgs)
            } else {

                let salt = encryption.generateSalt();
                let passwordHash = encryption.hashPassword(registerArgs.password, salt);

                let userObject = {
                    email: registerArgs.email,
                    passwordHash: passwordHash,
                    fullName: registerArgs.fullName,
                    salt: salt
                };

                User.create(userObject).then(user => {
                    req.logIn(user, (err) => {
                        if (err) {
                            registerArgs.error = err.message;
                            res.render('user/register', registerArgs.dataValues);
                            return;
                        }
                        res.redirect('/')
                    })
                })
            }
        })
    },

    loginGet: (req, res) => {
        res.render('user/login');
    },

    loginPost: (req, res) => {
        let loginArgs = req.body;
        User.findOne({where: {email: loginArgs.email}}).then(user => {
            if (!user || !user.authenticate(loginArgs.password)) {
                loginArgs.error = 'Either username or password is invalid!';
                res.render('user/login', loginArgs);
                return;
            }

            req.logIn(user, (err) => {
                if (err) {
                    res.redirect('/user/login', {error: err.message});
                    return;
                }

                res.redirect('/');
            })
        })
    },
    detailsGet: (req, res) => {
        if (!req.isAuthenticated()) {
            res.redirect('/');
        } else {
            res.render('user/details');
        }

    },
    passChangeGet: (req, res) => {
        if (!req.isAuthenticated()) {
            res.redirect('/');
        } else {
            res.render('user/passchange');
        }
    },
    passChangePost: (req, res) => {
        let passChangeArgs = req.body;
        let userEmail = req.user.email;
        let error = "";

        let currentPass = passChangeArgs.currentPassword;
        let newPass = passChangeArgs.newPassword;
        let repeatPass = passChangeArgs.repeatPassword;


        if (newPass == repeatPass) {
            User.findOne({where: {email: userEmail}}).then(user1 => {
                if (user1.dataValues.passwordHash == encryption.hashPassword(currentPass, user1.dataValues.salt)) {
                    let salt = encryption.generateSalt();
                    let passwordHash = encryption.hashPassword(newPass, salt);

                    User.findOne({where: {email: userEmail}}).then(user => {
                        user.update({
                            passwordHash: passwordHash,
                            salt: salt
                        });
                    });
                    res.redirect('/');

                } else {
                    error = "Current password is invalid!"
                    res.render('user/passchange', {'errorBox':error});
                }
            });
        } else {
            error = "Mismatch between new password and repeat new password. You must type the same password twice!"
            res.render('user/passchange', {'errorBox':error});
        }


    },


    logout: (req, res) => {
        req.logOut();
        res.redirect('/');
    }
};