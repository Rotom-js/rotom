const { Command } = require('discord.js-commando');
const path = require('path');

module.exports = class DexReloadCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'dexreload',
			memberName: 'dexreload',
			group: 'bot',
			description: 'Reload the dex.',
			ownerOnly: true,
		});
	}

	run(msg) {
		const Dex = require(path.resolve('./src/dex'));
		msg.client.dex = new Dex(path.resolve('./assets/data'));
		return msg.say('Reloaded dex and data files!');
	}
};
