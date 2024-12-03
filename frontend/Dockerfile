FROM node:20-alpine
 
WORKDIR /usr/src/app/frontend/

# RUN apk add --no-cache python3 make g++ bash

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true

EXPOSE 3000

# CMD ["npm", "start"]
