# gist mailer

This set of scripts was developped to provide an easy way to post
process build results for Jenkins or other continuous integration
system.

It relies on the excellent
[node-email-templates](https://github.com/niftylettuce/node-email-templates) to send HTML
formatted emails.

Templates are fetched from git/gist repository, and are executed in the
context of the build data passed to downstream Job.

## Usage

### Env vars

Use env vars, useful for CI based run.

- `UPSTREAM_DATA` - Absolute path to build data
- `MAIL_USER` - The email auth credential for username
- `MAIL_PASSWORD` - The email auth credential for password
- `MAIL_SERVICE` - One of the [well known smtp services for nodemailer](https://github.com/andris9/Nodemailer#well-known-services-for-smtp)
- `MAIL_HOST` - SMTP hostname server (not needed with `service`)
- `MAIL_PORT` - SMTP port (defaults to 25, not needed with `service`)

See https://github.com/andris9/Nodemailer#setting-up-smtp

## Example

    gistmailer build.json https://gist.github.com/eb28e58ac28a8d3ab845.git youremail@yourdomain.com
    gistmailer build.json eb28e58ac28a8d3ab845 youremail@yourdomain.com

Params:

1. build.json - path to build data file
2. clone url - full GIT clone url, or the gist ID
3. to - The destination email

## Build data

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
     - [#clone](#git-clone)
   - [Mailer](#mailer)
   - [Prop](#prop)
     - [Basic check](#prop-basic-check)
     - [Test chain api](#prop-test-chain-api)
     - [Strategies](#prop-strategies)
     - [validate](#prop-validate)

<a name=""></a>

<a name="git"></a>
# Git
#init.

```js
this.git = new Git();
```

#directory.

```js
this.git = new Git();
assert.equal(this.git.directory(), path.join('./tmp/templates/default'));
assert.equal(this.git.directory('foo'), path.join('./tmp/templates/foo'));
assert.equal(this.git.directory(url), path.join('./tmp/templates/eb28e58ac28a8d3ab845'));
```

<a name="git-clone"></a>
## #clone
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
#init.

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

hash.

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


