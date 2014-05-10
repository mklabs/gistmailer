#!/bin/env node

var env = process.env;

var fs = require('fs');
var path = require('path');
var exists = fs.existsSync;

if (!env.UPSTREAM_DATA) throw new Error('Cant find upstream job data env variable');
if (!exists(env.UPSTREAM_DATA)) throw new Error('Cant load upstream job data');

var data = require(env.UPSTREAM_DATA);
var user = process.env.MAIL_USER || '';
var password = process.env.MAIL_PASSWORD || '';
var from = process.env.MAIL_FROM || '';
var upstream = process.env.UPSTREAM_JOB_NAME || '';

if (!user) new Error('Cant send email without MAIL_USER');
if (!password) new Error('Cant send email without MAIL_PASSWORD');


function requireWS(file) {
  return require(env.WORKSPACE ? path.join(env.WORKSPACE, 'node_modules', file) : file);
}

data = data.filter(function(r) { return r; });

data = data.filter(function(result) {
  return result._asserts && result._asserts.failedCount;
});

if (!data.length) return;

console.log('%s URLs in failures', data.length);

// # node-email-templates

// ## Example with [Nodemailer](https://github.com/andris9/Nodemailer)

var templatesDir   = path.resolve(env.WORKSPACE, 'templates');
var emailTemplates = requireWS('email-templates');
var nodemailer     = requireWS('nodemailer');

emailTemplates(templatesDir, function(err, template) {
  if (err) throw err;

  // ## Send a single email

  // Prepare nodemailer transport object
  var transport = nodemailer.createTransport("SMTP", {
    service: "Gmail",
    auth: {
      user: user,
      pass: password
    }
  });

  // TODO: Iterate over MAILS

  // An example users object with formatted email function
  var locals = {
    email: 'daniel.mickael@gmail.com',
    json: JSON.stringify(data, null, 2),
    data: data,
    name: upstream || 'Mailer',
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

  // Send a single email
  template('pasta', locals, function(err, html, text) {
    if (err) throw err;

    var opts = {
      from: from,
      to: locals.email,
      subject: 'Greenskin alert - ' + locals.name,
      html: html,
      text: text
    };

    console.log('Sending email to', locals.email, opts.subject);
    transport.sendMail(opts, function(err, res) {
      if (err) throw err;
      console.log(res);
      process.exit(0);
    });
  });
});

