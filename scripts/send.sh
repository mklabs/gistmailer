#!/bin/bash

MAILS="$JOB_MAILS"

echo "Sending emails to $MAILS"

gistmailer=$PWD/bin/gistmailer

for mail in $MAILS; do
  echo "Sending email to $mail"

  MAIL_TO=$mail npm run assert
done
