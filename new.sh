#! /bin/zsh

id=$(ls ./posts | sort -n | sed 's/.md$//g' | tail -n 1 | awk '{print $1+1}')

cat <<EOS > ./posts/$id.md 
---

id: $id
datetime: "$(date +"%Y-%m-%dT%H:%M:%S%z")"
title: "TBD"
draft: true
permalink: "/post/$id"

---

TBD.
EOS

git add ./posts/$id.md
git commit -m "chore: init post $id"
git push -u

if [[ $(uname) == "Darwin" ]]; then
  open -a "IA Writer" ./posts/$id.md
fi
