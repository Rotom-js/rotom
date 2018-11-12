const { Command } = require('discord.js-commando');

module.exports = class LearnCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'learn',
			memberName: 'learn',
			description: 'Check if a Pokemon can learn a move.',
			format: '<Pokemon>, <Move>',
			clientPermissions: ['EMBED_LINKS'],
			group: 'info',
			args: [
				{
					key: 'pokemon',
					name: 'pokemon',
					prompt: 'What pokemon would you like to test?',
					type: 'string'
				},
				{
					key: 'move',
					name: 'move',
					prompt: 'What move would you like to test for?',
					type: 'string'
				}
			]
		});
	}

	run(msg, { pokemon, move }) {
		const { dex } = msg.client;
		msg.say(dex.canLearn(pokemon, move, true));
	}
};
