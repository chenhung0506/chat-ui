#!/bin/bash
REPO=harbor.emotibot.com/bfop
CONTAINER=chat-room-ui
TAG=base
DOCKER_IMAGE=$REPO/$CONTAINER:$TAG

DOCKER_IMAGE=harbor.chlin.tk/vue/websocket-ui:latest

echo $DOCKER_IMAGE

docker rm -f websocket-ui

docker run --name websocket-ui --restart always -p 3003:3003 -d $DOCKER_IMAGE nginx -g 'daemon off;'
