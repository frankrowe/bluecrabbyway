var _ = require('lodash')

function Sheet(data) {
  this.data = data
  this.categories = this.getCategories()
  this.towns = this.getTowns()
  this.routes = ['Ocean City to Princess Anne',
  'Pocomoke City to Ocean City',
  'Princess Anne to Pocomoke City',
  'Snow Hill to Stockton',
  'Berlin to Assateague Island',
  'Princess Anne to Deal Island']
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
    if (site.Category.split('/').indexOf(category) >= 0) {
      sites.push(site)
    }
  })
  return sites
}

Sheet.prototype.getByTown = function(town) {
  var sites = []
  this.data.forEach(function(site) {
    if (site.City === town) {
      sites.push(site)
    }
  })
  return sites
}

Sheet.prototype.getByRoute = function(route) {
  var sites = []
  this.data.forEach(function(site) {
    if (site.Route === route) {
      sites.push(site)
    }
  })
  return sites
}

module.exports = Sheet
