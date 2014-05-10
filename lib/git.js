
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
  this.cwd = this.options.cwd || process.cwd();

  this.name = this.options.name || '';
}

util.inherits(Git, events.EventEmitter)

Git.prototype.clone = function clone(url, done) {
  done = done || function() {};

  var dir = this.name || this.directory(url);
  var me = this;
  fs.stat(dir, function(err) {
    if (err) me.run('clone', url, dir, done);
    else me.pull(dir, done);
  });
};

Git.prototype.pull = function pull(dir, done) {
  done = done || function() {};
  var me = this;
  var cwd = this.cwd;

  this.cwd = dir;
  this.run('pull', function(err) {
    me.cwd = cwd;
    done(err);
  });
};

Git.prototype.run = function run() {
  var args = [].slice.call(arguments);

  var last = args[args.length - 1];
  var done = typeof last === 'function' ? args.pop() : function() {};

  debug('Git: git %s', args.join(' '));
  this.process = spawn('git', args, {
    cwd: this.cwd
  });

  // this.process.stdout.pipe(this.stdout);
  // this.process.stderr.pipe(this.stderr);

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
