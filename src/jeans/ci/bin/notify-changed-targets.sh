#!/usr/bin/env bash
set -euo pipefail

./src/jeans/ci/web/changed-targets.sh
(
  while read -r l
  do
      gh-status success "$l" "Changed"
  done
) < changed-targets
