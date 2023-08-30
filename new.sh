#! /bin/zsh

id=$(ls ./posts | sort -n | sed 's/.mdx$//g' | tail -n 1 | awk '{print $1+1}')

cat <<EOS > ./posts/$id.mdx 
---

id: $id
datetime: "$(date +"%Y-%m-%dT%H:%M:%S%z")"
title: "TBD"
draft: true
permalink: "/post/$id"

---

TBD.
EOS

git add ./posts/$id.mdx
git ci -m "chore: init post $id"
open -a "IA Writer" ./posts/$id.mdx
