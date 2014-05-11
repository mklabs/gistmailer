
var email = require('./raw-templates');
var debug = require('debug')('gistmailer:templates');

try {
  email = require('email-templates');
} catch(e) {
  debug('Error loading email templates, fallback to hbs template.');
}


module.exports = email;
