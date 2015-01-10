#!/bin/sh

hash_name=COMMIT_HASH
hash=$(git rev-parse HEAD | cut -c-10)
echo Setting $hash_name to $hash
heroku config:set $hash_name=$hash --app acromaster