Running backend & frontend
---------------
    
    copy server/src/configs/sample.config.ts -> server/src/configs/config.ts
    replace the secret variables with the ones for your application

    copy server/src/pre-start/env/sandbox.sample.env -> server/src/pre-start/env/development.env

    docker-compose up -d

BB2 Sandbox User
-----------
To ensure data displays properly in the sample application please use a 
Blue Button 2 Sandbox user that has PDE EoBs.  An example of a user with this
data would be:  BBUser29999 (PWD: PW29999!) or BBUser29998 (PWD: PW29998!)

Development
-----------
Read the DEVELOPER NOTES found in the code to understand the application
and where you will need to make adjustments/changes as well as some 
suggestions for best practices.

Usage Examples:
-----------

To start the sample in Docker :

1. go to the base directory of the repo
2. start.sh docker

To start the sample in native OS (e.g. Linux) :

1. go to the base directory of the repo
2. start.sh native

To stop the sample:

Both ways of starting the sample are running the sample in fore ground, logging and tracing from both client and server components are on stdout of the command window, to stop the sample, press Ctl + C, which will terminate both the client and server components.
