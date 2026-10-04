FROM node:lts-slim AS dependencies
WORKDIR /app
COPY package.json yarn.lock ./
RUN corepack enable \
	&& corepack prepare yarn@1.22.22 --activate \
	&& yarn install --frozen-lockfile

FROM dependencies AS build
COPY . .
RUN yarn build

FROM node:lts-slim AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package.json yarn.lock ./
RUN corepack enable \
	&& corepack prepare yarn@1.22.22 --activate \
	&& yarn install --frozen-lockfile --production=true \
	&& yarn cache clean
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/main"]

FROM dependencies AS development
COPY . .
EXPOSE 3000
CMD ["yarn", "start:dev"]