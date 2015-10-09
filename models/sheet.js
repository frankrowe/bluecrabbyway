var _ = require('lodash')

function Sheet(data) {
  this.data = this.parseData(data)
  this.categories = this.getCategories()
  this.towns = this.getTowns()
  this.routes = ['Ocean City to Princess Anne',
  'Pocomoke City to Ocean City',
  'Princess Anne to Pocomoke City',
  'Snow Hill to Stockton',
  'Berlin to Assateague Island',
  'Princess Anne to Deal Island']
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

module.exports = Sheet
