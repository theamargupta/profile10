#!/usr/bin/env bash
# Production deploy of amargupta.tech, by hand. Ported from amar-gupta-admin (bfc8831c) on 2026-10-14 to stop push
# builds spending Build CPU Minutes on the Hobby team that profile10 shares with admin. A push to main does not deploy:
# vercel.json has git.deploymentEnabled=false, and the leader sets the project's Ignored Build Step to `exit 0`.
# Vercel docs: "If the command exits with code 0, the build is immediately aborted, and the deployment state is set
# to CANCELED" (https://vercel.com/docs/project-configuration/project-settings#ignored-build-step). A CLI deploy is
# not a git deployment, so it builds. Spec: docs/specs/manual-prod-deploy.md (reasoning: admin's
# docs/superpowers/specs/2026-10-13-manual-prod-deploy.md).
#
# Build Linux x64 in a short-lived Colima profile: Vercel's Build Output API says native binaries should be built on
# Linux x64, and sharp (next/image) is native here. The function architecture also comes from process.arch, so a bare
# Mac build would ship arm64. The vercel-build profile is shared with admin; the leader never runs both at once.
# The trap stops the VM and deletes pulled production variables.
set -euo pipefail

if [[ -n "$(git status --porcelain --untracked-files=no)" ]]; then
  echo "deploy-prod: refused — tracked files are modified; deploy only a committed, pushed SHA" >&2
  exit 1
fi
if [[ ! -f .vercel/project.json ]]; then
  echo "deploy-prod: refused — no .vercel/project.json here; copy it from the main checkout" >&2
  exit 1
fi
# A copied or stale project.json would point pull and deploy at another project in the same scope (Codex review,
# 2026-10-14). The id is the main checkout's, read 2026-10-14.
expected_project_id="prj_7ria9GQtYG9IaFjHMhraVGbnQMW9"
linked_project_id="$(jq -r .projectId .vercel/project.json)"
if [[ "$linked_project_id" != "$expected_project_id" ]]; then
  echo "deploy-prod: refused — .vercel/project.json links $linked_project_id, not profile10 ($expected_project_id)" >&2
  exit 1
fi
git fetch --quiet origin main
sha="$(git rev-parse HEAD)"
if ! git merge-base --is-ancestor "$sha" origin/main; then
  echo "deploy-prod: refused — HEAD $sha is not on origin/main; push it first" >&2
  exit 1
fi

started_colima=0
previous_docker_context=""

cleanup() {
  local status=$?
  # Every step is best-effort: under `set -e` a failed `colima stop` used to end the trap before the context was
  # restored and the secrets deleted (Codex review, 2026-10-14). The run still exits with its original status.
  set +e
  if [[ "$started_colima" -eq 1 ]]; then
    colima stop -p vercel-build || echo "deploy-prod: colima stop failed — stop it by hand: colima stop -p vercel-build" >&2
  fi
  if [[ -n "$previous_docker_context" ]]; then
    docker context use "$previous_docker_context" || echo "deploy-prod: could not restore Docker context $previous_docker_context" >&2
  fi
  # Production secrets and the built output leave the Mac checkout however the run ended.
  rm -rf .vercel/.env.production.local .vercel/output
  exit "$status"
}

# The trap is set before `vercel pull`, so a pull that fails halfway still leaves no secrets on disk.
previous_docker_context="$(docker context show)"
trap cleanup EXIT
step_started="$(date +%s)"
vercel pull --yes --environment=production --scope amargupta
echo "deploy-prod: pull completed in $(( $(date +%s) - step_started ))s"

# A NEXT_PUBLIC_* value is inlined at build time, and a Sensitive variable pulls empty ("cannot be read back",
# https://vercel.com/docs/environment-variables/sensitive-environment-variables). On 2026-10-14 an empty
# NEXT_PUBLIC_APP_URL broke every QStash publish in admin; here an empty NEXT_PUBLIC_SUPABASE_* would blank the
# browser's Supabase client. Server-only variables still arrive at runtime, so only these refuse.
# awk, not grep: no match is exit 0, and a missing file still fails the run.
empty_public="$(awk -F= '/^NEXT_PUBLIC_[A-Z0-9_]*=("")?$/ { print $1 }' .vercel/.env.production.local)"
if [[ -n "$empty_public" ]]; then
  echo "deploy-prod: refused — pulled empty (Sensitive on Vercel?): $empty_public" >&2
  echo "deploy-prod: re-add each with: vercel env add <KEY> production --force --no-sensitive --scope amargupta" >&2
  exit 1
fi

# Docker chalu: its own profile leaves Amar's default Colima profile alone. Rosetta is required for linux/amd64.
step_started="$(date +%s)"
# Marked before the start: a start that fails halfway can still leave the VM up, and the trap must stop it.
started_colima=1
colima start -p vercel-build --vm-type vz --vz-rosetta --cpu 6 --memory 8 --disk 40
echo "deploy-prod: Docker chalu in $(( $(date +%s) - step_started ))s"

# Build: source stays read-only; persistent npm and Next caches make the isolated build warm without copying outputs.
step_started="$(date +%s)"
docker --context colima-vercel-build build --platform linux/amd64 -t profile10-vercel-build scripts/deploy
docker --context colima-vercel-build run --rm --platform linux/amd64 --cpus 6 --memory 8g \
  -v "$PWD:/src:ro" \
  -v "$PWD/.vercel:/out" \
  -v profile10-npm-cache:/root/.npm \
  -v profile10-next-cache:/work/.next/cache \
  -v "$PWD/scripts/deploy/build-in-container.sh:/build.sh:ro" \
  profile10-vercel-build /build.sh
echo "deploy-prod: build completed in $(( $(date +%s) - step_started ))s"

# Docker band now, before upload. The EXIT trap retains the same guarantee when a build command above fails.
step_started="$(date +%s)"
colima stop -p vercel-build
started_colima=0
echo "deploy-prod: Docker band in $(( $(date +%s) - step_started ))s"

deploy_args=(deploy --prebuilt --prod --yes --scope amargupta --archive=tgz --meta "gitSha=$sha" --meta githubDeployment=1 --meta githubCommitRef=main)
if [[ "${DEPLOY_SKIP_DOMAIN:-}" == 1 ]]; then
  deploy_args+=(--skip-domain)
fi
step_started="$(date +%s)"
vercel "${deploy_args[@]}"
echo "deploy-prod: upload completed in $(( $(date +%s) - step_started ))s"

# stdout is NOT parsed: the docs call it a deployment URL, but agent mode printed JSON on 2026-10-13. Locate the
# deployment by its SHA instead, then require Vercel's READY state before returning success.
project_id="$expected_project_id"
state="$(vercel api "/v6/deployments?projectId=$project_id&target=production&limit=20" --scope amargupta |
  jq -r --arg sha "$sha" '[.deployments[] | select(.meta.gitSha == $sha)][0] | "\(.readyState) \(.meta.gitSha) \(.url)"')"
echo "deploy-prod: readyState/gitSha/url = $state"
if [[ "$state" != "READY $sha "* ]]; then
  echo "deploy-prod: deployment is not READY at $sha" >&2
  exit 1
fi
