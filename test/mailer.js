
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var env = process.env;

describe('Mailer', function() {
  var Mailer = require('..');
  var url = 'https://gist.github.com/eb28e58ac28a8d3ab845.git';

  it('#init', function() {
    var mailer = new Mailer();

    // Config
    mailer
      .file(path.join(__dirname, 'fixtures/build.json'))
      .url(url)
      .to('foo@bar.com')
      .service('Gmail')
      .auth({ name: 'foo', pass: 'bar' });

    assert.deepEqual(mailer.config(), {
      service: 'Gmail',
      auth: {
        name: 'foo',
        pass: 'bar'
      }
    });
  });

  it('#run', function(done) {
    var mailer = new Mailer();

    mailer
      .file(path.join(__dirname, 'fixtures/build.json'))
      .url(url)
      .to('foo@bar.com')
      .service('Gmail')
      .auth({ name: env.MAIL_USER, pass: env.MAIL_PASSWORD })
      .run(done);
  });
});
