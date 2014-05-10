# gist mailer

This set of scripts was developped to provide an easy way to post
process build results for Jenkins or other continuous integration
system.

It relies on the excellent
[node-email-templates](https://github.com/niftylettuce/node-email-templates) to render HTML
formatted emails, and [nodemailer](https://github.com/andris9/Nodemailer) for sending.

Templates are fetched from git/gist repository, and are executed in the
context of the build data passed to downstream Job.

**Note** email-templates is `require`d but not installed by this package.
If you wish to get full featureset from email-templates, you need the
package locally by running `npm install email-templates`. The system
will fallback to [this implementation](./lib/raw-templates). May help on
systems where installing [juice](https://github.com/LearnBoost/juice) is
a problem.

## Usage

Module:

```js
var Mailer = require('gistmailer');
var mailer = new Mailer();

mailer
  .service('Gmail')
  .auth({ name: 'username@gmail.com', pass: 'password' })
  .url('https://gist.github.com/mklabs/eb28e58ac28a8d3ab845')
  .to('example@example.com')
  .file('./build.json')
  .run(function(err) {
    if (!err) return;

    console.error('Error running mailer', err);
    process.exit(1);
  });
```

Command:

```

 Usage: gistmailer [options] <file>

 Options:

   -h, --help            output usage information
   -V, --version         output the version number
   -u, --user [user]     SMTP auth user configuration
   -p, --pass [pass]     SMTP auth password configuration
   -s, --service [type]  One of the nodemailer service
   -H, --host [host]     SMTP hostname (not needed with service)
   -P, --port [port]     SMTP port (not needed with service)
   -u, --url [url]       Full GIT clone url, or a gist ID
   -t, --to [to]         Destination email

```

### Env vars

Use env vars, useful for CI based run. They'll overwrite any CLI
arguments / flags.

- `UPSTREAM_DATA` - Absolute path to build data
- `MAIL_USER` - The email auth credential for username
- `MAIL_PASSWORD` - The email auth credential for password
- `MAIL_SERVICE` - One of the [well known smtp services for nodemailer](https://github.com/andris9/Nodemailer#well-known-services-for-smtp)
- `MAIL_HOST` - SMTP hostname server (not needed with `service`)
- `MAIL_PORT` - SMTP port (defaults to 25, not needed with `service`)

See https://github.com/andris9/Nodemailer#setting-up-smtp

## Job scripts

### Jenkins template

`job/jenkins.xml` file is a Jenkins Job template that can be used to quickly
setup a Job to automatically send mail based on upstream data.

    # Install plugins
    $ curl -X POST -H 'Content-Type: application/xml' $JEKINS_URL/pluginManager/installNecessaryPlugins --data-binary @config.xml

It has the following job parameters (then available as environment variable to shell
scripts):


### Build data

The `build.json` file used is following the above structure. The
relevant build properties used here is `asserts`.

```js
[{
  url: "Relevant URL (can be the Job URL)"
  asserts: {
    rules: {
      assertKey: value
    },

    failedCount: 0,
    failedAsserts: []
  }
}, {
  url: "Relevant URL (can be the Job URL)"
  asserts: {
    rules: {
      assertKey: value,
      anotherOne: value
    },

    failedCount: 0,
    failedAsserts: []
  }
}]
```


## API
   - [Git](#git)
     - [Git#clone](#git-gitclone)
   - [Mailer](#mailer)
   - [Prop](#prop)
     - [Basic check](#prop-basic-check)
     - [Test chain api](#prop-test-chain-api)
     - [Strategies](#prop-strategies)
     - [validate](#prop-validate)
<a name=""></a>

<a name="git"></a>
# Git
Git#init.

```js
this.git = new Git();
```

Git#directory.

```js
this.git = new Git();
assert.equal(this.git.directory(), path.join('./tmp/templates/default'));
assert.equal(this.git.directory('foo'), path.join('./tmp/templates/foo'));
assert.equal(this.git.directory(url), path.join('./tmp/templates/eb28e58ac28a8d3ab845'));
```

<a name="git-gitclone"></a>
## Git#clone
Clones url.

```js
this.git = this.git || new Git();
this.git.clone(url, done);
```

and init template.

```js
fs.stat(this.git.directory(url), done);
```

<a name="mailer"></a>
# Mailer
Mailer#init.

```js
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
```

<a name="prop"></a>
# Prop
<a name="prop-basic-check"></a>
## Basic check
props well.

```js
var obj = Object.create({});
props.forEach(prop(obj));
props.forEach(assertProp(obj));
```

<a name="prop-test-chain-api"></a>
## Test chain api
Object.create.

```js
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
```

new Stuff().

```js
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
```

Hash.

```js
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
```

<a name="prop-strategies"></a>
## Strategies
_prop - default.

```js
var obj = {};
prop(obj)('file');
obj.file('file.json');
assert.equal(obj.file(), 'file.json');
assert.equal(obj._file, 'file.json');
```

attr - use this.attributes hash.

```js
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
```

custom.

```js
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
```

<a name="prop-validate"></a>
## validate
Validate inputs.

```js
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
```

