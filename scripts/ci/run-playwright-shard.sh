#!/usr/bin/env bash

set -euo pipefail

parallel_step="${BITBUCKET_PARALLEL_STEP:-0}"
parallel_total="${BITBUCKET_PARALLEL_STEP_COUNT:-1}"
project_args="${PW_PROJECT_ARGS:---project=chromium --project=system-management-chromium --project=Regression}"
extra_args="${PW_EXTRA_ARGS:-}"
shard_arg=""
disable_sharding="${PW_DISABLE_SHARDING:-false}"
shard_index_override="${PW_SHARD_INDEX:-}"
shard_total_override="${PW_SHARD_TOTAL:-}"

if [ "${disable_sharding}" = "true" ]; then
  echo "Running Playwright without sharding (PW_DISABLE_SHARDING=true)"
elif [ -n "${shard_index_override}" ] && [ -n "${shard_total_override}" ]; then
  shard_number="${shard_index_override}"
  shard_total="${shard_total_override}"
  shard_arg="--shard=${shard_number}/${shard_total}"
  echo "Running Playwright shard ${shard_number}/${shard_total} (override)"
elif [ "${parallel_total}" -gt 1 ]; then
  shard_number=$((parallel_step + 1))
  shard_arg="--shard=${shard_number}/${parallel_total}"
  echo "Running Playwright shard ${shard_number}/${parallel_total}"
else
  echo "Running Playwright without sharding"
fi

cmd="pnpm exec playwright test ${project_args} ${extra_args} ${shard_arg}"
echo "${cmd}"
eval "${cmd}"
