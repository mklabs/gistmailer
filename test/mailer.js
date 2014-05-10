
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var env = process.env;
var debug = require('debug')('gistmailer:test');

describe('Mailer', function() {
  var Mailer = require('..');
  var url = 'https://gist.github.com/eb28e58ac28a8d3ab845.git';

  function mockTemplate(dir, done) {
    function template (name, data, next) {
      debug('Mock %s name', name);
      debug('Mock data', data);
      next(null, '<h1>Test</h1>', '# Test\n');
    }

    return done(null, template);
  }

  it('Mailer#init', function() {
    var mailer = new Mailer();

    // Config
    mailer
      .file(path.join(__dirname, 'fixtures/build.json'))
      .url(url)
      .to('foo@bar.com')
      .service('Gmail')
      .auth({ user: 'foo', pass: 'bar' });

    assert.deepEqual(mailer.config(), {
      service: 'Gmail',
      auth: {
        user: 'foo',
        pass: 'bar'
      }
    });
  });

  it('Mailer#run', function(done) {
    var mailer = new Mailer();

    mailer._templates = mockTemplate

    mailer
      .file(path.join(__dirname, 'fixtures/build.json'))
      .url(url)
      .to(env.MAIL_TO || '')
      .from(env.MAIL_USER)
      .subject('test Mailer#run')
      .service('Gmail')
      .auth({ user: env.MAIL_USER, pass: env.MAIL_PASSWORD })
      .run(done);
  });
});
