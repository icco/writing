#! /bin/bash
#
# Inspired by https://prettier.io/docs/en/precommit.html

yarn

git ls-tree --name-only -r HEAD | grep -e js -e css | tr '\n' '\0' | xargs -0 $(yarn bin)/prettier --write -v {}
