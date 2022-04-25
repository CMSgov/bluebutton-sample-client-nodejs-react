FROM node:14.17.1

LABEL version="1.0"
LABEL description="Demo of a Medicare claims data sample app"

WORKDIR /server

COPY ["./src/configs/sample.config.ts", "./src/configs/config.ts"]
COPY ["./src/pre-start/env/sandbox.sample.env","./src/pre-start/env/development.env"]

COPY . . 

RUN yarn cache clean

# Fix issue with direct install from Github with concurrency option. TODO: Remove later!
#RUN yarn install --network-concurrency 1 --verbose
RUN yarn install --network-concurrency 1

EXPOSE 3001

CMD ["yarn","start:debug"]
