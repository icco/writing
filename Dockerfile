FROM node:18-alpine
WORKDIR /opt
EXPOSE 8080

ENV GRAPHQL_ORIGIN="https://graphql.natwelch.com/graphql"
ENV PORT=8080
ENV DOMAIN="https://writing.natwelch.com"

RUN apk add --no-cache git

COPY . .

RUN npm ci
RUN npm run build
CMD ["npm", "run", "start"]
