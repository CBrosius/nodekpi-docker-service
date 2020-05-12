FROM node:lts-alpine

RUN apk add --no-cache \
    openssl \
    curl \
	bash \
	nano \
    supervisor

### RUN cd /opt && git clone https://github.com/aditosoftware/nodepki.git && cd /opt/nodepki && npm install

WORKDIR /opt/nodepki
COPY . .

RUN cd /opt/nodepki && npm install

RUN chmod +x /start.sh

VOLUME ["/opt/nodepki/data"]

CMD ["bash", "/start.sh"]

