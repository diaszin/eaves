#!/usr/bin/env bash
set -euo pipefail

read -r -p "Nome da migração: " migration_name

if [[ -z "${migration_name//[[:space:]]/}" ]]; then
  printf 'O nome da migração não pode ficar vazio.\n' >&2
  exit 1
fi

read -r -a words <<< "$migration_name"
camel_case=""

for word in "${words[@]}"; do
  word="${word,,}"
  if [[ -z "$camel_case" ]]; then
    camel_case="$word"
  else
    camel_case+="${word^}"
  fi
done

cd "$(dirname "$0")"
yarn migration:generate "src/migration/$camel_case" -d src/data-source.ts