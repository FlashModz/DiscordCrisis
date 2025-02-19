const { selectGuild } = require('./utils');

async function listRoles(client, rl, callback) {
  const guild = await selectGuild(client, rl);
  if (!guild) return callback(client, rl);

  console.log('\nRoles in server:', guild.name);
  guild.roles.cache.forEach(role => {
    console.log(`${role.name}: ${role.id}`);
  });
  callback(client, rl);
}

module.exports = { listRoles };
