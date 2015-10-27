var express = require('express')
var fs = require('fs')
var Tabletop = require('tabletop');
var Sheet = require('../models/sheet')

var key = '1AS60Zm5ytMoOI3AhvR0dcOF-G_3j2lpZR7VRBAzfBgE'

var router = express.Router()


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index')
})

router.get('/about', function(req, res, next) {
  res.render('about')
})

router.get('/contact', function(req, res, next) {
  res.render('contact')
})

router.get('/categories', function(req, res, next) {
  res.render('categories')
})

router.get('/towns', function(req, res, next) {
  res.render('towns')
})

router.get('/routes', function(req, res, next) {
  res.render('routes')
})

router.get('/category/:category', function(req, res, next) {
  var sites = req.app.locals.sites.getByCategory(req.params.category)
  res.render('sitelist', {
    category: req.params.category,
    sites: sites
  })
})

router.get('/town/:town', function(req, res, next) {
  var sites = req.app.locals.sites.getByTown(req.params.town)
  res.render('sitelist', {
    category: req.params.town,
    sites: sites
  })
})

router.get('/route/:route', function(req, res, next) {
  var sites = req.app.locals.sites.getByRoute(req.params.route)
  res.render('sitelist', {
    category: req.params.route,
    sites: sites
  })
})

router.get('/site/:name', function(req, res, next) {
  var site = req.app.locals.sites.getByName(req.params.name)
  console.log(site);
  res.render('site', {
    site: site
  })
})

router.get('/sites', function(req, res, next) {
  var sites = []
  if (req.query.category) {
    sites = req.app.locals.sites.getByCategory(req.query.category)
  } else if (req.query.town) {
    sites = req.app.locals.sites.getByTown(req.query.town)
  } else if (req.query.route) {
    sites = req.app.locals.sites.getByRoute(req.query.route)
  } else {
    sites = req.app.locals.sites.data
  }
  res.json(sites)
})

module.exports = router
