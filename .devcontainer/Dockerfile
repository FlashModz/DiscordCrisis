FROM mcr.microsoft.com/devcontainers/javascript-node:18

# Installation des dépendances système supplémentaires
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    git \
    curl \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

# Configuration de l'environnement de travail
WORKDIR /workspace

# Installation des dépendances globales
RUN npm install -g npm@latest

# Copie des fichiers de configuration
COPY ../.eslintrc.json /workspace/.eslintrc.json
COPY ../package*.json /workspace/

# Configuration des permissions
RUN chown -R node:node /workspace

USER node
