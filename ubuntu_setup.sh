#!/bin/bash
# Ubuntu Setup Script for piata-ai.ro
sudo apt update && sudo apt upgrade -y
sudo apt install -y nodejs npm nginx git
sudo npm install -g pm2
# Configurare Nginx pentru Cloudflare
echo "Configuring Nginx for piata-ai.ro..."