FROM node:10
WORKDIR /opt
EXPOSE 8080

COPY . .
RUN yarn install --non-interactive --frozen-lockfile
RUN yarn run build
CMD ["yarn", "run", "start"]
