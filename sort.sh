#!/bin/sh
cat /var/log/nginx/log.log | tail -n 1000 | grep -Po '^.*?\s' | sort | uniq -c | sort -nr | head -n 10