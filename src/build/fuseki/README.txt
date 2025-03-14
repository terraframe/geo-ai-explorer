# Setup the flood dataset in fuseki 
cp config.ttl /data/fuseki/fuseki-base/configuration

# LOADING DATA INTO FUSEKI

## Shut down the docker container
sudo docker-compose down

## Download the non docker version for the jena command line tools and fuseki

wget https://dlcdn.apache.org/jena/binaries/apache-jena-5.3.0.tar.gz
wget https://dlcdn.apache.org/jena/binaries/apache-jena-fuseki-5.3.0.tar.gz

## Use tbdloader to load the data
apache-jena-5.3.0/bin/tdbloader --loc /data/fuseki/data/tdb ...input files

## After the is loaded you must build the full text index
sudo java -cp apache-jena-fuseki-5.3.0/fuseki-server.jar jena.textindexer --desc=/data/fuseki/fuseki-base/configuration/config.ttl

## Restart the docker server
sudo docker-compose up
