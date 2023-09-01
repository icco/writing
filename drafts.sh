#! /bin/zsh

for i in $(ls ./posts/ | sort -n); do
  [ $(yq --front-matter="extract" -P .draft ./posts/$i) = true ] && echo ./posts/$i;
done
