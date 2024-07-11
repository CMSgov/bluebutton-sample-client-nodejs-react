FROM node:20-slim

LABEL version="1.1"
LABEL description="Demo of a Medicare claims data sample app"

WORKDIR /server

COPY . . 

# In case machine is Mac M1 chip
RUN node --version
RUN yarn install

EXPOSE 3001

CMD ["yarn","start:debug"]