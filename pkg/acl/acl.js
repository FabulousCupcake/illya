const { ownerDiscordId, vanillaMembersRoleId, vanillaLeadsRoleId } = require("../config/config");
const { isPilot } = require("../redis/redis");

const isCalledByOwner = interaction => {
    if (interaction.user.id == ownerDiscordId) return true;

    return false;
}

const isCalledByClanMember = interaction => {
    return interaction.member.roles.cache.has(vanillaMembersRoleId);
}

const isCalledByClanAdmin = interaction => {
    return interaction.member.roles.cache.has(vanillaLeadsRoleId);
}

const isCalledByPilot = async (interaction) => {
    const id = interaction.user.id;
    return await isPilot(id);
}

const targetIsCaller = (interaction, argumentName) => {
    const targetUser = interaction.options.getUser(argumentName);

    // If target is unspecified, allow it — it probably assumes target is caller.
    if (!targetUser) return true;

    const callerUser = interaction.user;
    return targetUser.id === callerUser.id;
}

module.exports = {
    isCalledByOwner,
    isCalledByClanMember,
    isCalledByClanAdmin,
    isCalledByPilot,
    targetIsCaller,
}