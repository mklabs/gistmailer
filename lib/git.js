
var fs     = require('fs');
var path   = require('path');
var util   = require('util');
var spawn  = require('child_process').spawn;
var events = require('events');
var debug  = require('debug')('gistmailer');

// Git wrapper
module.exports = Git;


function Git(options) {
  this.options = options || {};
  this.stdout = this.options.stdout || process.stdout;
  this.stderr = this.options.stderr || process.stderr;
  this.basedir = this.options.basedir || './tmp/templates';

  this.name = this.options.name || '';
}

util.inherits(Git, events.EventEmitter)

Git.prototype.clone = function clone(url, done) {
  done = done || function() {};

  var dir = this.directory(url);
  var me = this;
  fs.stat(dir, function(err) {
    if (err) me.run('clone', url, dir, done);
    else me.run('pull', dir);
  });
};

Git.prototype.run = function run() {
  var args = [].slice.call(arguments);
  debug('Git: git %s', args.join(' '));

  var last = args[args.length - 1];
  var done = typeof last === 'function' ? args.pop() : function() {};

  this.process = spawn('git', args);

  this.process.stdout.pipe(this.stdout);
  this.process.stderr.pipe(this.stderr);

  this.process.on('error', this.emit.bind(this, 'error'));
  this.process.on('close', this.emit.bind(this, 'close'));
  this.process.on('exit', this.emit.bind(this, 'exit'));

  var me = this;
  this.process.on('exit', function(code) {
    var err = code ? new Error('Git exited with code ' + code) : null;

    if (err) me.emit('error', err);
    me.emit('end');

    done(err);
  });

  return this;
};

var gitReg = /([^\/:]+)\.git$/;
Git.prototype.directory = function directory(str) {
  str = str || 'default';
  if (gitReg.test(str)) {
    str = str.match(gitReg)[1];
  }

  return path.join(this.basedir, str);
};
