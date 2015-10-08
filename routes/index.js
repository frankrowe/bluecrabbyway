var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/about', function(req, res, next) {
  res.render('about');
});

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

module.exports = router;
