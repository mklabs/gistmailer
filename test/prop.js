var assert = require('assert');

describe('Prop', function() {

  var prop = require('../lib/prop');
  var props = ['url', 'auth', 'file', 'action'];

  function assertProp(obj) { return function(name) {
    assert.ok(typeof obj[name] === 'function');
  }}

  describe('Basic check', function() {
    it('props well', function() {
      var obj = Object.create({});
      props.forEach(prop(obj));
      props.forEach(assertProp(obj));
    });
  });

  describe('Test chain api', function() {

    it('Object.create', function() {
      var obj = Object.create({});

      prop(obj)('src');
      prop(obj)('dest');
      prop(obj)('output');

      obj
        .src('file.json')
        .dest('tmp/output.json')
        .output('log/stdout.log')

      assert.equal(obj.src(), 'file.json');
      assert.equal(obj.dest(), 'tmp/output.json');
      assert.equal(obj.output(), 'log/stdout.log');
    });

    it('new Stuff()', function() {
      function Stuff() {}
      prop(Stuff.prototype)('src');
      prop(Stuff.prototype)('dest');
      prop(Stuff.prototype)('output');

      var stuff = new Stuff();

      stuff
        .src('file.json')
        .dest('tmp/output.json')
        .output('log/stdout.log')

      assert.equal(stuff.src(), 'file.json');
      assert.equal(stuff.dest(), 'tmp/output.json');
      assert.equal(stuff.output(), 'log/stdout.log');
    });

    it('hash', function() {
      var obj = {};
      prop(obj)('src');
      prop(obj)('dest');
      prop(obj)('output');

      obj
        .src('file.json')
        .dest('tmp/output.json')
        .output('log/stdout.log')

      assert.equal(obj.src(), 'file.json');
      assert.equal(obj.dest(), 'tmp/output.json');
      assert.equal(obj.output(), 'log/stdout.log');
    });
  });

  describe('Strategies', function() {

    it('_prop - default', function() {
      var obj = {};
      prop(obj)('file');
      obj.file('file.json');
      assert.equal(obj.file(), 'file.json');
      assert.equal(obj._file, 'file.json');
    });

    it('attr - use this.attributes hash', function() {
      var obj = {};
      prop(obj, { strategy: 'attr' })('file');

      obj.file('file.json');
      assert.equal(obj.file(), 'file.json');
      assert.equal(obj.attributes.file, 'file.json');

      obj = {};
      prop(obj, { strategy: prop.attr })('file');

      obj.file('file.json');
      assert.equal(obj.file(), 'file.json');
      assert.equal(obj.attributes.file, 'file.json');
    });

    it('custom', function() {
      // Using this.options object
      function opts(name, value) {
        this.options = this.options || {};

        if (!value) return this.options[name];
        this.options[name] = value;
        return this;
      }

      var obj = {};
      prop(obj, { strategy: opts })('file');

      obj.file('file.json');
      assert.equal(obj.file(), 'file.json');
      assert.equal(obj.options.file, 'file.json');
    });
  });

  describe('validate', function() {

    it('Validate inputs', function() {
      var obj = {};
      prop(obj, {
        validate: function (name, value) {
          if (!value) return;
          if (!value.name) return;
          if (!value.pass) return;
          return true;
        }
      })('auth');

      obj.auth({ foo: 'bar' });

      assert.ok(typeof obj.auth() === 'undefined');

      obj.auth({
        name: 'foo',
        pass: 'bar'
      });

      assert.deepEqual(obj.auth(), { name: 'foo', pass: 'bar' });
    });
  });


});
