#! /bin/zsh

set -ex

rm -rf package-lock.json yarn.lock dist node_modules .next .contentlayer

pnpm install
pnpm update
git add package.json pnpm-lock.yaml
git diff --quiet --staged || git commit -m 'chore(deps): pnpm update'

pnpm run chrome

pnpm run lint
git add src
git diff --quiet --staged || git commit -m 'chore: lint'

pnpm run build

git add public
git diff --quiet --staged || git commit -m 'chore: update build artifacts'

git commit --allow-empty -m 'chore: redeploy'

git push -u
