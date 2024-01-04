FROM node:19.9-slim

LABEL version="1.1"
LABEL description="Demo of a Medicare claims data sample app"

WORKDIR /server

COPY . . 

RUN yarn install

EXPOSE 3001

CMD ["yarn","start:debug"]