const fs = require('fs').promises;
const path = require('path');
const { selectGuild } = require('./utils');
const { showMenu } = require('./menu');
const { sendProgressMessage, updateProgress, finishProgress } = require('./logs');

async function backupGuild(client, rl, callback) {
  const guild = await selectGuild(client, rl);
  if (!guild) return callback(client, rl);

  const progressMsg = await sendProgressMessage(guild, 'Backup');
  
  try {
    const backup = {
      name: guild.name,
      guildId: guild.id,
      roles: [],
      channels: [],
      timestamp: new Date().toISOString()
    };

    // Backup roles
    await updateProgress(progressMsg, 20, 'Sauvegarde des rôles...');
    guild.roles.cache.forEach(role => {
      if (role.name !== '@everyone') {
        backup.roles.push({
          name: role.name,
          color: role.color,
          hoist: role.hoist,
          permissions: role.permissions.bitfield.toString(),
          mentionable: role.mentionable,
          position: role.position,
          id: role.id
        });
      }
    });

    // Backup channels
    await updateProgress(progressMsg, 40, 'Sauvegarde des catégories...');
    const categories = guild.channels.cache.filter(c => c.type === 4);
    for (const category of categories.values()) {
      backup.channels.push({
        name: category.name,
        type: category.type,
        position: category.position,
        permissionOverwrites: Array.from(category.permissionOverwrites.cache.values()).map(p => ({
          id: p.id,
          type: p.type,
          allow: p.allow.bitfield.toString(),
          deny: p.deny.bitfield.toString(),
          roleName: p.id === guild.id ? 'everyone' : guild.roles.cache.get(p.id)?.name
        }))
      });
    }

    // Backup other channels
    await updateProgress(progressMsg, 60, 'Sauvegarde des canaux...');
    const nonCategories = guild.channels.cache.filter(c => c.type !== 4);
    for (const channel of nonCategories.values()) {
      backup.channels.push({
        name: channel.name,
        type: channel.type,
        position: channel.position,
        parent: channel.parent?.name || null,
        permissionOverwrites: Array.from(channel.permissionOverwrites.cache.values()).map(p => ({
          id: p.id,
          type: p.type,
          allow: p.allow.bitfield.toString(),
          deny: p.deny.bitfield.toString(),
          roleName: p.id === guild.id ? 'everyone' : guild.roles.cache.get(p.id)?.name
        }))
      });
    }

    // Save backup file
    const backupPath = path.join(__dirname, '..', 'backups');
    await fs.mkdir(backupPath, { recursive: true });
    const backupFile = path.join(backupPath, `backup-${guild.id}-${Date.now()}.json`);
    await fs.writeFile(backupFile, JSON.stringify(backup, null, 2));

    await finishProgress(progressMsg);
  } catch (error) {
    console.error('Error during backup:', error);
    await finishProgress(progressMsg, false);
  }
  callback(client, rl);
}

module.exports = { backupGuild };
