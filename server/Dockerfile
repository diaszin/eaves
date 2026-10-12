
FROM node:lts-slim

WORKDIR /app

COPY package.json yarn.lock ./

RUN corepack enable \
    && corepack prepare yarn@1.22.22 --activate \
    && yarn install --frozen-lockfile

COPY . .

EXPOSE 3000

CMD ["yarn", "start:dev"]
