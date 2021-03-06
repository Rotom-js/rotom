const { Command } = require('discord.js-commando');

module.exports = class SayCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'say',
			memberName: 'say',
			group: 'bot',
			description: 'Make the bot say the text you provide.',
			ownerOnly: true,
			format: '<Text>',
			args: [
				{
					key: 'str',
					prompt: 'What would you like the bot to say?',
					type: 'string'
				}
			]
		});
	}

	run(msg, { str }) {
		msg.say(str).then(() => {
			console.log(`${msg.author.tag} used say command`);
		});
	}
};
