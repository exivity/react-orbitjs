#!/bin/bash
#
# -e - aborts script if any command fails
# -x - echos the commands
set -ex

project_path="$TRAVIS_BUILD_DIR/tmp/partner-tests/sil/scriptoria"
git_url="https://github.com/sillsdev/appbuilder-portal.git"
frontend_directory="$project_path/appbuilder-portal/source/SIL.AppBuilder.Portal.Frontend"

mkdir -p $project_path
cd $project_path

git clone $git_url
cd $frontend_directory

# swap out react-orbitjs with the latest commit
jq ".\"react-orbitjs\" = \"${TRAVIS_REPO_SLUG}#${TRAVIS_COMMIT}\""

yarn install
yarn test:ci


