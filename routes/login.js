var express = require('express');
var router = express.Router();

router.get('/', (req, res) => { // Get /login; this is the login page
    res.render('login', { title: "Login" }); // render login.hbs
});

router.get('/signup', (req, res) => { // Get /login/signup; this is the signup page
    console.log(req.ip); // log user ip
    res.render('signup', { title: "Signup" }); // render signup.hbs
});

module.exports = router;