FROM node:10
ENV NODE_ENV=production
WORKDIR /opt
EXPOSE 8080

COPY . .
RUN yarn install --non-interactive --frozen-lockfile
RUN yarn run build
CMD ["yarn", "run", "start"]
