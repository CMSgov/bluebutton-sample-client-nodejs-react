FROM node:18.14-slim

LABEL version="1.0"
LABEL description="Demo of a Medicare claims data sample app"

WORKDIR /server

COPY . . 

RUN yarn install

EXPOSE 3001

CMD ["yarn","start:debug"]