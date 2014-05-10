var debug = require('debug')('gistmailer');

var fs         = require('fs');
var path       = require('path');
var exists     = fs.existsSync;
var util       = require('util');
var events     = require('events');
var nodemailer = require('nodemailer');
var prop = require('./lib/prop');

var emailTemplates = require('./lib/email-templates');

module.exports = Mailer;
Mailer.Git = require('./lib/git');

// List of attribute accessors
var props = ['service', 'url', 'file', 'to', 'host', 'port', 'subject', 'from', 'to']

function Mailer(options) {
  options = options || {};

  this.name = options.name || 'defaults';
  this.git = new Mailer.Git({ name: this.name });
}

util.inherits(Mailer, events.EventEmitter);

// Register accessors
props.forEach(prop(Mailer.prototype));

// Auth requires validation
var auth = prop(Mailer.prototype, function(auth) {
  if (!auth) return false;
  if (!auth.user) return false;
  if (!auth.pass) return false;
  return true;
});

// Make prop
auth('auth');

// SMTP config
Mailer.prototype.config = function config() {
  var conf = {};

  if (this.service()) conf.service = this.service();
  if (this.auth()) conf.auth = this.auth();
  if (this.host()) conf.host = this.host();
  if (this.port()) conf.host = this.port();

  debug('SMTP config', conf);
  return conf;
};

// Mail config
Mailer.prototype.mailOptions = function mailOptions() {
  var conf = {};

  if (this.subject()) conf.subject = this.subject();
  if (this.from()) conf.from = this.from();
  if (this.to()) conf.to = this.to();

  debug('Mail options', conf);
  return conf;

};

Mailer.prototype.templates = function templates(dir, done) {
  this._templates = this._templates || emailTemplates;
  this._templates(dir, done);
};

Mailer.prototype.run = function run(done) {
  var git = this.git;

  this.validate();

  var me = this;
  git.clone(this.url(), function(err) {
    if (err) return done(err);
    me.email(function(err, template) {
      if (err) return done(err);
      me.render(template, function(err, html, text) {
        if (err) return done(err);
        me.send(done);
      });
    });
  });
};

Mailer.prototype.render = function render(template, done) {
  if (!template) return done(new Error('Missing template'));

  var me = this;
  template(this.name, this.data || {}, function(err, html, text) {
    if (err) return done(err);
    me.html = html;
    me.text = text;
    done(null, html, text);
  });
};

Mailer.prototype.email = function email(done) {
  this.templates(this.git.basedir, done);
};

Mailer.prototype.send = function send(done) {
  var opts = this.mailOptions();
  opts.html = this.html;
  opts.text = this.text;

  debug('Sending email to', opts.to, opts.subject);
  // console.log(opts);
  debug('HTML', opts.html);

  this.validate();

  var transport = this.transport = nodemailer.createTransport('SMTP', this.config());
  this.transport.sendMail(opts, function(err, res) {
    transport.close();
    if (err) return done(err);
    debug('Res', res);
    done();
  });
};

Mailer.prototype.validate = function validate() {
  if (!this.file()) throw new Error('Missing file param');
  if (!exists(this.file())) throw new Error('Cannot load file param: ' + this.file());

  if (!this.url()) throw new Error('Missing clone URL param');
  if (!this.to()) throw new Error('Missing email destination param');

  var auth = this.auth();
  if (auth && !auth.user) throw new Error('Missing auth username');
  if (auth && !auth.pass) throw new Error('Missing auth password');
};
