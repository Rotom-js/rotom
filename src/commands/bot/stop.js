const { Command } = require('discord.js-commando');
const process = require('process');

module.exports = class StopCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'stop',
			memberName: 'stop',
			group: 'bot',
			description: 'Stop the bot process.',
			ownerOnly: true,
		});
	}

	async run(msg) {
		await msg.say('Stopping process...');
		process.exit();
	}
};
