#!/bin/bash

#
# Start the sample application:
# 1) in docker or
# 2) in native OS - type CTRL C to terminate both the client and server components of the sample app
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
    echo "    help - print this message"
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
            help) usage; exit 0 ;;
            *) echo "Unknown parameter passed: $1"; usage; exit 1 ;;
        esac
        shift
    done
fi

# Set bash builtins for safety
set -e -u -o pipefail

ENV_SETTINGS="server/src/pre-start/env/development.env"
CONFIG_FILE="server/src/configs/config.ts"

# check env settings and config are properly set and provisioned at expected locations
if [ -f "${ENV_SETTINGS}" ]
then
    echo_msg
    echo_msg "Development env file found at: ${ENV_SETTINGS}"
else
    echo_msg
    echo_msg "ERROR: The development env file not found, please following README to copy it from sample and customize it if needed."
    exit 1
fi

if [ -f "${CONFIG_FILE}" ]
then
    echo_msg
    echo_msg "BB2 App config found at: ${CONFIG_FILE}"
else
    echo_msg
    echo_msg "ERROR: The BB2 App config file not found, please following README to copy it from sample and customize it if needed."
    exit 1
fi

if [ "$run_in_docker" = true ]
then
    # stop all before start the sample
    docker-compose down
    # start sample (client - the front end, server - the application), blocking, Ctrl C to terminate
    echo "Starting the sample by docker compose in foreground ..."
    echo "service : client - the front end, service : server - the application), type Ctrl C to terminate the sample"
    docker-compose up
else
    echo "Starting the server and client components in native OS in foreground, type Ctrl C to terminate both the client and server components."
    yarn --cwd client install
    yarn --cwd server install
    parallel --line-buffer --tag ::: 'yarn --cwd server start:dev' 'yarn --cwd client start2'
fi