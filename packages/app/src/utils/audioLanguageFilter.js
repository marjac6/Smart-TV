export const AUDIO_LANGUAGE_LABELS = {
	pl: 'Polski',
	en: 'English',
	de: 'Deutsch',
	fr: 'Francais',
	es: 'Espanol',
	it: 'Italiano',
	ja: 'Japanese',
	ko: 'Korean',
	cs: 'Cestina',
	ru: 'Russkiy',
	uk: 'Ukrainska',
	pt: 'Portugues'
};

const AUDIO_FILTERABLE_TYPES = new Set(['Movie', 'Series', 'Episode']);

export const isAudioFilterableItem = (item) => AUDIO_FILTERABLE_TYPES.has(item?.Type);

export const getAudioStreams = (item) => {
	const topLevelStreams = Array.isArray(item?.MediaStreams) ? item.MediaStreams : [];
	const sourceStreams = Array.isArray(item?.MediaSources)
		? item.MediaSources.flatMap((source) => Array.isArray(source?.MediaStreams) ? source.MediaStreams : [])
		: [];
	return [...topLevelStreams, ...sourceStreams].filter((stream) => stream?.Type === 'Audio');
};

export const normalizeAudioLanguageCode = (value = '') => {
	const normalized = value.toString().trim().toLowerCase();
	if (!normalized) return '';
	if (normalized === 'pol') return 'pl';
	return normalized.split(/[-_]/)[0];
};

export const getAudioLanguageEntry = (stream) => {
	const code = normalizeAudioLanguageCode(stream?.Language || stream?.language || '');
	const display = (stream?.DisplayLanguage || stream?.displayLanguage || '').toString().trim();
	if (!code && !display) return null;

	if (code) {
		return {
			key: code,
			label: AUDIO_LANGUAGE_LABELS[code] || display || code.toUpperCase()
		};
	}

	return {
		key: display.toLowerCase(),
		label: display
	};
};

export const getAudioLanguageOptions = (items, includeAny = false) => {
	const optionsMap = new Map();

	(items || []).forEach((item) => {
		if (!isAudioFilterableItem(item)) return;
		getAudioStreams(item).forEach((stream) => {
			const language = getAudioLanguageEntry(stream);
			if (!language) return;
			if (!optionsMap.has(language.key)) {
				optionsMap.set(language.key, language);
			}
		});
	});

	if (!optionsMap.has('pl')) {
		optionsMap.set('pl', {key: 'pl', label: AUDIO_LANGUAGE_LABELS.pl});
	}

	const sorted = Array.from(optionsMap.values()).sort((a, b) => {
		if (a.key === 'pl') return -1;
		if (b.key === 'pl') return 1;
		return a.label.localeCompare(b.label);
	});

	return includeAny ? [{key: '', label: 'Any'}].concat(sorted) : sorted;
};

export const matchesAudioLanguageFilter = (item, selectedLanguage) => {
	if (!selectedLanguage || !isAudioFilterableItem(item)) return true;

	const audioStreams = getAudioStreams(item);
	if (audioStreams.length === 0) return true;

	let hasUnknown = false;
	for (const stream of audioStreams) {
		const language = getAudioLanguageEntry(stream);
		if (!language) {
			hasUnknown = true;
			continue;
		}
		if (language.key === selectedLanguage) return true;
	}

	return hasUnknown;
};
