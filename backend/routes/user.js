const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');

/*Déclaration des routes pour la gestion des users*/
router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;