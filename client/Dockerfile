FROM node:21.5-bookworm-slim

LABEL version="1.0"
LABEL description="Demo of a Medicare claims data sample app"

WORKDIR /client

COPY . .

RUN yarn install

EXPOSE 3000

CMD ["yarn","start"]