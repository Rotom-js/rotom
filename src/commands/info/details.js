const { Command } = require('discord.js-commando');

module.exports = class DetailsCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'details',
			memberName: 'details',
			aliases: ['dex', 'data', 'dt', 'pokemon', 'move', 'ability', 'item', 'weak'],
			description: 'Get additional details on this pokemon/item/move/ability/nature.',
			format: 'details [pokemon/item/move/ability]',
			clientPermissions: ['EMBED_LINKS'],
			group: 'info',
			args: [
				{
					key: 'key',
					name: 'pokemon/item/move/ability',
					prompt: 'What pokemon/item/move/ability would you like to get details for?',
					type: 'string'
				}
			]
		});
	}

	run(msg, { key }) {
		const { dex } = msg.client;
		const data = dex.dexLookup(dex.toId(key));
		msg.channel.send(data ? dex.generateEmbed(data) : `Could not find details for \`${key}\`!`);
	}
};
