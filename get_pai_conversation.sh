#!/bin/bash
# This script prints the content of the PAI conversation log.
# Please execute this script on the server where the application is running
# and paste the output back to me.

if [ -f "/tmp/pai_memory/conversations.json" ]; then
  cat "/tmp/pai_memory/conversations.json"
else
  echo "Error: /tmp/pai_memory/conversations.json not found." >&2
fi
