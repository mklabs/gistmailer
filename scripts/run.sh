#!/bin/bash


MAILS="$JOB_MAILS"
PATH=./node_modules/.bin:./bin:$PATH

echo "Sending emails to $MAILS"

for mail in $MAILS; do
  echo "Sending email to $mail"

  gistmailer
done
