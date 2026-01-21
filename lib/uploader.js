const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { fromBuffer, fromFile } = require('file-type');
const cheerio = require('cheerio');
const fetch = require('node-fetch');

// 📦 Upload small PNG/JPG to Telegra.ph
async function TelegraPh(Path) {
	if (!fs.existsSync(Path)) throw new Error("File not found: " + Path);
	const { mime } = await fromFile(Path);

	if (!mime) throw new Error("Failed to detect MIME type for file: " + Path);
	if (!/image\/(jpe?g|png)/.test(mime)) {
		throw new Error(`Unsupported Telegra.ph type: ${mime}`);
	}

	const stats = fs.statSync(Path);
	if (stats.size > 5 * 1024 * 1024) {
		throw new Error("File too large for Telegra.ph (max 5MB)");
	}

	const form = new FormData();
	form.append('file', fs.createReadStream(Path));

	const res = await axios.post('https://telegra.ph/upload', form, {
		headers: form.getHeaders(),
	});

	if (!Array.isArray(res.data) || !res.data[0]?.src) {
		throw new Error("Invalid Telegra.ph response");
	}

	return 'https://telegra.ph' + res.data[0].src;
}

// 📦 Upload any file to Uguu.se (video, audio, etc.)
async function UploadFileUgu(input) {
	if (!fs.existsSync(input)) throw new Error("File not found: " + input);
	const form = new FormData();
	form.append('files[]', fs.createReadStream(input));

	const { data } = await axios.post('https://uguu.se/upload.php', form, {
		headers: {
			'User-Agent': 'Mozilla/5.0',
			...form.getHeaders(),
		},
	});

	if (!data || !Array.isArray(data.files) || !data.files[0]) {
		throw new Error("Invalid Uguu response: " + JSON.stringify(data));
	}


	// backward compatibility (some responses have `url`, some don't)
	return data.files[0].url || data.files[0];
}

// 🌀 Convert WebP → MP4 (for stickers)
async function webp2mp4File(path) {
	if (!fs.existsSync(path)) throw new Error("File not found: " + path);

	const form = new FormData();
	form.append('new-image-url', '');
	form.append('new-image', fs.createReadStream(path));

	const { data } = await axios.post('https://s6.ezgif.com/webp-to-mp4', form, {
		headers: { ...form.getHeaders() },
	});

	const $ = cheerio.load(data);
	const file = $('input[name="file"]').attr('value');
	if (!file) throw new Error("Failed to extract conversion ID");

	const form2 = new FormData();
	form2.append('file', file);
	form2.append('convert', 'Convert WebP to MP4!');

	const { data: converted } = await axios.post(`https://ezgif.com/webp-to-mp4/${file}`, form2, {
		headers: { ...form2.getHeaders() },
	});

	const $2 = cheerio.load(converted);
	const result = 'https:' + $2('div#output > p.outfile > video > source').attr('src');
	if (!result) throw new Error("Conversion failed");

	return {
		status: true,
		message: 'Converted by Marin MD',
		result,
	};
}

// 🧩 Optional: Flonime uploader (alternative image host)
async function floNime(medianya, options = {}) {
	const { ext } = (await fromBuffer(medianya)) || options.ext;
	const form = new FormData();
	form.append('file', medianya, 'tmp.' + ext);

	try {
		const res = await fetch('https://flonime.my.id/upload', {
			method: 'POST',
			body: form,
		});
		return await res.json();
	} catch (e) {
		return e;
	}
}

// 🌐 Smart uploader — tries Telegra.ph first, then Uguu fallback
async function SmartUpload(path) {
	try {
		if (!path || !fs.existsSync(path)) {
			throw new Error('Invalid or missing file path for upload.');
		}
		return await TelegraPh(path);
	} catch (err) {
		console.log('⚠️ Telegra.ph failed:', err.message);
		try {
			if (!fs.existsSync(path)) throw new Error("File not found for fallback upload.");
			return await UploadFileUgu(path);
		} catch (uguuErr) {
			console.log('⚠️ Uguu fallback failed:', uguuErr.message);
			throw uguuErr;
		}
	}
}


module.exports = {
	TelegraPh,
	UploadFileUgu,
	webp2mp4File,
	floNime,
	SmartUpload
};
