$(document).ready(function() {
  $.getJSON('js/sheet.json', function(data) {
    window.bywayMap = new BywayMap(data)
  })
})

function BywayMap (data) {
  this.data = data
  this.makeMap()
}

BywayMap.prototype.makeMap = function() {
  var self = this
  this.map = L.map('map_canvas').setView([38.2, -75.4], 9);
  var OpenStreetMap_Mapnik_url = 'http://{s}.tiles.mapbox.com/v3/fsrw.j1f1fdcb/{z}/{x}/{y}.png',
    OpenStreetMap_Mapnik_attribution= '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'

  var osm = L.tileLayer(OpenStreetMap_Mapnik_url, { attribution : OpenStreetMap_Mapnik_attribution})
  this.map.addLayer(osm)
  this.routes = {}
  this.sites = L.featureGroup()
  this.sites.addTo(this.map)

  $('.legend').on('click', 'input', function() {
    var r = $(this).val()
    if (!$(this).is(':checked')) {
      self.map.removeLayer(self.routes[r])
    } else {
      self.map.addLayer(self.routes[r])
    }
  })

  $.when($.getJSON('js/bluecrab.json'), $.getJSON('js/capetocape.json'), $.getJSON('js/chesapeakecountry.json'))
  .done(function(a, b, c) {
    self.routes['Blue Crab'] = L.geoJson(a[0], {
      style: {
        color: '#757c9d',
        opacity: .7
      }
    }).addTo(self.map)
    self.routes['Cape to Cape'] = L.geoJson(b[0], {
      style: {
        color: '#70b371',
        opacity: .7
      }
    }).addTo(self.map)
    self.routes['Chesapeake Country'] = L.geoJson(c[0], {
      style: {
        color: '#ff535c',
        opacity: .7
      }
    }).addTo(self.map)
    self.makeLegend()
  })
  /*
  $.getJSON('js/route1.json', function(json) {
    self.routes['Berlin to Assateague Island'] = L.geoJson(json, {
      style: {
        color: '#757c9d',
        opacity: .5
      }
    }).addTo(self.map)
  })
  $.getJSON('js/route2.json', function(json) {
    self.routes['Ocean City to Princess Anne'] = L.geoJson(json, {
      style: {
        color: '#22afba',
        opacity: .5
      }
    }).addTo(self.map)
  })
  $.getJSON('js/route3.json', function(json) {
    self.routes['Pocomoke City to Ocean City'] = L.geoJson(json, {
      style: {
        color: '#70b371',
        opacity: .5
      }
    }).addTo(self.map)
  })
  $.getJSON('js/route4.json', function(json) {
     self.routes['Princess Anne to Deal Island'] = L.geoJson(json, {
      style: {
        color: '#ff535c',
        opacity: .5
      }
    }).addTo(self.map)
  })
  $.getJSON('js/route5.json', function(json) {
    self.routes['Princess Anne to Pocomoke City'] = L.geoJson(json, {
      style: {
        color: '#fbc605',
        opacity: .5
      }
    }).addTo(self.map)
  })
  $.getJSON('js/route6.json', function(json) {
    self.routes['Snow Hill to Stockton'] = L.geoJson(json, {
      style: {
        color: '#ff9a35',
        opacity: .5
      }
    }).addTo(self.map)
  })
  */
}

BywayMap.prototype.makeLegend = function(id, toggle) {
  var html = ''
  for (var key in this.routes) {
    console.log(this.routes[key]);
    var color = this.routes[key].options.style.color
    html += '<p style="color:' + color + '">' + key
    html += ' <input type="checkbox" checked value="' + key + '"></input></p>'
  }
  $('.legend').html(html)
}

BywayMap.prototype.highlightRoute = function(id, toggle) {
  if (toggle) {
    this.routes[id].setStyle({opacity: 1})
  } else {
    this.routes[id].setStyle({opacity: .5})
  }
}

BywayMap.prototype.addRoute = function(el, id) {
  var self = this
  $('.delimiter_filter').removeClass('active')
  $(el).addClass('active')
  $.getJSON('sites?route=' + id, function(json) {
    self.sites.clearLayers()
    self.addSites(json)
  })
}

BywayMap.prototype.getByCategory = function(category) {
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

BywayMap.prototype.getByTown = function(town) {
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

BywayMap.prototype.addCategory = function(el, id) {
  var self = this
  $('.delimiter_filter').removeClass('active')
  $(el).addClass('active')
  this.sites.clearLayers()
  this.addSites(this.getByCategory(id))
}

BywayMap.prototype.addTown = function(el, id) {
  var self = this
  $('.delimiter_filter').removeClass('active')
  $(el).addClass('active')
  this.sites.clearLayers()
  this.addSites(this.getByTown(id))
}

BywayMap.prototype.addSites = function(json) {
  var self = this
  json.forEach(function(site) {
    if (site.location) {
      var latlng = site.location.split(',').map(Number)
      var popup = '<p>' + site.Name + '</p>'
       + '<p><a href="site/' + site.id + '.html" target="_blank">More Information</a></p>'
      L.marker(latlng).bindPopup(popup).addTo(self.sites)
    }
  })
}

BywayMap.prototype.resetMap = function() {
  $('.delimiter_filter').removeClass('active')
  this.sites.clearLayers()
}

BywayMap.prototype.mapDelimiter = function(el, tab) {
  $('.delimiter_menu').hide()
  $('#' + tab + '_delimiter').show()
  $('.map_tab_delimiter_selected').addClass('map_tab_delimiter_link')
  $('.map_tab_delimiter_selected').removeClass('map_tab_delimiter_selected')
  $(el).parent().addClass('map_tab_delimiter_selected')
}
