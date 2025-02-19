const { sleep } = require('./utils');

async function createLogsChannel(guild) {
  try {
    console.log('[DEBUG] Création du canal de logs...');
    return await guild.channels.create({
      name: 'backup-logs',
      type: 0,
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: BigInt(1 << 10),
        },
        {
          id: guild.members.me.id,
          allow: BigInt(1 << 10),
        }
      ]
    });
  } catch (error) {
    console.error('[DEBUG] Erreur création canal de logs:', error);
    return null;
  }
}

async function createFollowChannel(guild) {
  try {
    console.log('[DEBUG] Création du canal de suivi...');
    return await guild.channels.create({
      name: 'in-progress',
      type: 0,
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: BigInt(1 << 10),
        },
        {
          id: guild.members.me.id,
          allow: BigInt(1 << 10),
        }
      ]
    });
  } catch (error) {
    console.error('[DEBUG] Erreur création canal de suivi:', error);
    return null;
  }
}

async function createChannel(targetGuild, channelData, roleMap, categoryMap = null) {
  try {
    let channelType = channelData.type;
    if (![0, 2, 4, 5, 6, 13, 14, 15, 16].includes(channelType)) {
      channelType = channelType === 11 ? 0 : channelType === 13 ? 2 : 0;
    }

    const channelOptions = {
      name: channelData.name,
      type: channelType,
      permissionOverwrites: mapPermissionOverwrites(
        channelData.permissionOverwrites,
        roleMap,
        targetGuild
      )
    };

    if (categoryMap && channelData.parent) {
      channelOptions.parent = categoryMap.get(channelData.parent);
    }

    return await targetGuild.channels.create(channelOptions);
  } catch (error) {
    console.error(`[DEBUG] Erreur création canal ${channelData.name}:`, error);
    throw error;
  }
}

module.exports = {
  createLogsChannel,
  createFollowChannel,
  createChannel
};
