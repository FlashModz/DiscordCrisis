function safePermissionConversion(permission) {
  try {
    if (typeof permission === 'bigint') return permission;
    if (typeof permission === 'string' || typeof permission === 'number') {
      return BigInt(permission);
    }
    if (permission && typeof permission === 'object') {
      if (permission.toString() === '[object Object]') {
        return BigInt(0);
      }
      return BigInt(permission.toString());
    }
    return BigInt(0);
  } catch (error) {
    console.warn('Permission conversion failed:', error);
    return BigInt(0);
  }
}

function mapPermissionOverwrites(oldPermissions, roleMap, targetGuild) {
  const mappedPermissions = [];
  
  for (const p of oldPermissions) {
    try {
      if (p.id === targetGuild.id || p.roleName === 'everyone') {
        mappedPermissions.push({
          id: targetGuild.id,
          type: p.type,
          allow: BigInt(p.allow || "0"),
          deny: BigInt(p.deny || "0")
        });
        continue;
      }

      const matchingRole = Array.from(roleMap.values()).find(newRole => 
        newRole.name === p.roleName
      );

      if (matchingRole) {
        mappedPermissions.push({
          id: matchingRole.id,
          type: p.type,
          allow: BigInt(p.allow || "0"),
          deny: BigInt(p.deny || "0")
        });
      }
    } catch (error) {
      console.error(`[DEBUG] Erreur mapping permission:`, error);
    }
  }

  return mappedPermissions;
}

module.exports = {
  safePermissionConversion,
  mapPermissionOverwrites
};
