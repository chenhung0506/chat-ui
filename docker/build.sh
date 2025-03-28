#!/bin/bash
# TAG=$(git rev-parse --short HEAD)-$(date '+%Y%m%d-%H%M') 
TAG="latest"
DOCKER_IMAGE=react/chat-ui:$TAG
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BUILDROOT=$DIR/..
echo $BUILDROOT

rm default.conf
# Windows
# SELF_IP=`ifconfig | grep -A 1 eth0 | grep "inet " | grep -Fv 127.0.0.1 | awk '{print $2}' | head -n1`;
SELF_IP=$(ip addr | grep -A 1 eth0 | grep "inet " | grep -Fv 127.0.0.1 | awk '{print $2}' | awk -F '/' '{print $1}' | awk 'NR==1')

echo $SELF_IP

API_IP=$SELF_IP:3002

# export API_IP=$API_IP
# echo "$(envsubst < default.conf.template)" >> default.conf
while read line
do
  echo $line | sed -e "s/\${API_IP}/$API_IP/g" | \
    sed -e "s/\${REMOTE_IP}/$REMOTE_IP/g" | \
    sed -e "s/\${API_IP}/$API_IP/g" >> default.conf
done < default.conf.template

cmd="cd $BUILDROOT/app && npm run build && cd $BUILDROOT/docker && sleep 3"
echo $cmd
eval $cmd
cp -r ../app/build/ ./ 
sleep 3

# Build docker
cd $BUILDROOT
cmd="docker build -t $DOCKER_IMAGE -f $DIR/DockerFile $BUILDROOT"

echo $cmd
eval $cmd


while getopts "P" OPT ; do
  case ${OPT} in
    P)
      cmd="docker push $DOCKER_IMAGE"
      echo $cmd && eval $cmd
      ;;
  esac
done

echo $DOCKER_IMAGE

if [ $(docker ps -a -q -f name=chat-ui) ]; then
    docker rm -f chat-ui
fi
