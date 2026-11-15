#!/bin/zsh
# usage: gen2.sh <name> [extra ref]  -> kati/raw/<name>.png, using kati/subjects2.tsv and kati/raw/divan.png as the style key
cd "${0:A:h}/.."
name=$1; ref2=$2
subj=$(awk -F"\t" -v n="$name" '$1==n{print $2}' kati/subjects2.tsv)
refline="Input images: Image 1 is a style reference from the same icon set. Match its cut style, edge quality, level of detail and the way details are cut out exactly. Do not copy its subject or its shape.
"; iarg=(-i kati/raw/divan.png)
if [[ -n $ref2 ]]; then refline="${refline}Image 2 is the icon from the same set that the subject refers to; keep its shape.
"; iarg+=(-i $ref2); fi
prompt=$(python3 -c 'import sys;t=open(sys.argv[3]).read();print(t.replace("__REF__",sys.argv[1]).replace("__SUBJECT__",sys.argv[2]))' "$refline" "$subj" kati/template.txt)
[[ -f kati/raw/$name.png ]] && mv kati/raw/$name.png kati/raw/$name.v1.png
codex exec --skip-git-repo-check -s read-only "$prompt" $iarg < /dev/null > kati/raw/$name.log 2>&1
sid=$(awk '/^session id:/{print $3; exit}' kati/raw/$name.log)
f=$(ls -t ~/.codex/generated_images/$sid/*.png 2>/dev/null | head -1)
[[ -n $f ]] && cp "$f" kati/raw/$name.png && echo "$name ok" || echo "$name FAILED"
