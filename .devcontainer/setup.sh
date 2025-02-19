#!/bin/bash

# Create all necessary directories
mkdir -p /var/lib/docker/codespacemount/.persistedshare
mkdir -p ~/.vscode-server/logs
mkdir -p /workspaces/.codespaces/.persistedshare

# Create log files
touch /var/lib/docker/codespacemount/.persistedshare/vsserverhostlog.txt
touch /var/lib/docker/codespacemount/.persistedshare/vsserverterminallog.txt
touch ~/.vscode-server/logs/vsserverhostlog.txt
touch ~/.vscode-server/logs/vsserverterminallog.txt

# Set permissions
chmod -R 777 /var/lib/docker/codespacemount/.persistedshare || true
chmod -R 777 ~/.vscode-server/logs || true
chmod -R 777 /workspaces/.codespaces/.persistedshare || true

# Install dependencies
npm install
