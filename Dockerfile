FROM node:lts-alpine

RUN apk add --no-cache \
    openssl \
    curl \
    bash \
    supervisor

RUN mkdir -p /var/log/supervisor

# create NodePKI 
WORKDIR /opt/nodepki
COPY ./api/ .

RUN cd /opt/nodepki && npm install

RUN chmod +x /opt/nodepki/start.sh

VOLUME ["/opt/nodepki/data"]

CMD ["bash", "/opt/nodepki/start.sh"]

# create NodePKI-WebClient
WORKDIR /opt/nodepki-webclient
COPY ./webclient/ .

RUN cd /opt/nodepki-webclient && npm install

RUN chmod +x /opt/nodepki-webclient/start.sh

VOLUME ["/opt/nodepki-webclient/data"]

CMD ["bash", "/opt/nodepki-webclient/start.sh"]

# Expose ports
EXPOSE 5000

ADD supervisord.conf /etc/

ENTRYPOINT ["supervisord", "--nodaemon", "--configuration", "/etc/supervisord.conf"]
