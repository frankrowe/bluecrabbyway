var _ = require('lodash')
var Tabletop = require('tabletop')
var fs = require('fs')
var path = require('path')

var root = path.resolve(__dirname, '..')

function Sheet() {
  this.key = '1AS60Zm5ytMoOI3AhvR0dcOF-G_3j2lpZR7VRBAzfBgE'
  this.routes = ['Ocean City to Princess Anne',
  'Pocomoke City to Ocean City',
  'Princess Anne to Pocomoke City',
  'Snow Hill to Stockton',
  'Berlin to Assateague Island',
  'Princess Anne to Deal Island']
}

Sheet.prototype.parseData = function(data) {
  data.forEach(function(row, idx) {
    row.id = idx
    row.uri = encodeURIComponent(row.Name)
    row.photos = _.compact(row.Photo.split('\n'))
    row.websites = _.compact(row.Website.split('\n'))
    row.DescriptionLong = row.DescriptionLong.split('\n').join('</p><p>')
  })
  return data
}

Sheet.prototype.getCategories = function() {
  var cats = []
  this.data.forEach(function(site) {
    cats = cats.concat(site.Category.split('/'))
  })
  cats = cats.map(Function.prototype.call, String.prototype.trim)
  return _.uniq(cats)
}

Sheet.prototype.getTowns = function() {
  var cats = []
  this.data.forEach(function(site) {
    cats.push(site.City)
  })
  cats = cats.map(Function.prototype.call, String.prototype.trim)
  return _.compact(_.uniq(cats))
}

Sheet.prototype.getByCategory = function(category) {
  var sites = []
  if (category === 'all') {
    return this.data
  }
  this.data.forEach(function(site) {
    if (site.Category.split('/').indexOf(category.trim()) >= 0) {
      sites.push(site)
    }
  })
  return sites
}

Sheet.prototype.getByTown = function(town) {
  var sites = []
  if (town === 'all') {
    return this.data
  }
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
        fs.readFile(path.join(root, 'data.json'), 'utf8', function(err, data) {
          if (data) {
            self.data = self.parseData(JSON.parse(data))
            self.categories = self.getCategories()
            self.towns = self.getTowns()
          }
          next()
        })
      } else {
        fs.writeFileSync(path.join(root, 'data.json'), JSON.stringify(data))
        self.data = self.parseData(data)
        self.categories = self.getCategories()
        self.towns = self.getTowns()
        fs.writeFileSync(path.join(root, 'js/sheet.json'), JSON.stringify(self.data))
        next()
      }
    },
    simpleSheet: true
  })
}

module.exports = Sheet
