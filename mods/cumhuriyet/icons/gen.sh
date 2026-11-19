#!/bin/zsh
# Generates one Damga icon with Codex image_gen.
# usage: gen.sh <name> [ref]  -> raw/<name>.png, from subjects.tsv and template.txt; raw/divan.png is the style key
# then: python3 -I post.py <name>...  -> masks/<name>.png
cd "${0:A:h}"
name=$1; ref2=$2
subj=$(awk -F"\t" -v n="$name" '$1==n{print $2}' subjects.tsv)
[[ -z $subj ]] && { echo "$name: no subject"; exit 1; }
refline=""; iarg=()
if [[ $name != divan && -f raw/divan.png ]]; then
  refline="Input images: Image 1 is a style reference from the same icon set. Match its cut style, edge quality, weight and level of detail exactly. Do not copy its subject or its shape.
"; iarg=(-i raw/divan.png)
fi
if [[ -n $ref2 ]]; then refline="${refline}Image 2 is the icon from the same set that the subject refers to; keep its shape.
"; iarg+=(-i $ref2); fi
prompt=$(python3 -I -c 'import sys;t=open(sys.argv[3]).read();print(t.replace("__REF__",sys.argv[1]).replace("__SUBJECT__",sys.argv[2]))' "$refline" "$subj" template.txt)
[[ -f raw/$name.png ]] && mv raw/$name.png raw/$name.v$(date +%s).png
codex exec --skip-git-repo-check -s read-only "$prompt" $iarg < /dev/null > raw/$name.log 2>&1
sid=$(awk '/^session id:/{print $3; exit}' raw/$name.log)
f=$(ls -t ~/.codex/generated_images/$sid/*.png 2>/dev/null | head -1)
[[ -n $f ]] && cp "$f" raw/$name.png && echo "$name ok" || echo "$name FAILED"
