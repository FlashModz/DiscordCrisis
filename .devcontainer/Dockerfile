FROM mcr.microsoft.com/devcontainers/javascript-node:18

# Installation des dépendances système supplémentaires
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    git \
    curl \
    sudo \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

# Configuration de l'environnement de travail
WORKDIR /workspace

# Création des répertoires nécessaires
RUN mkdir -p /workspaces/.codespaces/.persistedshare \
    && chown -R node:node /workspaces

# Installation des dépendances globales
RUN npm install -g npm@latest

# Copie des fichiers de configuration
COPY ../.eslintrc.json /workspace/.eslintrc.json
COPY ../package*.json /workspace/

# Configuration des permissions
RUN echo "node ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/node \
    && chmod 0440 /etc/sudoers.d/node

USER node
