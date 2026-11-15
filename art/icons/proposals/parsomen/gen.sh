#!/bin/zsh
# usage: gen.sh <name> [ref.png]   -> raw/<name>.png
cd "${0:A:h}"
name=$1; ref=$2
line=$(awk -F"\t" -v n="$name" '$1==n' subjects.tsv)
subj=$(print -r -- "$line" | cut -f2); cols=$(print -r -- "$line" | cut -f3)
refline=""; iarg=()
if [[ -n $ref ]]; then refline="Input images: Image 1 is a style reference from the same icon set. Match its outline weight, flatness, colour handling and level of detail exactly. Do not copy its subject or its shape.
"; iarg=(-i $ref); fi
prompt=$(python3 -c 'import sys;t=open("template.txt").read();print(t.replace("__REF__",sys.argv[1]).replace("__SUBJECT__",sys.argv[2]).replace("__COLOURS__",sys.argv[3]))' "$refline" "$subj" "$cols")
codex exec --skip-git-repo-check -s read-only "$prompt" $iarg < /dev/null > raw/$name.log 2>&1
sid=$(awk '/^session id:/{print $3; exit}' raw/$name.log)
f=$(ls -t ~/.codex/generated_images/$sid/*.png 2>/dev/null | head -1)
[[ -n $f ]] && cp "$f" raw/$name.png && echo "$name ok" || echo "$name FAILED"
