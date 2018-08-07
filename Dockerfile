FROM node:10
WORKDIR /opt
ENV NODE_ENV=production
EXPOSE 8080

COPY . .
RUN yarn install
RUN yarn run build
CMD ["yarn", "run", "start"]
