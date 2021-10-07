FROM node:14.17.1

LABEL version="1.0"
LABEL description="Demo of a Medicare claims data sample app"

WORKDIR /server

COPY ["./src/configs/sample.config.ts", "./src/configs/config.ts"]
COPY ["./src/pre-start/env/sandbox.sample.env","./src/pre-start/env/development.env"]

COPY . . 

RUN yarn install

EXPOSE 3001

CMD ["yarn","start:dev"]