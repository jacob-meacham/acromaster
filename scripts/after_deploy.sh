#!/bin/sh

hash_name=COMMIT_HASH
hash=$(git rev-parse HEAD | cut -c-10)
current_brach=$(git rev-parse --abbrev-ref HEAD)
if [ $current_brach == develop ]
    then
        app_name=acromaster-staging
    else
        app_name=acromaster
fi
echo Setting $hash_name to $hash on $app_name
heroku config:set $hash_name=$hash --app $app_name