FROM node:20-slim

LABEL version="1.1"
LABEL description="Demo of a Medicare claims data sample app"

WORKDIR /client

COPY . .

# In case machine is Mac M1 chip
RUN node --version
RUN yarn install

EXPOSE 3000

CMD ["yarn","start"]