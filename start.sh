#!/bin/bash

#
# Start the sample application:
# 1) in docker or
# 2) in native OS
#

# help
usage()
{
    echo
    echo "Usage:"
    echo
    echo "    start.sh [docker|native]"
    echo
    echo "    docker (default) - start the sample by docker compose"
    echo
    echo "    native - start the sample in native OS"
    echo
}

# main
run_in_docker=true
if [[ "$#" -gt 0 ]]
then
    while [[ "$#" -gt 0 ]]; do
        case $1 in
            docker) shift ;;
            native) run_in_docker=false; shift ;;
            *) echo "Unknown parameter passed: $1"; usage; exit 1 ;;
        esac
        shift
    done
fi

# Set bash builtins for safety
set -e -u -o pipefail

if [ "$run_in_docker" = true ]
then
    # stop all before start the sample
    docker-compose down
    # start sample (client - the front end, server - the application), blocking, Ctrl C to terminate
    echo "Starting the sample by docker compose ..."
    echo "service : client - the front end, service : server - the application), blocking, Ctrl C to terminate the sample"
    docker-compose up
else
    yarn --cwd client install
    yarn --cwd server install
    parallel --line-buffer --tag ::: 'yarn --cwd client start2' 'yarn --cwd server start:dev'
fi