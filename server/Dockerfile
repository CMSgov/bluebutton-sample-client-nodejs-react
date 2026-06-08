FROM node:20-slim

LABEL version="1.1"
LABEL description="Demo of a Medicare claims data sample app"

WORKDIR /server

COPY . . 

RUN apt-get update \
    && apt-get install -y libgnutls30=3.7.9-2+deb12u7

# In case machine is Mac M1 chip
RUN node --version
RUN yarn install

EXPOSE 3001

CMD ["yarn","start:debug"]