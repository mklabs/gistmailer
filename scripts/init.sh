#!/bin/bash

CLONE_URL=$1
CLONE_DIR=$2

[ $CLONE_DIR == "" ] && CLONE_DIR="default"

echo "Initing $CLONE_URL in templates/$CLONE_DIR"

[ -e templates ] || mkdir -p templates
[ -e templates/$CLONE_DIR ] && cd templates/$CLONE_DIR && git pull && cd ../..
[ -e templates/$CLONE_DIR ] || git clone $CLONE_URL templates/$CLONE_DIR

echo "Template $CLONE_DIR:"

ls -la template/$CLONE_DIR
