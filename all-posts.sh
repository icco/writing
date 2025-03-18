#! /bin/zsh

for i in $(ls ./posts | sort -n); do
  [ $(yq --front-matter="extract" -P .draft ./posts/$i) = false ] && echo \"$( echo $i | sed 's/.md$//g' | sed 's/^/writing.natwelch.com\/post\//')\"
done | jq -c --slurp .
