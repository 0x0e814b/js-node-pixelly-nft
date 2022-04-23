const fs = require('fs');
const dir = __dirname;
const width = 1000;
const height = 1000;

const rarity = [
	{ key: "", val: 'common', chance: 0 },
	{ key: "_r", val: 'rare', chance: 20 },
	{ key: "_sr", val: 'super_rare', chance: 5 },
	{ key: "_ur", val: 'ultra_rare', chance: 1 },
]

const addRarity = (_str) => {
	let itemRarity;
	rarity.forEach( r => {
		if (_str.includes(r.key)) {
			itemRarity = r.val
		}
	});
	return itemRarity;
}

const cleanName = (_str) => {
	let name = _str.slice(0, -4);
	rarity.forEach( r => name = name.replace(r.key, ""));
	return name;
}

const getElements = (path) => {
	return fs
		.readdirSync(path)
		.filter(item => !/(^|\/)\.[^\/\.]/g.test(item))
		.map( (elemName, index) => {
			return {
				id: index+1,
				name: cleanName(elemName),
				fileName: elemName,
				rarity: addRarity(elemName)
			}
		});
};

const layers = [
	{
		layerName: 'background',
		location: `${dir}/background/`,
		elements: getElements(`${dir}/background/`),
		position: {x: 0, y: 0},
		size: { width, height }
	},
	{
		layerName: 'skin',
		location: `${dir}/skin/`,
		elements: getElements(`${dir}/skin/`),
		position: {x: 0, y: 0},
		size: { width, height }
	},
	{
		layerName: 'glove',
		location: `${dir}/glove/`,
		elements: getElements(`${dir}/glove/`),
		position: {x: 0, y: 0},
		size: { width, height }
	},
	{
		layerName: 'jelly',
		location: `${dir}/jelly/`,
		elements: getElements(`${dir}/jelly/`),
		position: {x: 0, y: 0},
		size: { width, height }
	},
];

module.exports = { layers, width, height, rarity };