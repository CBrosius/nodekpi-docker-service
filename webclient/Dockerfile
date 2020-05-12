FROM node:lts-alpine

RUN apk add --no-cache \
    openssl \
    curl \
    bash \
    nano \

WORKDIR /opt/nodepki-webclient
COPY . .

RUN cd /opt/nodepki-webclient && npm install

RUN chmod +x /opt/nodepki-webclient/start.sh

VOLUME ["/opt/nodepki-webclient/data"]

CMD ["bash", "/opt/nodepki-webclient/start.sh"]

