FROM node:16-alpine

WORKDIR /usr/app

COPY package*.json ./

RUN npm ci --only=production

# Bundle app source
COPY ./src ./src
COPY ./index.js .

# EXPOSE 9988

CMD [ "npm", "start" ]