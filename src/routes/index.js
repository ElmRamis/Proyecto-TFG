const express = require('express');
const router = express.Router();
const checkUser = require('../helpers/checkUser');

router.get('/', (req, res) => {
    res.render('index', { layout: false, title: 'Home Page' });
});

router.get('/elterreno', (req, res) => {
    res.render('ElTerreno', { layout: false, title: 'El Terreno' });
});

router.get('/santlluis17', (req, res) => {
    res.render('SantLluis17', { layout: false, title: 'Sant Lluis 17' });
});

router.get('/dosdemayo', (req, res) => {
    res.render('dosdemayo', {layout:false, title:'Dos Villas'});
});

router.get('/josepvillalonga', (req, res) => {
    res.render('josepvillalonga', {layout:false, title:'Josep Villalonga'});
});

router.get('/El%20Terreno', (req, res, next) => { checkUser(req, res, next, 'El Terreno'); }, (req, res) => {
    res.render('proyects/ElTerreno', { title: 'El Terreno' });
});

router.get('/Sant%20Lluis%2017', (req, res, next) => { checkUser(req, res, next, 'Sant Lluis 17'); }, (req, res) => {
    res.render('proyects/SantLluis17', { title: 'Sant Lluis 17' });
});

router.get('/dashboard', (req, res) => {
    res.render('dashboard', { title: 'Dashboard' });
});

module.exports = router;
