FROM node:lts-alpine

RUN apk add --no-cache \
    openssl \
    curl \
    bash \
    supervisor

RUN mkdir -p /var/log/supervisor

ARG PASSPHRASE="123456789"
# ARG ROOT_CA_COMMON_NAME="Private Root CA"
# ARG INTERMEDIATE_PASSPHRASE="123456789" 
# ARG INTERMEDIATE_CA_COMMON_NAME="Private Intermediate CA"
# ARG OCSP_PASSPHRASE="123456789"
ARG COUNTRY_CODE=DE
ARG STATE_NAME=RLP
ARG LOCALITY_NAME=RLP
ARG ORGANIZATION_NAME=private
ARG WEBUI_USER=admin
ARG WEBUI_PASS=admin
# ARG CA_API_SERVER_URL=127.0.0.1
ARG CA_WEBCLIENT_HTTP_URL="http://192.168.60.11:5000"

ENV PASSPHRASE=$PASSPHRASE
# ENV ROOT_CA_COMMON_NAME=$ROOT_CA_COMMON_NAME
# ENV INTERMEDIATE_PASSPHRASE=$INTERMEDIATE_PASSPHRASE 
# ENV INTERMEDIATE_CA_COMMON_NAME=$INTERMEDIATE_CA_COMMON_NAME
# ENV OCSP_PASSPHRASE=$OCSP_PASSPHRASE
ENV COUNTRY_CODE=$COUNTRY_CODE
ENV STATE_NAME=$STATE_NAME
ENV LOCALITY_NAME=$LOCALITY_NAME
ENV ORGANIZATION_NAME=$ORGANIZATION_NAME
ENV WEBUI_USER=$WEBUI_USER
ENV WEBUI_PASS=$WEBUI_PASS
# ENV CA_API_SERVER_URL=$CA_API_SERVER_URL
ENV CA_WEBCLIENT_HTTP_URL=$CA_WEBCLIENT_HTTP_URL

# create NodePKI 
WORKDIR /opt/nodepki
COPY ./api/ .
RUN chmod +x /opt/nodepki/start.sh
RUN cd /opt/nodepki && npm install
VOLUME ["/opt/nodepki/data"]

# create NodePKI-WebClient
WORKDIR /opt/nodepki-webclient
COPY ./webclient/ .
RUN chmod +x /opt/nodepki-webclient/start.sh
RUN cd /opt/nodepki-webclient && npm install
VOLUME ["/opt/nodepki-webclient/data"]

# Expose ports
EXPOSE 5000

WORKDIR /opt

ADD supervisord.conf /etc/

COPY docker-entrypoint.sh /opt/
RUN chmod +x /opt/docker-entrypoint.sh
ENTRYPOINT ["/opt/docker-entrypoint.sh"]
