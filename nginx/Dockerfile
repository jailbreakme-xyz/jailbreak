FROM nginx
RUN apt update && apt install -y vim
COPY ./default.conf /etc/nginx/conf.d/default.conf
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./tail.sh /tail.sh
