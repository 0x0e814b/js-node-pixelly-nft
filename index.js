const fs = require('fs');
const myArgs = process.argv.slice(2);
const { createCanvas, loadImage } = require('canvas');
const { layers, width, height, rarity } = require("./pixelly/config.js");
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');
const editionSize = myArgs.length ? Number(myArgs[0]) : 1;
const metadataList = [];
const attributeList = [];
const dnaList = [];
const layerHistory = [];

const saveImage = (_editionCount) => {
	fs.writeFileSync(`./output/${_editionCount}.png`, canvas.toBuffer("image/png"));
}

const createDNA = (_len) => {
	return Math.floor(Number(`1e${_len}`) + Math.random() * Number(`9e${_len}`));
}

const isUniqueDNA = (_DNAList = [], _dna) => {
	return !~~_DNAList.find(list => list === _dna);
}

const addMetadata = (_dna, _edition) => {

	metadataList.push({
		dna: _dna,
		edition: _edition,
		date: Date.now(),
		attributes: attributeList
	});
	dnaList.push(_dna);
	attributeList.length = 0;
}

const addAttributes = ({ name, rarity }) => {

	attributeList.push({ name, rarity });
}

const loadLayerImage = async (_layer) => {

	const image = await loadImage(`${_layer.location}${_layer.selectedLayer.fileName}`);

	return { layer: _layer, loadedImage: image };
}

const drawElement = (_element) => {

	const { loadedImage, layer } = _element;

	ctx.drawImage(
		loadedImage,
		layer.position.x,
		layer.position.y,
		layer.size.width,
		layer.size.height
	);

	addAttributes(_element);
}

const getRandomRarity = () => {

	const filler = 100 - rarity.map(r => r.chance).reduce((sum, current) => sum + current);

	if (filler <= 0) {
		console.log("총 확률이 100을 초과합니다.");
		return;
	}

	const probability = rarity.map((r, i) => Array(r.chance === 0 ? filler : r.chance).fill(i)).flat();
	const pIndex = probability[Math.floor(Math.random() * 100)];

	return rarity[pIndex].val;
}

const getDiffrent = (rarities) => {

	const selected = rarities[Math.floor(Math.random() * rarities.length)];

	return layerHistory.includes(selected.name) ? getDiffrent(rarities) : selected;
}

const constructLayerToDna = (_dna, _layer) => {

	const dnaSegment = _dna.toString().match(/.{1,2}/g);

	return _layer.map(layer => {

		const randomRarityKey = getRandomRarity();
		const filterRarity = layer.elements.filter(elem => elem.rarity === randomRarityKey);
		let selectedLayer = filterRarity[parseInt(dnaSegment) % filterRarity.length];
		if (layerHistory.includes(selectedLayer.name)) {
			selectedLayer = getDiffrent(filterRarity);
		}
		layerHistory.push(selectedLayer.name);
		return {
			...layer,
			selectedLayer
		}
	});
};

const createMetaData = (_metadatastr) => {

	fs.writeFileSync('./output/_metadata.json', _metadatastr);
}

const generatePixelly = async () => {

	createMetaData('');

	let count = 1;

	while (count <= editionSize) {

		const newDna = createDNA(layers.length * 2 - 1);

		if (!isUniqueDNA(dnaList, newDna)) continue;

		const elementsToLoad = constructLayerToDna(newDna, layers).map(loadLayerImage);
		const elements = await Promise.all(elementsToLoad)
		elements.forEach(drawElement);

		saveImage(count);
		addMetadata(newDna, count);

		dnaList.push(newDna);
		layerHistory.length = 0;

		count++;
	}
}

generatePixelly();
createMetaData(JSON.stringify(metadataList));