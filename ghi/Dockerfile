FROM nginx:1.19-alpine
COPY ./todos.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html

COPY static/. .
