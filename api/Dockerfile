FROM node:lts-alpine

RUN apk add --no-cache \
    openssl \
    curl \
    bash \
    nano \
    supervisor

WORKDIR /opt/nodepki
COPY . .

RUN cd /opt/nodepki && npm install

RUN chmod +x /opt/nodepki/start.sh

VOLUME ["/opt/nodepki/data"]

CMD ["bash", "/opt/nodepki/start.sh"]

