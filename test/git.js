var fs = require('fs');
var path = require('path');
var assert = require('assert');

describe('Git', function() {
  var Git = require('../lib/git');

  var url = 'https://gist.github.com/eb28e58ac28a8d3ab845.git';

  it('Git#init', function() {
    this.git = new Git();
  });

  it('Git#directory', function() {
    this.git = new Git();

    assert.equal(this.git.directory(), path.join(__dirname, '../tmp/templates/default'));
    assert.equal(this.git.directory('foo'), path.join(__dirname, '../tmp/templates/foo'));
    assert.equal(this.git.directory(url), path.join(__dirname, '../tmp/templates/eb28e58ac28a8d3ab845'));
  });

  describe('Git#clone', function() {

    it('Clones url', function(done) {
      this.git = this.git || new Git();
      this.git.clone(url, done);
    });

    it('and init template', function(done) {
      fs.stat(this.git.directory(url), done);
    });
  });


});
