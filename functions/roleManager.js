const { selectGuild } = require('./utils');
const { showMenu } = require('./menu');

async function assignRole(client, rl, callback) {
  const guild = await selectGuild(client, rl);
  if (!guild) return callback(client, rl);

  rl.question('\nEnter user ID: ', async (userId) => {
    rl.question('Enter role ID: ', async (roleId) => {
      try {
        const member = await guild.members.fetch(userId);
        const role = guild.roles.cache.get(roleId);

        if (!role || !member) {
          console.log(!role ? 'Role not found!' : 'Member not found!');
          return callback(client, rl);
        }

        if (!guild.members.me.permissions.has('ManageRoles')) {
          console.log('Bot does not have permission to manage roles!');
          return callback(client, rl);
        }

        if (role.position >= guild.members.me.roles.highest.position) {
          console.log('Bot cannot assign a role higher than its own highest role!');
          return callback(client, rl);
        }

        await member.roles.add(role);
        console.log(`Successfully assigned role ${role.name} to user ${member.user.tag}`);
      } catch (error) {
        console.error('Error details:', error.message);
      }
      callback(client, rl);
    });
  });
}

async function makeRoleAdmin(client, rl, callback) {
  const guild = await selectGuild(client, rl);
  if (!guild) return callback(client, rl);

  rl.question('\nEnter role ID to make administrator: ', async (roleId) => {
    try {
      const role = guild.roles.cache.get(roleId);

      if (!role) {
        console.log('Role not found!');
        return callback(client, rl);
      }

      if (!guild.members.me.permissions.has('Administrator')) {
        console.log('Bot does not have Administrator permission!');
        return callback(client, rl);
      }

      await role.setPermissions(['Administrator']);
      console.log(`Successfully made role ${role.name} an Administrator`);
    } catch (error) {
      console.error('Error details:', error.message);
    }
    callback(client, rl);
  });
}

module.exports = { assignRole, makeRoleAdmin };
