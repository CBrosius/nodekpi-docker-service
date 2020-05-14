#!/bin/bash

bash /opt/nodepki/start.sh

bash /opt/nodepki-webclient/start.sh

supervisord --nodaemon --configuration /etc/supervisord.conf

