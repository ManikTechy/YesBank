#!/usr/bin/env bash

# This script receives a string pointing to a folder,
# in that folder structure it looks for all files with a '.re' file ending,
# for each file it compares the raw file with a refmt'd version to determine
# if the file is correctly formatted (this uses the reason/bucklescript formatter)

set -u

WHERE=$1
REFMT=node_modules/bs-platform/lib/refmt.exe
errorfile="$(mktemp refmt-errors.XXXXXXXX)"

cleanup() {
    rm -f "$errorfile"
}
trap cleanup EXIT

find "$WHERE" -name "*.re" | while IFS= read -r file
do
    REFMT_DIFF=$(diff -u <(cat "$file") <("$REFMT" "$file")) > /dev/null
    if [[ $REFMT_DIFF != "" ]]; then
        echo "$file" >> "$errorfile"
        echo "$REFMT_DIFF" >> "$errorfile"
    fi
done

if [[ -s $errorfile  ]]; then
    echo "Errors in refmt, exiting!" 1>&2
    cat "$errorfile"
    exit 1
fi
