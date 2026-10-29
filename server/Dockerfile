
FROM node:lts-slim

WORKDIR /app

COPY package*.json ./

RUN npm install --global yarn@1.22.22
RUN yarn install

COPY . .

RUN yarn build

CMD [ "yarn", "start:dev" ]
