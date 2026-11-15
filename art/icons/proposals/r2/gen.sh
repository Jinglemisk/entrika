#!/bin/zsh
# usage: gen.sh <style> <name> [ref.png]   -> <style>/raw/<name>.png
cd "${0:A:h}"
style=$1; name=$2; ref=$3
line=$(awk -F"\t" -v n="$name" '$1==n' subjects.tsv)
subj=$(print -r -- "$line" | cut -f2)
case $style in cini) cols=$(print -r -- "$line" | cut -f3);; mine2) cols=$(print -r -- "$line" | cut -f4);; *) cols="";; esac
refline=""; iarg=()
if [[ -n $ref ]]; then refline="Input images: Image 1 is a style reference from the same icon set. Match its line weight, fill handling, colour handling and level of detail exactly. Do not copy its subject or its shape.
"; iarg=(-i $ref); fi
prompt=$(python3 -c 'import sys;t=open(sys.argv[4]).read();print(t.replace("__REF__",sys.argv[1]).replace("__SUBJECT__",sys.argv[2]).replace("__COLOURS__",sys.argv[3]))' "$refline" "$subj" "$cols" "$style/template.txt")
codex exec --skip-git-repo-check -s read-only "$prompt" $iarg < /dev/null > $style/raw/$name.log 2>&1
sid=$(awk '/^session id:/{print $3; exit}' $style/raw/$name.log)
f=$(ls -t ~/.codex/generated_images/$sid/*.png 2>/dev/null | head -1)
[[ -n $f ]] && cp "$f" $style/raw/$name.png && echo "$style/$name ok" || echo "$style/$name FAILED"
