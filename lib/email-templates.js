
var email = require('./raw-templates');

try {
  email = require('email-templates');
} catch(e) {
  debug('Error loading email templates, fallback to hbs template.');
}


module.exports = email;
