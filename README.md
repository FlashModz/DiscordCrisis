# 🚨 DiscordCrisis

![Discord.js Version](https://img.shields.io/badge/discord.js-v14-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D16.9.0-brightgreen.svg)

> Un outil de gestion de crise pour les administrateurs Discord permettant de gérer rapidement des situations d'urgence sur leurs serveurs.

## 📋 Fonctionnalités

- 📊 **Gestion des Rôles**
  - Liste complète des rôles d'un serveur
  - Attribution de rôles aux utilisateurs
  - Promotion rapide d'un rôle en administrateur

- 💾 **Système de Sauvegarde**
  - Backup complète d'un serveur Discord
  - Restauration des données sauvegardées

## 🚀 Installation

1. Clonez le dépôt :
```bash
git clone https://github.com/FlashModz/DiscordCrisis.git
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

Menu interactif disponible :
1. Lister tous les rôles
2. Assigner un rôle à un utilisateur
3. Donner les droits administrateur à un rôle
4. Sauvegarder le serveur
5. Restaurer le serveur
6. Quitter

## ⚙️ Configuration requise

- Node.js 16.9.0 ou supérieur
- Token de bot Discord
- Intentions Discord requises :
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

Cet outil permet de modifier les permissions administrateur et la structure du serveur. Utilisez-le avec précaution et uniquement si vous en avez l'autorisation.

## 🐛 Issues Connues

Avant d'utiliser l'outil, veuillez consulter nos [issues ouvertes](https://github.com/FlashModz/DiscordCrisis/issues) pour connaître :
- Les bugs connus actuels
- Les limitations temporaires
- Les fonctionnalités en cours de développement
- Les problèmes de compatibilité

Si vous rencontrez un problème qui n'est pas listé, n'hésitez pas à [ouvrir une nouvelle issue](https://github.com/FlashModz/DiscordCrisis/issues/new).

## 🤝 Support et Contribution

Pour signaler des bugs ou proposer des améliorations, n'hésitez pas à ouvrir une issue sur GitHub.