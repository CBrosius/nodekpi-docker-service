#!/bin/bash

CA_API_SERVER_URL=${CA_API_SERVER_URL:?'Api server needed'}
CA_API_SERVER_PLAIN_PORT=${CA_API_SERVER_PLAIN_PORT:-8080}

COUNTRY_CODE=${COUNTRY_CODE:-''}
STATE_NAME=${STATE_NAME:-''}
LOCALITY_NAME=${LOCALITY_NAME:-''}
ORGANIZATION_NAME=${ORGANIZATION_NAME:-''}

CA_WEBCLIENT_SERVER_PORT=${CA_WEBCLIENT_SERVER_PORT:-5000}
DEF_CA_WEBCLIENT_HTTP_URL="http://${HOSTNAME}:${CA_WEBCLIENT_SERVER_PORT}"
CA_WEBCLIENT_HTTP_URL=${CA_WEBCLIENT_HTTP_URL:-$DEF_CA_WEBCLIENT_HTTP_URL}
CA_WEBCLIENT_BIND_IP_ADDRESS=${CA_WEBCLIENT_BIND_IP_ADDRESS:-"0.0.0.0"}
CA_API_SERVER_TLS_ENABLED=${CA_API_SERVER_TLS_ENABLED:-false}

mkdir -p /opt/nodepki-webclient/data/config

tee /opt/nodepki-webclient/data/config/config.yml <<EOF

server:
    baseurl: ${CA_WEBCLIENT_HTTP_URL}
    ip: ${CA_WEBCLIENT_BIND_IP_ADDRESS}
    port: ${CA_WEBCLIENT_SERVER_PORT}

apiserver:
    hostname: ${CA_API_SERVER_URL}
    port: ${CA_API_SERVER_PLAIN_PORT}
    publicport: ${CA_API_SERVER_PLAIN_PORT}
    tls: ${CA_API_SERVER_TLS_ENABLED}

csr_defaults:
    country: ${COUNTRY_CODE}
    state: ${STATE_NAME}
    locality: ${LOCALITY_NAME}
    organization: ${ORGANIZATION_NAME}
EOF

cd /opt/nodepki-webclient
node app.js