const { Command } = require('discord.js-commando');
const stats = ['atk', 'def', 'spa', 'spd', 'spe'];

module.exports = class NatureCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'nature',
			memberName: 'nature',
			description: 'Find the nature given the boosted and hindered stat.',
			format: 'nature <Boosted Stat> <Lowered Stat>',
			clientPermissions: ['EMBED_LINKS'],
			group: 'info',
			args: [
				{
					key: 'plus',
					name: 'boost',
					prompt: 'What stat is boosted by the nature?',
					type: 'string',
					validate: (stat) => stats.includes(stat.toLowerCase())
				},
				{
					key: 'minus',
					name: 'lower',
					prompt: 'What stat is lowered by the nature?',
					type: 'string',
					default: '',
					validate: (stat) => stats.includes(stat.toLowerCase())
				}
			]
		});
	}

	run(msg, { plus, minus }) {
		const { dex } = msg.client;
		const nature = Object.values(dex.natures).find(e => e.plus === dex.toId(plus) && e.minus === dex.toId(minus));
		msg.say(dex.generateNatureEmbed(['nature', dex.toId(nature.name), nature]));
	}
};
