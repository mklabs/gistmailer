#!/bin/env node

var fs = require('fs');
var path = require('path');
var exists = fs.existsSync;

var env = process.env;

if (!env.UPSTREAM_DATA) throw new Error('Cant find upstream job data env variable');
if (!exists(env.UPSTREAM_DATA)) throw new Error('Cant load upstream job data');

var data = require(env.UPSTREAM_DATA);

// Filter null values
data = data.filter(function(r) { return r; });

// And only failing asserts
data = data.filter(function(result) {
  return result._asserts && result._asserts.failedCount;
});

if (!data.length) return;

console.log('%s URLs in failures', data.length);


var Mailer  = require('..');

// Init

var mailer = new Mailer();

var program = {};

// Env

if (env.UPSTREAM_DATA) file = env.UPSTREAM_DATA;
if (env.TEMPLATE_URL) program.url = env.TEMPLATE_URL;

if (env.MAIL_USER) program.user = env.MAIL_USER;
if (env.MAIL_PASSWORD) program.pass = env.MAIL_PASSWORD;
if (env.MAIL_SERVICE) program.service = env.MAIL_SERVICE;
if (env.MAIL_HOST) program.host = env.MAIL_HOST;
if (env.MAIL_PORT) program.port = env.MAIL_PORT;
if (env.MAIL_TO) program.to = env.MAIL_TO;
if (env.MAIL_FROM) program.from = env.MAIL_FROM;
if (env.MAIL_SUBJECT) program.subject = env.MAIL_SUBJECT;

// Config

if (program.user && program.pass) mailer.auth({
  user: program.user,
  pass: program.pass
});

mailer.service(program.service);
mailer.host(program.host);
mailer.port(program.port);
mailer.url(program.url);
mailer.to(program.to);
mailer.url(program.url);
mailer.subject(program.subject);

// Context data for https://gist.github.com/mklabs/eb28e58ac28a8d3ab845/
var context = {
  data: data,
  json: JSON.stringify(data, null, 2),
  name: env.UPSTREAM_JOB_NAME || 'Mailer',
  metrics: data.map(function(result) {
    result._metrics = Object.keys(result.metrics).map(function(metric) {
      return {
        name: metric,
        value: result.metrics[metric]
      };
    });

    result._asserts = Object.keys(result.asserts).map(function(assert) {
      return {
        name: assert,
        assert: result.asserts[assert],
        value: result.metrics[assert],
        ok: result.metrics[assert] <= result.asserts[assert]
      };
    });

    return result;
  })
};

mailer.data(context);

// Run

mailer.run(function(err) {
  if (err) {
    console.error('Error running mailer', err);
    return process.exit(1);
  }
});
