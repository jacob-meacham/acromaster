#!/bin/sh

current_brach=$(git rev-parse --abbrev-ref HEAD)
echo $current_brach
if [ $current_brach == develop ]
    then
        app_name=acromaster-staging
    else
        app_name=acromaster
fi
echo Deploying to app $app_name...

gem install heroku
git remote add heroku git@heroku.com:{$app_name}.git

# Turn off warnings about SSH keys:
echo "Host heroku.com" >> ~/.ssh/config
echo " StrictHostKeyChecking no" >> ~/.ssh/config
echo " CheckHostIP no" >> ~/.ssh/config
echo " UserKnownHostsFile=/dev/null" >> ~/.ssh/config
heroku keys:clear --app $app_name
yes | heroku keys:add --app $app_name

hash_name=COMMIT_HASH
hash=$(git rev-parse HEAD | cut -c-10)
echo Setting $hash_name to $hash
yes | heroku config:set $hash_name=$hash --app $app_name