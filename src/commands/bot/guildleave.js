const { Command } = require('rotom-commando');

module.exports = class GuildLeaveCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'guildleave',
			memberName: 'guildleave',
			aliases: ['gleave', 'gl'],
			group: 'bot',
			description: 'Make the bot leave the guild with the provided ID.',
			ownerOnly: true,
			args: [
				{
					key: 'guild',
					prompt: 'What is the ID of the guild you want the bot to leave?',
					type: 'string',
					validate: text => text.match(/\d{18}/).length > 0
				}
			]
		});
	}

	async run(msg, { guild }) {
		guild = guild.match(/\d{18}/)[0];
		if (!msg.client.guilds.has(guild)) return msg.say(`Could not find a guild with ID ${guild}!`);
		const g = msg.client.guilds.get(guild);
		try {
			g.leave();
			msg.say(`Successfully left ${guild.name}!`);
		}
		catch(e) {
			msg.say(`Error leaving ${guild.name}!`);
		}
	}
};