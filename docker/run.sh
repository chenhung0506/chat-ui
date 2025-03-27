#!/bin/bash
DOCKER_IMAGE=react/chat-ui:latest

echo $DOCKER_IMAGE

docker rm -f chat-ui

docker run --name chat-ui --restart always -p 3000:3000 -d $DOCKER_IMAGE nginx -g 'daemon off;'
