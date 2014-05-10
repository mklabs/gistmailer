
var fs = require('fs');
var path = require('path');
var debug = require('debug')('gistmailer:templates');

var hbs = require('hbs');

module.exports = templates;

function templates(dir, done) {
  done(null, render(dir));
}

function render(dir) { return function(name, data, done) {
  var dirname = path.join(dir, name);

  fs.readdir(dirname, function(err, files) {
    if (err) return done(err);

    debug('Render %s in %s with', name, dir, data);
    debug('files', files);

    var map = files.reduce(function(res, file) {
      if (/^\./.test(file)) return res;
      var ext = path.extname(file);
      res[file.replace(ext, '')] = fs.readFileSync(path.join(dirname, file), 'utf8');
      return res;
    }, {});

    var html = map.html;
    var styl = map.style;
    var text = map.text;

    if (!html) return done(new Error('Missing HTML'));
    if (!styl) return done(new Error('Missing CSS'));
    if (!text) return done(new Error('Missing Text'));

    html = hbs.compile(html)(data);

    // rough CSS inline .. wont work, but its a fallback
    html = ('<style>' + map.style.split(/\r?\n/).join('') + '</style>') + html;
    done(null, html, text);
  });
}}
