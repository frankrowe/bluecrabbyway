var path = require('path')
var fs = require('fs')
var handlebars = require('handlebars')
var Sheet = require('./sheet')

var domain = 'http://localhost:8080/bluecrabbyway'
//var domain = 'http://apps.esrgc.org/bluecrabbyway'

var root = path.resolve(__dirname, '..')

handlebars.registerPartial({
  'sidebar': fs.readFileSync(path.join(root, 'templates/partials/sidebar.hbs'), 'utf8'),
  'header': fs.readFileSync(path.join(root, 'templates/partials/header.hbs'), 'utf8'),
  'footer': fs.readFileSync(path.join(root, 'templates/partials/footer.hbs'), 'utf8')
})
var blocks = {};
handlebars.registerHelper('extend', function(name, context) {
  var block = blocks[name];
  if (!block) {
    block = blocks[name] = [];
  }
  block.push(context.fn(this));
});

handlebars.registerHelper('block', function(name) {
  var val = (blocks[name] || []).join('\n');
  blocks[name] = [];
  return val;
});

handlebars.registerHelper('domain', function(block) {
  return domain
})

var page_dir = path.join(root, 'templates/pages/')

var sheet = new Sheet()
sheet.refresh(build)

function build() {
  console.log('building');
  renderPages()
  renderCategories()
  renderTowns()
  renderSites()
  console.log('done');
}


function renderPage(page_path, data) {
  var template =  handlebars.compile(fs.readFileSync(page_path, 'utf8'))
  var html = template(data)
  return html
}


function renderPages() {
  fs.readdir(page_dir, function(err, files) {
    files.forEach(function(page) {
      var html = renderPage(path.join(page_dir, page), {
        sheet: sheet
      })
      var html_path = path.join(root, (path.basename(page, '.hbs') + '.html'))
      fs.writeFile(html_path, html)
    })
  })
}

function renderCategories() {
  sheet.categories.forEach(function(category) {
    var html = renderPage(path.join(root, 'templates/sitelist.hbs'), {
      sheet: sheet,
      category: category,
      sites: sheet.getByCategory(category)
    })
    fs.writeFile(path.join(root, 'category/' + category + '.html'), html)
  })
}

function renderTowns() {
  sheet.towns.forEach(function(town) {
    var html = renderPage(path.join(root, 'templates/sitelist.hbs'), {
      sheet: sheet,
      category: town,
      sites: sheet.getByTown(town)
    })
    fs.writeFile(path.join(root, 'town/' + town + '.html'), html)
  })
}

function renderSites() {
  sheet.data.forEach(function(site) {
    var html = renderPage(path.join(root, 'templates/site.hbs'), {
      sheet: sheet,
      site: site
    })
    fs.writeFile(path.join(root, 'site/' + site.id + '.html'), html)
  })
}
