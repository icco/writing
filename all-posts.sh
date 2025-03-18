#! /bin/zsh

posts=$(ls ./posts | sort -n | sed 's/.md$//g' | sed 's/^/writing.natwelch.com\/post\//')

for i in $posts; do
  echo $i
done
