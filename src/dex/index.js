const path = require('path');
const Matcher = require('did-you-mean');
const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');

const hexes = {
	Red: '#ff0000',
	Blue: '#4169E1',
	Yellow: '#e5e500',
	Green: '#00ff00',
	Black: '#000000',
	Brown: '#8b4513',
	Purple: '#551a8b',
	Gray: '#808080',
	White: '#ffffff',
	Pink: '#ffc0cb',
};

module.exports = class Dex {
	constructor(datadir) {
		this.datadir = datadir;

		this.abilities	= require(path.join(datadir, './abilities.js')).BattleAbilities;
		this.aliases	= require(path.join(datadir, './aliases.js')).BattleAliases;
		this.items		= require(path.join(datadir, './items.js')).BattleItems;
		this.learnsets	= require(path.join(datadir, './learnsets.js')).BattleLearnsets;
		this.moves		= require(path.join(datadir, './moves.js')).BattleMovedex;
		this.pokemon	= require(path.join(datadir, './pokedex.js')).BattlePokedex;
		this.typechart	= require(path.join(datadir, './typechart.js')).BattleTypeChart;

		this.data = {
			'pokemon'	: this.pokemon,
			'item'		: this.items,
			'move'		: this.moves,
			'ability'	: this.abilities,
		};
	}

	// Getters for each data array
	getAbility(Ability) {
		return this.abilities[Ability];
	}
	getAlias(Alias) {
		return this.aliases[Alias];
	}
	getItem(Item) {
		return this.items[Item];
	}
	getLearnset(Learnset) {
		return this.learnsets[Learnset];
	}
	getMove(Move) {
		return this.moves[Move];
	}
	getPokemon(Pokemon) {
		return this.pokemon[Pokemon];
	}
	getTypeChart(TypeChart) {
		return this.typechart[TypeChart];
	}

	dexLookup(lookup) {
		let lookupVal = this.getDataWhere(lookup);
		if (lookupVal) return lookupVal;

		lookupVal = this.getDataWhere(lookup, 3);
		if (lookupVal) return lookupVal;

		return false;
	}

	getDataWhere(key, match = false) {
		if (match) {
			const m = new Matcher(Object.keys(this.aliases).join(' '));
			m.setThreshold(match);
			if (m.get(key)) {
				key = this.toId(m.get(key));
				match = false;
			}
		}
		else if (this.aliases.hasOwnProperty(key)) { key = this.toId(this.aliases[key]); }
		for (const [type, data] of Object.entries(this.data)) {
			if (type === 'pokemon') {
				if (key.startsWith('mega') && key !== 'meganium') key = key.substr(4) + 'mega';
				if (key.startsWith('primal')) key = key.substr(4) + 'primal';
			}
			if (!match) {
				if (data[key]) return [type, key, data[key], false];
			}
			else {
				const m = new Matcher(Object.keys(data).join(' '));
				m.setThreshold(match);
				const matched = m.get(key);
				if (data[matched]) return [type, matched, data[matched], true];
			}
		}

		return false;
	}

	// Data should be in format [type, key, val, ?matched]
	generateEmbed(data) {
		switch (data[0]) {
		case 'pokemon':
			return this.generatePokemonEmbed(data);
		case 'item':
			return this.generateItemEmbed(data);
		case 'move':
			return this.generateMoveEmbed(data);
		case 'ability':
			return this.generateAbilityEmbed(data);
		}
	}

	generatePokemonEmbed(data) {
		const [,, pokemon] = data;
		const weakchart = Object.entries(this.weak(pokemon));

		return new MessageEmbed()
			.setAuthor(`No. ${this.getNumPretty(pokemon.num)}: ${pokemon.species}`, this.getPokemonIcon(pokemon))
			.setColor(hexes[pokemon.color])
			.setThumbnail(this.getPokemonAni(pokemon))
			.addField('Stats',
				stripIndents`**HP:** ${pokemon.baseStats.hp}
				**Atk:** ${pokemon.baseStats.atk}
				**Def:** ${pokemon.baseStats.def}
				**Spa:** ${pokemon.baseStats.spa}
				**Spd:** ${pokemon.baseStats.spd}
				**Spe:** ${pokemon.baseStats.spe}
				**BST:** ${Object.values(pokemon.baseStats).reduce((a, b) => a + b)}`,
				false)
			.addField('Types', pokemon.types.join(', '), true)
			.addField('Abilities', Object.values(pokemon.abilities).join(', '), true)
			.addField('Weakness', weakchart.filter(e => e[1] > 1).map(e => `${e[0]} - ${e[1]}x`).join('\n'), true)
			.addField('Resistance', weakchart.filter(e => e[1] < 1).map(e => `${e[0]} - ${e[1]}x`).join('\n'), true);
	}
	generateItemEmbed(data) {
		const [,, item] = data;
		return new MessageEmbed()
			.setAuthor(item.name, this.getItemImg(item))
			.setDescription(item.desc ? item.desc : item.shortDesc)
			.setThumbnail(this.getItemImg(item));
	}
	generateMoveEmbed(data) {
		const [,, move] = data;
		const details = {
			'Priority': move.priority,
			'Gen': move.gen || 'CAP',
		};

		if (move.secondary || move.secondaries) details['Secondary effect'] = '';
		if (move.flags['contact']) details['Contact'] = '';
		if (move.flags['sound']) details['Sound'] = '';
		if (move.flags['bullet']) details['Bullet'] = '';
		if (move.flags['pulse']) details['Pulse'] = '';
		if (!move.flags['protect'] && !/(ally|self)/i.test(move.target)) details['Bypasses Protect'] = '';
		if (move.flags['authentic']) details['Bypasses Substitutes'] = '';
		if (move.flags['defrost']) details['Thaws user'] = '';
		if (move.flags['bite']) details['Bite'] = '';
		if (move.flags['punch']) details['Punch'] = '';
		if (move.flags['powder']) details['Powder'] = '';
		if (move.flags['reflectable']) details['Bounceable'] = '';
		if (move.flags['gravity']) details['Suppressed by Gravity'] = '';

		if (move.zMovePower) {
			details['Z-Power'] = move.zMovePower;
		}
		else if (move.zMoveEffect) {
			details['Z-Effect'] = {
				'clearnegativeboost': 'Restores negative stat stages to 0',
				'crit2': 'Crit ratio +2',
				'heal': 'Restores HP 100%',
				'curse': 'Restores HP 100% if user is Ghost type, otherwise Attack +1',
				'redirect': 'Redirects opposing attacks to user',
				'healreplacement': 'Restores replacement\'s HP 100%',
			}[move.zMoveEffect];
		}
		else if (move.zMoveBoost) {
			details['Z-Effect'] = '';
			const boost = move.zMoveBoost;
			const stats = { atk: 'Attack', def: 'Defense', spa: 'Sp. Atk', spd: 'Sp. Def', spe: 'Speed', accuracy: 'Accuracy', evasion: 'Evasiveness' };
			for (const i in boost) {
				details['Z-Effect'] += ' ' + stats[i] + ' +' + boost[i];
			}
		}
		else {
			details['Z-Effect'] = 'None';
		}

		details['Target'] = {
			'normal': 'One Adjacent Pokmon',
			'self': 'User',
			'adjacentAlly': 'One Ally',
			'adjacentAllyOrSelf': 'User or Ally',
			'adjacentFoe': 'One Adjacent Opposing Pokmon',
			'allAdjacentFoes': 'All Adjacent Opponents',
			'foeSide': 'Opposing Side',
			'allySide': 'User\'s Side',
			'allyTeam': 'User\'s Side',
			'allAdjacent': 'All Adjacent Pokmon',
			'any': 'Any Pokmon',
			'all': 'All Pokmon',
		}[move.target] || 'Unknown';

		if (move.id === 'mirrormove') {
			details['https://pokemonshowdown.com/dex/moves/mirrormove'] = '';
		}

		const { dtext, ptext } = this.dtextrender(details);

		console.log(dtext);

		return new MessageEmbed()
			.setAuthor(move.name)
			.setDescription(stripIndents`
        ${move.desc}`)
			.addField('Info', stripIndents`
        **Type:** ${move.type}
        **Category:** ${move.category}
        **Base Power:** ${move.hasOwnProperty('basePower') ? move.basePower : 'N/A'}
        ${dtext}`, true)
			.addField('Properties', ptext ? ptext : 'No special properties', true);
	}
	generateAbilityEmbed(data) {
		const [,, ability] = data;
		return new MessageEmbed()
			.setAuthor(ability.name)
			.setDescription(ability.desc ? ability.desc : ability.shortDesc);
	}

	getPokemonIcon(pk) {
		let url = 'https://www.serebii.net/pokedex-sm/icon/';
		url += this.getNumPretty(pk.num);
		if (pk.formeLetter) {
			let formeData = pk.formeLetter.toLowerCase();
			if (pk.forme === '10%') formeData = '10';
			if (pk.baseSpecies === 'Arceus') formeData = null;
			if (formeData) url += `-${formeData}`;
		}
		url += '.png';
		return url;
	}

	getPokemonAni(pk) {
		let url = 'http://play.pokemonshowdown.com/sprites/xyani/';
		url += this.toId(pk.species);
		if (pk.formeLetter) url += '-' + this.toId(pk.forme);
		url += '.gif';
		return url;
	}

	getItemImg(item) {
		let url = 'https://www.serebii.net/itemdex/sprites/pgl/';
		url += this.toId(item.name);
		url += '.png';
		return url;
	}

	getNumPretty(num) {
		num = num.toString();
		while (num.length < 3) {
			num = '0' + num;
		}
		return num;
	}

	weak(pokemon) {
		const types = Object.keys(this.typechart);
		const weakChart = {
			pokemon: pokemon.species,
			'Bug': 1,
			'Dark': 1,
			'Dragon': 1,
			'Electric': 1,
			'Fairy': 1,
			'Fighting': 1,
			'Fire': 1,
			'Flying': 1,
			'Ghost': 1,
			'Grass': 1,
			'Ground': 1,
			'Ice': 1,
			'Normal': 1,
			'Poison': 1,
			'Psychic': 1,
			'Rock': 1,
			'Steel': 1,
			'Water': 1,
		};

		for (let i = 0; i < pokemon.types.length; i++) {
			const current = this.typechart[pokemon.types[i]];
			for (let x = 0; x < types.length; x++) {
				const dmg = weakChart[types[x]];
				switch (current.damageTaken[types[x]]) {
				case 3:
					weakChart[types[x]] = 0;
					break;
				case 2:
					weakChart[types[x]] = dmg / 2;
					break;
				case 1:
					weakChart[types[x]] = dmg * 2;
					break;
				}
			}
		}
		return weakChart;
	}

	dtextrender(data) {
		const keys = Object.keys(data),
			length = keys.length;

		let dtext = '';
		let ptext = '';

		for (let i = 0; i < length; i++) {
			const curKey = keys[i];

			if (data[curKey] === '') {
				ptext += `**✓** ${curKey}\n`;
			}
			else {
				dtext += `**${curKey}:** ${data[curKey]}\n`;
			}

		}

		return { dtext: dtext, ptext: ptext };
	}

	// Copied from Pokémon Showdown sim/dex-data.js because every key in the data files is an id.
	toId(text) {
		if (text && text.id) {
			text = text.id;
		}
		else if (text && text.userid) {
			text = text.userid;
		}
		if (typeof text !== 'string' && typeof text !== 'number') return '';
		return ('' + text).toLowerCase().replace(/[^a-z0-9]+/g, '');
	}
};