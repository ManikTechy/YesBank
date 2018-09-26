#!/usr/bin/env bash
set -euo pipefail

function get_changed_parent_commit() {
    head_commit="$(git rev-parse HEAD)"
    merge_base="$(git merge-base HEAD origin/master)"
    if [ "${head_commit}" == "${merge_base}" ]; then
        echo "HEAD^"
    else
        echo "${merge_base}"
    fi
}

export NODE_PATH=/usr/lib/node_modules
exec node ./src/jeans/ci/web/runTaskForChanged.js -t=build -c="$(get_changed_parent_commit)" --deployableOnly
