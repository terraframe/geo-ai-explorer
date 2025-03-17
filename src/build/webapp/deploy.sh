#
#
#

# This tells the build which version of npm to use:
. $NVM_DIR/nvm.sh && nvm install lts/jod

export ANSIBLE_HOST_KEY_CHECKING=false

:
: ----------------------------------
:  Build and test
: ----------------------------------
:
  ## Build angular source ##
  npm version
  cd $WORKSPACE/geo-ai-explorer/geo-ai-explorer-ui
  npm install --force
  node -v && npm -v
  #node --max_old_space_size=4096 ./node_modules/webpack/bin/webpack.js --config config/webpack.prod.js --profile
  npm run build  
  
  cd $WORKSPACE/geo-ai-explorer
  sed -i '' 's|http://localhost:8080/|https://ai.geoprism.net/g' ../../../geo-ai-explorer-ui/src/environments/environment.ts
  mvn clean install -B

  # Build a Docker image
  cd $WORKSPACE/geo-ai-explorer/src/build/webapp
  ./docker-build.sh

:
: ----------------------------------
:  Deploy to ai.geoprism.net
: ----------------------------------
:
cd $WORKSPACE/geoprism-cloud/ansible

[ -h ./inventory ] && unlink ./inventory
[ -d ./inventory ] && rm -r ./inventory
ln -s $WORKSPACE/geoprism-platform/ansible/inventory ./inventory

[ -h ../permissions ] && unlink ../permissions
ln -s $WORKSPACE/geoprism-platform/permissions ../permissions

ln -s $WORKSPACE/geoprism-platform/ansible/geo-ai-explorer.yml ./geo-ai-explorer.yml

ansible-playbook geo-ai-explorer.yml -vv -i inventory/usace/$environment.ini --extra-vars "webserver_docker_image_tag=$tag docker_image_path=../../geo-ai-explorer/src/build/webapp/target/geo-ai-explorer-api.dimg.gz"

exit 0;