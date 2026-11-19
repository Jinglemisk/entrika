#!/bin/zsh
# usage: gen.sh <name>  -> raw/<name>.png, from template.txt and the row for <name> in subjects.tsv.
# key.png (the first council chair, kept as the style key) is attached to every icon.
cd "${0:A:h}"
mkdir -p raw
name=$1
subj=$(awk -F"\t" -v n="$name" '$1==n{print $2}' subjects.tsv)
[[ -z $subj ]] && { echo "$name: no subject"; exit 1; }
refline="Input images: Image 1 is a style reference from the same icon set. Match its cut style, edge quality, level of detail and the way details are cut out exactly. Do not copy its subject or its shape.
"
prompt=$(python3 -I -c 'import sys;t=open(sys.argv[3]).read();print(t.replace("__REF__",sys.argv[1]).replace("__SUBJECT__",sys.argv[2]))' "$refline" "$subj" template.txt)
[[ -f raw/$name.png ]] && mv raw/$name.png raw/$name.v$(date +%s).png
codex exec --skip-git-repo-check -s read-only "$prompt" -i key.png < /dev/null > raw/$name.log 2>&1
sid=$(awk '/^session id:/{print $3; exit}' raw/$name.log)
f=$(ls -t ~/.codex/generated_images/$sid/*.png 2>/dev/null | head -1)
[[ -n $f ]] && cp "$f" raw/$name.png && echo "$name ok" || echo "$name FAILED"
