FROM node:26.7.0-alpine3.24

LABEL version="1.1"
LABEL description="Demo of a Medicare claims data sample app"

WORKDIR /server

COPY . . 

RUN apk update && \
    apk add --no-cache gnutls libcap libssh2

RUN npm install -g yarn

# In case machine is Mac M1 chip
RUN node --version
RUN yarn install

EXPOSE 3001

CMD ["yarn","start:debug"]