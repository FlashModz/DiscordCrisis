const fs = require('fs').promises;
const path = require('path');
const { selectGuild, sleep, withRetry } = require('./utils');
const { showMenu } = require('./menu');
const { createLogsChannel, createFollowChannel } = require('./channels');
const { sendProgressMessage, updateProgress, finishProgress, sendProgressToLogs } = require('./logs');
const { mapPermissionOverwrites } = require('./permissions');

async function batchSendLogs(logsChannel, messages, batchSize = 5) {
  if (!logsChannel || messages.length === 0) return;
  try {
    const chunks = [];
    for (let i = 0; i < messages.length; i += batchSize) {
      chunks.push(messages.slice(i, Math.min(i + batchSize, messages.length)));
    }

    for (const chunk of chunks) {
      const content = chunk.join('\n');
      if (content.trim()) {
        await logsChannel.send(content);
        await sleep(2000);
      }
    }
  } catch (error) {
    console.error('[DEBUG] Erreur envoi batch logs:', error);
    for (const msg of messages) {
      try {
        await logsChannel.send(msg);
        await sleep(1000);
      } catch (e) {
        console.error('[DEBUG] Échec envoi message individuel:', e);
      }
    }
  }
}

async function flushLogsBuffer(logsChannel) {
  if (logsChannel?.messageBuffer?.length > 0) {
    const messagesToSend = [...logsChannel.messageBuffer];
    logsChannel.messageBuffer = [];
    await batchSendLogs(logsChannel, messagesToSend);
  }
}

async function handleRateLimit(error) {
  if (error.code === 429) {
    const retryAfter = error.retry_after || 5000;
    console.log(`[DEBUG] Rate limit atteint, attente de ${retryAfter}ms`);
    await sleep(retryAfter);
    return true;
  }
  return false;
}

async function cleanupGuild(guild, logsChannel, progressMsg, followChannel) {
  await sendProgressToLogs(logsChannel, '🧹 **Début du nettoyage du serveur**', false, true);

  // Liste des canaux protégés
  const protectedChannels = new Set([
    'rules',           // Canal des règles Discord
    'community'       // Canal communautaire Discord
  ]);

  // Liste des IDs de canaux à préserver
  const preservedChannelIds = new Set([
    logsChannel?.id,
    followChannel?.id,
    guild.rulesChannelId,
    guild.publicUpdatesChannelId,
    guild.systemChannelId
  ].filter(Boolean)); // Filtre les valeurs null/undefined

  // Nettoyage des canaux
  await sendProgressToLogs(logsChannel, '⏳ Suppression des canaux existants...');
  const existingChannels = guild.channels.cache.filter(channel => 
    channel.deletable && 
    !protectedChannels.has(channel.name) &&
    !preservedChannelIds.has(channel.id)
  );

  await sendProgressToLogs(logsChannel, `📊 Canaux à supprimer: ${existingChannels.size}`);
  await sendProgressToLogs(logsChannel, `🛡️ Canaux protégés: ${protectedChannels.size + preservedChannelIds.size}`);

  let deletedChannels = 0;
  for (const channel of existingChannels.values()) {
    try {
      await withRetry(async () => {
        await channel.delete('Nettoyage pour restauration');
        deletedChannels++;
        if (deletedChannels % 5 === 0) {
          await updateProgress(progressMsg, 5, `Suppression des canaux (${deletedChannels}/${existingChannels.size})`);
        }
      });
      
      await sleep(1500);
    } catch (error) {
      await sendProgressToLogs(logsChannel, `❌ Erreur suppression canal ${channel.name}: ${error.message}`);
    }
  }

  // Nettoyage des rôles
  await sendProgressToLogs(logsChannel, '\n🧹 **Nettoyage des rôles**');
  const existingRoles = guild.roles.cache.filter(role => 
    role.editable && 
    !role.managed && 
    role.name !== '@everyone'
  );

  await sendProgressToLogs(logsChannel, `📊 Rôles à supprimer: ${existingRoles.size}`);
  let deletedRoles = 0;

  for (const role of existingRoles.values()) {
    try {
      await withRetry(async () => {
        await role.delete('Nettoyage pour restauration');
        deletedRoles++;
        if (deletedRoles % 5 === 0) {
          await updateProgress(progressMsg, 10, `Suppression des rôles (${deletedRoles}/${existingRoles.size})`);
        }
      });
      
      await sleep(3000);
    } catch (error) {
      await sendProgressToLogs(logsChannel, `❌ Erreur suppression rôle ${role.name}: ${error.message}`);
    }
  }

  await sendProgressToLogs(logsChannel, '\n✅ **Résumé du nettoyage:**');
  await sendProgressToLogs(logsChannel, `- Canaux supprimés: ${deletedChannels}/${existingChannels.size}`);
  await sendProgressToLogs(logsChannel, `- Rôles supprimés: ${deletedRoles}/${existingRoles.size}`);
}

