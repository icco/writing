#! /bin/bash
#
# Inspired by https://prettier.io/docs/en/precommit.html

jsfiles=$(git ls-tree --name-only -r HEAD | grep js)
[ -z "$jsfiles" ] && exit 0

echo "$jsfiles" | xargs $(yarn bin)/prettier --write
