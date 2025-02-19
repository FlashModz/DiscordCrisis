const fs = require('fs').promises;
const path = require('path');

async function fixBackup() {
    try {
        // Lire le fichier source
        const sourcePath = path.join(__dirname, 'backups', 'backup-1162551699165151332-1739676640334.json');
        const backup = JSON.parse(await fs.readFile(sourcePath, 'utf-8'));
        
        // Fonction pour corriger les permissions
        function fixPermissions(permissionArray) {
            return permissionArray.map(p => {
                // Convertir [object Object] en valeurs réelles
                if (p.allow && p.allow.toString() === '[object Object]') {
                    console.log(`Fixing invalid allow permission for ID ${p.id}`);
                    p.allow = "0";
                }
                if (p.deny && p.deny.toString() === '[object Object]') {
                    console.log(`Fixing invalid deny permission for ID ${p.id}`);
                    p.deny = "0";
                }

                // Assurer que les permissions sont des strings
                p.allow = p.allow?.toString() || "0";
                p.deny = p.deny?.toString() || "0";

                return {
                    id: p.id,
                    type: p.type || 0,
                    allow: p.allow,
                    deny: p.deny
                };
            });
        }

        // Corriger les permissions des catégories et canaux
        backup.channels = backup.channels.map(channel => {
            console.log(`Processing channel: ${channel.name}`);
            return {
                ...channel,
                permissionOverwrites: fixPermissions(channel.permissionOverwrites || [])
            };
        });

        // Corriger les permissions des rôles si nécessaire
        backup.roles = backup.roles.map(role => {
            console.log(`Processing role: ${role.name}`);
            return {
                ...role,
                permissions: role.permissions?.toString() || "0"
            };
        });

        // Sauvegarder le backup corrigé
        const fixedPath = path.join(__dirname, 'backups', 'fixed-backup.json');
        await fs.writeFile(fixedPath, JSON.stringify(backup, null, 2));
        console.log('Backup fixed and saved to fixed-backup.json');

    } catch (error) {
        console.error('Error fixing backup:', error);
    }
}

fixBackup();
