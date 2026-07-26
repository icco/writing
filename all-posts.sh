#! /bin/zsh

LIMIT=${1:-0}

ALL=$(for i in $(ls ./posts | sort -n); do
  [ $(yq --front-matter="extract" -P .draft ./posts/$i) = false ] && echo \"$( echo $i | sed 's/.md$//g' | sed 's/^/writing.natwelch.com\/post\//')\"
done)

if [ "$LIMIT" -gt 0 ] 2>/dev/null; then
  echo "$ALL" | shuf | head -$LIMIT | jq -c --slurp .
else
  echo "$ALL" | jq -c --slurp .
fi
