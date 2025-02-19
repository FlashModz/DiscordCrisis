const { listRoles } = require('./roles');
const { assignRole, makeRoleAdmin } = require('./roleManager');
const { backupGuild } = require('./backup');
const { restoreGuild } = require('./restore');

function returnToMenu(client, rl) {
  showMenu(client, rl);
}

function showMenu(client, rl) {
  console.log('\n=== Discord Role Manager ===');
  console.log('1. List all roles');
  console.log('2. Assign role to user');
  console.log('3. Make role Administrator');
  console.log('4. Backup Guild');
  console.log('5. Restore Guild');
  console.log('6. Exit');
  console.log('========================');

  rl.question('Choose an option (1-6): ', async (answer) => {
    switch (answer) {
      case '1': await listRoles(client, rl, returnToMenu); break;
      case '2': await assignRole(client, rl, returnToMenu); break;
      case '3': await makeRoleAdmin(client, rl, returnToMenu); break;
      case '4': await backupGuild(client, rl, returnToMenu); break;
      case '5': await restoreGuild(client, rl, returnToMenu); break;
      case '6':
        rl.close();
        client.destroy();
        process.exit(0);
      default:
        console.log('Invalid option');
        showMenu(client, rl);
    }
  });
}

module.exports = { showMenu, returnToMenu };
