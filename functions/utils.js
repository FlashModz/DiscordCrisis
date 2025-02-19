const readline = require('readline');

function initReadline() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

async function selectGuild(client, rl) {  // Added rl parameter
  const guilds = Array.from(client.guilds.cache.values());
  
  if (guilds.length === 0) {
    console.log('No servers found!');
    return null;
  }

  if (guilds.length === 1) {
    return guilds[0];
  }

  console.log('\nAvailable servers:');
  guilds.forEach((guild, index) => {
    console.log(`${index + 1}. ${guild.name} (${guild.id})`);
  });

  return new Promise((resolve) => {
    rl.question('\nSelect server number: ', async (answer) => {
      const index = parseInt(answer) - 1;
      if (index < 0 || index >= guilds.length) {
        console.log('Invalid server number');
        resolve(null);
      } else {
        resolve(guilds[index]);
      }
    });
  });
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function sanitizeName(name) {
  return name.replace(/[\u200B-\u200D\uFEFF]/g, '');
}

async function withRetry(operation, maxRetries = 3, initialDelay = 1000) {
  let lastError;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (error.code === 429) { // Rate limit error
        const retryAfter = error.retry_after * 1000 || delay;
        console.log(`[Rate Limit] Tentative ${attempt}/${maxRetries}, attente de ${retryAfter}ms`);
        await sleep(retryAfter);
        delay *= 2; // Exponential backoff
      } else if (attempt === maxRetries) {
        throw error;
      } else {
        await sleep(delay);
        delay *= 2;
      }
    }
  }
  
  throw lastError;
}

module.exports = {
  initReadline,
  selectGuild,
  sleep,
  sanitizeName,
  withRetry
};
