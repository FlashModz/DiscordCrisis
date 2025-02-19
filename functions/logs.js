async function sendProgressMessage(guild, action, specificChannel = null) {
  console.log(`\n[DEBUG] Démarrage de l'opération: ${action}`);
  try {
    let channel;
    
    if (specificChannel) {
      // Utiliser le canal spécifique s'il est fourni
      channel = typeof specificChannel === 'string' 
        ? guild.channels.cache.get(specificChannel) || guild.channels.cache.find(c => c.name === specificChannel)
        : specificChannel;
        
      if (!channel) {
        console.log('[DEBUG] Canal spécifié non trouvé, recherche d\'un canal par défaut');
      }
    }
    
    // Si pas de canal spécifique ou non trouvé, utiliser la logique par défaut
    if (!channel) {
      channel = await guild.channels.fetch()
        .then(channels => channels.find(c => c.name === 'général' || c.name === 'general'));
    }
    
    if (!channel) {
      console.log('[DEBUG] Aucun canal trouvé pour les messages de progression');
      return null;
    }

    const msg = await channel.send(`🔄 **${action} en cours...** (0%)`);
    return {
      channelId: channel.id,
      messageId: msg.id,
      message: msg
    };
  } catch (error) {
    console.error('[DEBUG] Erreur envoi message de progression:', error);
    return null;
  }
}

async function updateProgress(msgData, progress, details = '') {
  if (!msgData) return;
  const logMessage = `[Progression] ${progress}% - ${details}`;
  console.log(logMessage);
  
  try {
    // Fetch the channel and message again to ensure they're cached
    const channel = await msgData.message.client.channels.fetch(msgData.channelId);
    if (!channel) {
      console.error('[DEBUG] Channel not found for progress update');
      return;
    }

    const message = await channel.messages.fetch(msgData.messageId);
    if (!message) {
      console.error('[DEBUG] Message not found for progress update');
      return;
    }

    await message.edit(`🔄 **Opération en cours...** (${progress}%)${details ? `\n${details}` : ''}`);
  } catch (error) {
    console.error('[DEBUG] Erreur mise à jour progression:', error);
  }
}

async function finishProgress(msgData, success = true) {
  if (!msgData) return;
  try {
    const channel = await msgData.message.client.channels.fetch(msgData.channelId);
    if (!channel) return;

    const message = await channel.messages.fetch(msgData.messageId);
    if (!message) return;

    await message.edit(success ? 
      '✅ **Opération terminée avec succès !**' :
      '❌ **Une erreur est survenue pendant l\'opération**'
    );
  } catch (error) {
    console.error('[DEBUG] Erreur finalisation progression:', error);
  }
}

async function sendProgressToLogs(logsChannel, message, error = false, immediate = false) {
  if (!logsChannel) return;
  try {
    // Ne pas ajouter de préfixe si le message commence par certains caractères spéciaux
    const skipPrefix = message.startsWith('```') || 
                      message.startsWith('🚨') || 
                      message.startsWith('\n') ||
                      message.startsWith('•');
    
    const prefix = skipPrefix ? '' : (error ? '❌' : '📝');
    const formattedMessage = skipPrefix ? message : `${prefix} ${message}`;
    
    if (immediate) {
      await logsChannel.send(formattedMessage);
    } else {
      if (!logsChannel.messageBuffer) {
        logsChannel.messageBuffer = [];
      }
      logsChannel.messageBuffer.push(formattedMessage);
    }
  } catch (error) {
    console.error('[DEBUG] Erreur envoi message logs:', error);
  }
}

module.exports = {
  sendProgressMessage,
  updateProgress,
  finishProgress,
  sendProgressToLogs
};
