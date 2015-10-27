var _ = require('lodash')
var Tabletop = require('tabletop')
var fs = require('fs')

function Sheet(app) {
  this.app = app
  this.key = '1AS60Zm5ytMoOI3AhvR0dcOF-G_3j2lpZR7VRBAzfBgE'
  this.routes = ['Ocean City to Princess Anne',
  'Pocomoke City to Ocean City',
  'Princess Anne to Pocomoke City',
  'Snow Hill to Stockton',
  'Berlin to Assateague Island',
  'Princess Anne to Deal Island']

  var self = this
  var minutes = 30, the_interval = minutes * 60 * 1000
  setInterval(function() {
    self.refresh(function() {})
    self.app.locals.sites = self
  }, the_interval)
}

Sheet.prototype.parseData = function(data) {
  data.forEach(function(row) {
    row.photos = row.Photo.split(',')
    row.websites = row.Website.split('\n')
  })
  return data
}

Sheet.prototype.getCategories = function() {
  var cats = []
  this.data.forEach(function(site) {
    cats = cats.concat(site.Category.split('/'))
  })
  return _.uniq(cats)
}

Sheet.prototype.getTowns = function() {
  var cats = []
  this.data.forEach(function(site) {
    cats.push(site.City)
  })
  return _.compact(_.uniq(cats))
}

Sheet.prototype.getByCategory = function(category) {
  var sites = []
  this.data.forEach(function(site) {
    if (site.Category.split('/').indexOf(category.trim()) >= 0) {
      sites.push(site)
    }
  })
  return sites
}

Sheet.prototype.getByTown = function(town) {
  var sites = []
  this.data.forEach(function(site) {
    if (site.City.trim() === town.trim()) {
      sites.push(site)
    }
  })
  return sites
}

Sheet.prototype.getByRoute = function(route) {
  var sites = []
  this.data.forEach(function(site) {
    if (site.Route.trim() === route.trim()) {
      sites.push(site)
    }
  })
  return sites
}

Sheet.prototype.getByName = function(name) {
  var site = {}
  this.data.forEach(function(_site) {
    console.log(_site.Name, name,_site.Name === name );
    if (_site.Name.trim() === name.trim()) {
      site = _site
    }
  })
  return site
}

Sheet.prototype.refresh = function(next) {
  console.log('refreshing');
  var self = this
  var sheet = Tabletop.init({
    key: this.key,
    callback: function(data, tabletop, err) {
      if (err) {
        fs.readFile('./config/sheet.json', 'utf8', function(err, data) {
          if (data) {
            self.data = self.parseData(JSON.parse(data))
            self.categories = self.getCategories()
            self.towns = self.getTowns()
          }
          next()
        })
      } else {
        fs.writeFileSync('./config/sheet.json', JSON.stringify(data))
        self.data = self.parseData(data)
        self.categories = self.getCategories()
        self.towns = self.getTowns()
        next()
      }
    },
    simpleSheet: true
  })
}

module.exports = Sheet
