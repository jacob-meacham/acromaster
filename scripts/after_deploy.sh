#!/bin/sh

if [ $TRAVIS_BRANCH == "develop" ]
    then
        app_name=acromaster-staging
    else
        app_name=acromaster
fi
echo Deploying to app $app_name...

if [ $TRAVIS_TAG ]
    then
        verion=$TRAVIS_TAG-$TRAVIS_COMMIT
    else
        version=$TRAVIS_COMMIT
fi

version_name=VERSION
echo Setting $version_name to $version
curl -s -w "%{http_code}" -n -o /dev/null -X PATCH https://api.heroku.com/apps/acromaster-staging/config-vars \
-H "Accept: application/vnd.heroku+json; version=3" \
-H "Authorization: Bearer $API_KEY" \
-H "Content-Type: application/json" \
-d "{
  \"VERSION\": \"$version\"
}"