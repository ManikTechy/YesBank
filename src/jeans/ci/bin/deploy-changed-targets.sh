#!/bin/bash

function get_changed_parent_commit() {
    head_commit="$(git rev-parse HEAD)"
    merge_base="$(git merge-base HEAD origin/master)"
    if [ "${head_commit}" == "${merge_base}" ]; then
        echo "HEAD^"
    else
        echo "${merge_base}"
    fi
}

ENVIRONMENT=$1
export NODE_PATH=/usr/lib/node_modules
node ./src/js/src/jeans/ci/web/getChangedTargets.js "$(get_changed_parent_commit)" --deployableOnly > changed-targets
(
  while read -r l
  do
    ./src/js/services/"$l"/deploy.sh "$ENVIRONMENT"
  done
) < changed-targets
