FROM node:20-alpine

WORKDIR /usr/src/app/backend/

RUN npm install -g nodemon

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8001