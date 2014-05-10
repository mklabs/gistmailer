var debug = require('debug')('gistmailer');

var fs         = require('fs');
var path       = require('path');
var exists     = fs.existsSync;
var util       = require('util');
var events     = require('events');
var nodemailer = require('nodemailer');
var prop = require('./lib/prop');

module.exports = Mailer;
Mailer.Git = require('./lib/git');

// List of attribute accessors
var props = ['service', 'url', 'file', 'to', 'host', 'port']

function Mailer(options) {
  options = options || {};

  this.git = new Mailer.Git({ name: this.name });
  this.transport = nodemailer.createTransport('SMTP', this.config());
}

util.inherits(Mailer, events.EventEmitter);

Mailer.prototype.config = function config() {
  var conf = {};

  if (this.service()) conf.service = this.service();
  if (this.auth()) conf.auth = this.auth();
  if (this.host()) conf.host = this.host();
  if (this.port()) conf.host = this.port();

  debug('SMTP config', conf);
  return conf;
};

// Register accessors
props.forEach(prop(Mailer.prototype));

// Auth requires validation
var auth = prop(Mailer.prototype, function(auth) {
  if (!auth) return false;
  if (!auth.name) return false;
  if (!auth.pass) return false;
  return true;
});

// Make prop
auth('auth');

Mailer.prototype.templates = function templates(dir, done) {
  this._templates = this._templates || require('email-templates');
  this._templates(dir, done);
};

Mailer.prototype.run = function run(done) {
  var git = this.git;

  this.validate();

  git.clone(this.url(), function(err) {
    if (err) return done(err);
  });
};

Mailer.prototype.email = function email(done) {
  this.templates(this.git.basedir, function(err, template) {
    if (err) return done(err);

  });
};

Mailer.prototype.validate = function validate() {
  if (!this.file()) throw new Error('Missing file param');
  if (!exists(this.file())) throw new Error('Cannot load file param: ' + this.file());

  if (!this.url()) throw new Error('Missing clone URL param');
  if (!this.to()) throw new Error('Missing email destination param');
};
