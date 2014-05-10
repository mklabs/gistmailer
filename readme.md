# gist mailer

job mailer / jenkins mailer / ...

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

```json
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

Values are typically numbers:

```json
{
  "asserts": {
    "rules": {
      "onDOMReadyTime": 2000,
      "redirectsTime": 400,
      "windowOnLoadTime": 3000
    },
    "failedCount": 3,
    "failedAsserts: [
      "redirectsTime",
      "onDOMReadyTime",
      "windowOnLoadTime"
    ]
  }
}
```
