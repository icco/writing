#! /bin/sh

set -ex

rm -rf package-lock.json dist node_modules

yarn 
yarn upgrade 
git add package* yarn.lock
git ci -m 'chore(deps): yarn upgrade'

yarn run lint 
git add src

if [[ "" != "$(git status -uno --porcelain)" ]]; then
  git ci -m 'chore: lint'
fi

yarn run build

git add public
if [[ "" != "$(git status -uno --porcelain)" ]]; then
  git ci -m 'chore: update build artifacts'
fi

git push -u
