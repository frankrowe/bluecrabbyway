$(document).ready(function() {
  window.bywayMap = new BywayMap()
})

function BywayMap () {
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

BywayMap.prototype.addCategory = function(el, id) {
  var self = this
  $('.delimiter_filter').removeClass('active')
  $(el).addClass('active')
  $.getJSON('sites?category=' + id, function(json) {
    self.sites.clearLayers()
    self.addSites(json)
  })
}

BywayMap.prototype.addTown = function(el, id) {
  var self = this
  $('.delimiter_filter').removeClass('active')
  $(el).addClass('active')
  $.getJSON('sites?town=' + id, function(json) {
    self.sites.clearLayers()
    self.addSites(json)
  })
}

BywayMap.prototype.addSites = function(json) {
  var self = this
  json.forEach(function(site) {
    if (site.location) {
      var latlng = site.location.split(',').map(Number)
      var popup = '<p>' + site.Name + '</p>'
       + '<p><a href="site/' + site.Name + '" target="_blank">More Information</a></p>'
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