async function restoreGuild(client, rl, callback) {
  console.log('\n[DEBUG] Démarrage de la restauration...');
  try {
    const backupPath = path.join(__dirname, '..', 'backups');
    const files = await fs.readdir(backupPath);
    
    if (files.length === 0) {
      console.log('No backups found!');
      return callback(client, rl);
    }

    console.log('\nAvailable backups:');
    files.forEach((file, index) => {
      console.log(`${index + 1}. ${file}`);
    });

    rl.question('\nSelect backup number to restore: ', async (answer) => {
      const fileIndex = parseInt(answer) - 1;
      if (fileIndex < 0 || fileIndex >= files.length) {
        console.log('Invalid backup number');
        return callback(client, rl);
      }

      const backup = JSON.parse(
        await fs.readFile(path.join(backupPath, files[fileIndex]), 'utf-8')
      );

      const targetGuild = await selectGuild(client, rl);
      if (!targetGuild) return callback(client, rl);

      const logsChannel = await createLogsChannel(targetGuild);
      const followChannel = await createFollowChannel(targetGuild).catch(() => null);

      rl.question('\nRestore messages? (y/n): ', async (restoreMessages) => {
        rl.question('\nEnter User ID to give administrative rights (or press Enter to skip): ', async (adminUserId) => {
          const progressMsg = await sendProgressMessage(targetGuild, 'Restauration', followChannel || logsChannel);

          try {
            // Message d'introduction dans le canal de logs
            await sendProgressToLogs(logsChannel, '**Début de la restauration**', false, true);
            await sendProgressToLogs(logsChannel, `Serveur cible: ${targetGuild.name}`, false, true);
            
            // Message d'avertissement dans le canal de logs
            const warningMessage = [
              '\n🚨 **== INFORMATION IMPORTANTE ==** 🚨',
              '```diff',
              '- ⚠️ PROCESSUS DE RESTAURATION EN COURS ⚠️',
              '```',
              '\n🕒 **Timing & Processus:**',
              '• La restauration peut prendre plusieurs minutes',
              '• Discord impose des limites strictes que nous devons respecter',
              '• Le bot ajuste automatiquement sa vitesse pour éviter les erreurs',
              '\n🛡️ **Sécurité & Fiabilité:**',
              '• Chaque action est vérifiée et sécurisée',
              '• En cas d\'erreur, le système réessaiera automatiquement',
              '• La progression est sauvegardée en temps réel',
              '\n💡 **Conseils:**',
              '• Ne fermez pas le programme pendant la restauration',
              `• La progression détaillée est disponible dans <#${followChannel?.id || logsChannel.id}>`,
              '• Certaines actions pourraient nécessiter une intervention manuelle',
              '\n```fix',
              '🎯 La restauration va commencer dans quelques secondes...',
              followChannel ? 
                `📌 Suivez la progression en direct dans <#${followChannel.id}>` :
                '📌 Suivez la progression dans ce canal',
              '```'
            ].join('\n');

            // Message dans le canal de progression
            const progressStartMessage = [
              '```ini',
              '[Suivi de la Restauration en Direct]',
              '```',
              '⏳ **Progression détaillée:**',
              '• Les étapes seront affichées ici en temps réel',
              '• Chaque action sera documentée avec son statut',
              `• En cas d\'erreur, les détails seront fournis dans <#${logsChannel?.id}>`,
              `\n📌 **Un Log complet de résultat sera générer dans <#${logsChannel?.id}> **`
            ].join('\n');

            // Envoi des messages
            await logsChannel.send(warningMessage);
            if (followChannel) {
              await followChannel.send(progressStartMessage);
            }
            await sleep(5000);

            // Vérification des permissions
            if (!targetGuild.members.me.permissions.has('Administrator')) {
              throw new Error('Le bot a besoin des permissions Administrateur');
            }

            // Étape 1: Nettoyage
            await cleanupGuild(targetGuild, logsChannel, progressMsg, followChannel);

            // Étape 2: Création des rôles
            await sendProgressToLogs(logsChannel, '\n🔄 **Création des rôles**');
            const roleMap = new Map();
            const rolesToCreate = backup.roles.sort((a, b) => b.position - a.position);
            
            await sendProgressToLogs(logsChannel, `📊 Rôles à créer: ${rolesToCreate.length}`);
            let createdRoles = 0;

            for (const roleData of rolesToCreate) {
              try {
                await withRetry(async () => {
                  const newRole = await targetGuild.roles.create({
                    name: roleData.name,
                    color: roleData.color,
                    hoist: roleData.hoist,
                    permissions: BigInt(roleData.permissions),
                    mentionable: roleData.mentionable,
                    position: roleData.position,
                    reason: 'Restauration de backup'
                  });

                  roleMap.set(roleData.position, newRole);
                  createdRoles++;
                  
                  if (createdRoles % 5 === 0) {
                    await updateProgress(progressMsg, 30 + (createdRoles / rolesToCreate.length * 20),
                      `Création des rôles (${createdRoles}/${rolesToCreate.length})`);
                  }
                  
                  await sendProgressToLogs(logsChannel, `✅ Rôle créé: ${newRole.name}`);
                });
                
                await sleep(3000); // Délai plus long pour les rôles
              } catch (error) {
                await sendProgressToLogs(logsChannel, `❌ Erreur création rôle ${roleData.name}: ${error.message}`);
              }
            }

            // Étape 3: Création des catégories
            await sendProgressToLogs(logsChannel, '\n🔄 **Création des catégories**');
            const categories = backup.channels.filter(ch => ch.type === 4);
            const categoryMap = new Map();
            
            await sendProgressToLogs(logsChannel, `📊 Catégories à créer: ${categories.length}`);
            let createdCategories = 0;

            for (const categoryData of categories) {
                await progressMsg.message.edit(`🔄 **Création des catégories** (${createdCategories}/${categories.length})`);
              try {
                await sleep(1500);
                const category = await targetGuild.channels.create({
                  name: categoryData.name,
                  type: 4,
                  permissionOverwrites: mapPermissionOverwrites(categoryData.permissionOverwrites, roleMap, targetGuild)
                });

                categoryMap.set(categoryData.name, category.id);
                createdCategories++;
                await sendProgressToLogs(logsChannel, `✅ Catégorie créée: ${category.name}`);
              } catch (error) {
                await sendProgressToLogs(logsChannel, `❌ Erreur création catégorie ${categoryData.name}: ${error.message}`);
              }
            }

            // Étape 4: Création des canaux
            await sendProgressToLogs(logsChannel, '\n🔄 **Création des canaux**');
            const channels = backup.channels.filter(ch => ch.type !== 4);
            
            await sendProgressToLogs(logsChannel, `📊 Canaux à créer: ${channels.length}`);
            let createdChannels = 0;

            for (const channelData of channels) {
                await progressMsg.message.edit(`🔄 **Création des canaux** (${createdChannels}/${channels.length})`);
              try {
                await sleep(2000);
                const channelOptions = {
                  name: channelData.name,
                  type: channelData.type,
                  permissionOverwrites: mapPermissionOverwrites(channelData.permissionOverwrites, roleMap, targetGuild)
                };

                if (channelData.parent) {
                  channelOptions.parent = categoryMap.get(channelData.parent);
                }

                const channel = await targetGuild.channels.create(channelOptions);
                createdChannels++;
                await sendProgressToLogs(logsChannel, `✅ Canal créé: ${channel.name}`);
              } catch (error) {
                await sendProgressToLogs(logsChannel, `❌ Erreur création canal ${channelData.name}: ${error.message}`);
              }
            }

            // Rapport final
            await sendProgressToLogs(logsChannel, '\n📊 **Résumé de la restauration:**', false, true);
            await sendProgressToLogs(logsChannel, `- Rôles créés: ${createdRoles}/${rolesToCreate.length}`, false, true);
            await sendProgressToLogs(logsChannel, `- Catégories créées: ${createdCategories}/${categories.length}`, false, true);
            await sendProgressToLogs(logsChannel, `- Canaux créés: ${createdChannels}/${channels.length}`, false, true);

            await flushLogsBuffer(logsChannel);
            await finishProgress(progressMsg, true);
            await sendProgressToLogs(logsChannel, '✅ **Restauration terminée avec succès !**', false, true);

          } catch (error) {
            console.error('[DEBUG] Erreur critique pendant la restauration:', error);
            await finishProgress(progressMsg, false);
            await sendProgressToLogs(logsChannel, `❌ **Erreur**: ${error.message}`, true, true);
          }
          callback(client, rl);
        });
      });
    });
  } catch (error) {
    console.error('[DEBUG] Erreur pendant la restauration:', error);
    callback(client, rl);
  }
}

module.exports = { restoreGuild };
