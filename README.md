# 🚨 DiscordCrisis

![Discord.js Version](https://img.shields.io/badge/discord.js-v14-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D16.9.0-brightgreen.svg)

> Un outil de gestion de crise pour les administrateurs Discord permettant de gérer rapidement des situations d'urgence sur leurs serveurs.

## 📋 Fonctionnalités

- 🔒 Verrouillage rapide de tous les canaux
- 👥 Gestion des rôles en masse
- 📢 Diffusion de messages d'urgence
- 🛠️ Interface en ligne de commande intuitive

## 🚀 Installation

1. Clonez le dépôt :
```bash
git clone https://github.com/votre-username/DiscordCrisis.git
cd DiscordCrisis
```

2. Installez les dépendances :
```bash
npm install
```

3. Configurez votre fichier `.env` :
```env
DISCORD_TOKEN=votre_token_discord
```

## 💻 Utilisation

Démarrez l'application :
```bash
node index.js
```

Suivez le menu interactif pour :
- Verrouiller/déverrouiller les canaux
- Gérer les permissions des rôles
- Envoyer des messages d'urgence

## ⚙️ Configuration requise

- Node.js 16.9.0 ou supérieur
- Un bot Discord avec les permissions appropriées
- Les intentions Discord suivantes activées :
  - Guilds
  - Guild Members
  - Guild Messages
  - Message Content
  - Guild Webhooks

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche (`git checkout -b feature/amelioration`)
3. Commit vos changements (`git commit -am 'Ajout d'une fonctionnalité'`)
4. Push vers la branche (`git push origin feature/amelioration`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## ⚠️ Avertissement

Cet outil est puissant et doit être utilisé avec précaution. Assurez-vous d'avoir les autorisations nécessaires avant d'utiliser ces fonctionnalités sur un serveur Discord.