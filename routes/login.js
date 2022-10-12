var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
    res.render('login', { title: "Login" });
});

router.get('/signup', (req, res) => {
    res.render('signup', { title: "Signup" });
});

module.exports = router;