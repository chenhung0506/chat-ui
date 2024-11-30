#!/bin/bash
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "Linux Env"
    SELF_IP=`ifconfig | grep "inet " | grep -Fv 127.0.0.1 | awk '{print $2}' | head -n1`;
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    echo "Windows Env"
    SELF_IP=$( ipconfig | awk '/IPv4/ && $NF ~ /^[0-9]+\./ {print $NF; exit}')
else
    echo "unknown Env"
fi

while getopts "R:I:h" OPT ; do
  echo "$OPT = $OPTARG"
  case ${OPT} in
    R)
      API_IP="$OPTARG";
      ;;
    I)
      PORT="$OPTARG";
      API_IP=$SELF_IP:$PORT;
      ;;
    h)
      echo "Usage: $0 [-I|-H] <remote_ip>";
      echo "    -I : Use local api";
      echo "    -H : Use local auth";
      echo "Example:";
      echo "    ./run_ui.sh -I 3002";
      echo "    ./run_ui.sh -R 172.105.230.31:3002";
      exit 1
      ;;
  esac
done


echo "SELF_IP : $SELF_IP";
echo "PORT    : $PORT";
echo "API_IP  : $API_IP";

export SELF_IP=$SELF_IP

rm nginx.conf
while read line
do
  echo $line | sed -e "s/\${API_IP}/$API_IP/g" | \
  sed -e "s/\${REMOTE_IP}/$REMOTE_IP/g" >> nginx.conf
done < nginx.conf.ui.template

docker rm -f nginx
cmd="docker-compose -f ./docker-compose.yml up --force-recreate -d nginx"
echo $cmd
eval $cmd
