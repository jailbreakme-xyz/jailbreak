FROM node:23.3.0

WORKDIR /usr/src/app/frontend/

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "dev"]
