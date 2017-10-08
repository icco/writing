FROM node:8
WORKDIR /opt
COPY . .
RUN yarn install
RUN yarn build

FROM nginx:latest
COPY nginx.conf /etc/nginx/conf.d/default.conf
WORKDIR /usr/share/nginx/html
COPY --from=0 /opt/build/ .
RUN ls -alh
EXPOSE 8080
