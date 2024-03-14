#! /bin/zsh

for i in $(ls ./posts/ | sort -n); do
  [ $(yq --front-matter="extract" -P .draft ./posts/$i) = false ] && echo "\"$(yq --front-matter="extract" -P .title ./posts/$i)\" -- ./posts/$i";
done
