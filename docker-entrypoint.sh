#!/bin/bash

/opt/nodepki/start.sh

/opt/nodepki-webclient/start.sh

supervisord --nodaemon --configuration /etc/supervisord.conf

