/**
 * Created by iamhosseindhv on 02/09/2017.
 */
var express = require('express');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var expressValidator = require('express-validator');
var router = express.Router();
const saltRounds = 10;


/* GET authentication. */
router.get('/', function (req, res) {
    res.render('authenticate', {
        title: 'Sign in / Login'
    });
});



/* POST authentication. */
router.post('/', function(req, res, next) {
    //validate inputs first
    const errors = validateInputs(req, true);

    if (errors){
        const response = {
            success: false,
            status: 'Authentication failed',
            message: errors,
            isValidInputs: false
        };
        res.json(response);
    } else {
        const email = req.body.email;
        const password = req.body.password;

        const db = require('../database');
        db.query("SELECT id, password FROM users WHERE email = ?", [email], function (err, results) {
            if (err) throw err;

            //no user with such username found
            if (results.length === 0){
                const errors = {
                    emails: [{description: 'Email not found. Please try again.'}],
                    passwords: [],
                    passwordMatches: []
                };
                const response = {
                    success: false,
                    status: 'Authentication failed.',
                    message: errors,
                    isValidInputs: true
                };
                res.json(response);

            } else {
                //there is a user, let's check the entered password
                const hash = results[0].password.toString();
                bcrypt.compare(password, hash, function (err, response) {
                    if (err) throw err;

                    // correct password, create a token, send it through cookie, send response
                    if (response === true){
                        const user = {
                            user_id: results[0].id
                        };
                        const token = jwt.sign(user, process.env.JWT_SECRET, {
                            expiresIn: 2400000 // expires in 40min
                        });
                        req.session.token = token;
                        const response = {
                            success: true,
                            status: 'Authentication successful.',
                            message: '',
                            no_err: true,
                            isValidInputs: true
                        };
                        res.json(response);

                    } else {
                        //wrong password, authentication failed
                        const errors = {
                            emails: [],
                            passwords: [{description: 'Wrong Password. Please try again.'}],
                            passwordMatches: []
                        };
                        const response = {
                            success: false,
                            status: 'Authentication failed.',
                            message: errors,
                            isValidInputs: true
                        };
                        res.json(response);
                    }
                });
            }
        });
    }
});



router.post('/create', function (req, res, next) {
    //validate inputs
    const errors = validateInputs(req, false);
    if (errors){
        const response = {
            success: false,
            status: 'Authentication failed',
            message: errors,
            isValidInputs: false
        };
        res.json(response);
    } else {

        const email = req.body.email;
        const password = req.body.password;
        const db = require('../database');
        //hash password
        bcrypt.hash(password, saltRounds, function (err, hashedPassword) {
            //add newly created user to the database
            db.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword], function (err) {
                if (err) {
                    if (err.code = 'ER_DUP_ENTRY') {
                        const errors = {
                            emails: [{description: 'Email already exists. Please enter another email.'}],
                            passwords: [],
                            passwordMatches: []
                        };
                        const response = {
                            success: false,
                            status: 'Authentication failed.',
                            message: errors,
                            isValidInputs: true
                        };
                        res.send(response);
                    } else {
                        throw err; //any other error other than duplicate email
                    }
                } else {
                    const response = {
                        success: true,
                        status: 'Authentication successful.',
                        message: 'User successfully created.',
                        no_err: true,
                        isValidInputs: true
                    };
                    res.send(response);
                }
            });
        });
    }
});


router.post('/logout', function(req, res, next) {
    req.session = null;
    res.json({
        success: 'true',
        status: 'successfully logged out'
    });
});


function validateInputs(req, isFromLogin) {
    req.checkBody('email', 'Email cannot be empty.').notEmpty();
    req.checkBody('email', 'The email you entered is invalid, please try again.').isEmail();
    req.checkBody('email', 'Email must be between 4-100 characters long, please try again.').len(4, 100);
    req.checkBody('password', 'Password must be at least 8 characters long.').len(8, 100);
    req.checkBody("password", "Password must include at least one lowercase or one uppercase character and a number.").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/, "i");
    if (!isFromLogin){
        req.checkBody('passwordMatch', 'Passwords do not match, please try again.').equals(req.body.password);
    }


    const err = req.validationErrors();
    var errors = {};
    if (err){
        errors = {
            emails: [],
            passwords: [],
            passwordMatches: []
        };
        for (var i=0 ; i<err.length ; i++){
            if (err[i].param === 'email'){
                errors.emails.push({ description: err[i].msg });
            }
            if (err[i].param === 'password') {
                errors.passwords.push({ description: err[i].msg });
            }
            if (err[i].param === 'passwordMatch') {
                errors.passwordMatches.push({ description: err[i].msg });
            }
        }
    } else {
        errors = false; //no errors, all inputs are valid
    }
    return errors;
}







module.exports = router;