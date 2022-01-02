const axios = require("axios");
const formData = require("form-data");
const { fromBuffer } = require("file-type");
const { sizeFormatter } = require("human-readable");
const fs = require("fs");

exports.getBuffer = this.getBuffer = (url) => {
	return new Promise(async(resolve, reject) => {
		await axios.request({
			method: "GET",
			url: url,
			headers: {
				DNT: 1,
				"Upgrade-Insecure-Request": 1
			},
			responseType: "arrayBuffer"
		})
		.then(({ data }) => resolve(data))
		.catch(reject);
	});
};

exports.getJson = this.getJson = (url) => {
	return new Promise(async(resolve, reject) => {
		await axios.get(url)
		.then(({ data }) => resolve(data))
		.catch(reject);
	});
};

exports.runtime = this.runtime = (seconds) => {
	seconds = Number(seconds);
	var d = Math.floor(seconds / (3600 * 24));
	var h = Math.floor(seconds % (3600 * 24) / 3600);
	var m = Math.floor(seconds % 3600 / 60);
	var s = Math.floor(seconds % 60);
	var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
	var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
	var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
	var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
	return dDisplay + hDisplay + mDisplay + sDisplay;
};

exports.sizeFormat = this.sizeFormat = sizeFormatter({
	std: "JEDEC",
	decimalPlaces: 2,
	keepTrailingZeroes: false,
	render: (literal, symbol) => `${literal} ${symbol}B`,
});

exports.h2k = this.h2k = (number) => {
	var SI_POSTFIXES = ["", " K", " M", " G", " T", " P", " E"];
	var tier = Math.log10(Math.abs(number)) / 3 | 0;
	if (tier == 0) return number;
	var postfix = SI_POSTFIXES[tier];
	var scale = Math.pow(10, tier * 3);
	var scaled = number / scale;
	var formatted = scaled.toFixed(1) + "";
	if (/\.0$/.test(formatted))
		formatted = formatted.substr(0, formatted.length - 2);
	return formatted + postfix;
};

exports.getRandom = this.getRandom = (ext) => {
	return `${Math.floor(Math.random() * 10000)+1}${ext}`;
};
exports.getNumberAdminsGroups = this.getNumberAdminsGroups = (participant) => {
	let position = [];
	for (let i = 0; i < participant.length; i++) {
		if(participant[i].admin !== null) {
			position.push(participant[i].id);
		}
	}
	return position;
};

exports.exif = this.exif = (packname, authorname, filename) => {
	if (!filename) filename = "data";
	const packID = "com.snowcorp.stickerly.android.stickercontentprovider b5e7275f-f1de-4137-961f-57becfad34f2";
	const playstore = "https://play.google.com/store/apps/details?id=com.stickify.stickermaker";
	const itunes = "https://itunes.apple.com/app/sticker-maker-studio/id1443326857";
		const json = {
				"sticker-pack-id": packID,
				"sticker-pack-name": packname,
				"sticker-pack-publisher": authorname,
				"android-app-store-link": playstore,
				"ios-app-store-link": itunes
		};
		let len = JSON.stringify(json).length;
		const f = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00]);
		const code = [0x00, 0x00, 0x16, 0x00, 0x00, 0x00];
		if (len > 256) {
			 len = len - 256;
			 code.unshift(0x01);
		} else {
			 code.unshift(0x00);
		}
		const fff = Buffer.from(code);
		const ffff = Buffer.from(JSON.stringify(json));
		if (len < 16) {
			 len = len.toString(16);
			 len = "0" + len;
		} else {
			 len = len.toString(16);
		}
		const ff = Buffer.from(len, "hex");
		const buffer = Buffer.concat([f, ff, fff, ffff]);
		fs.writeFile(`./tmp/${filename}.exif`, buffer, (err) => {
		if (err) return console.error(err);
			 console.log("Success!");
		});
};

exports.uploader = this.uploader = async (buffer) => {
  return new Promise(async(resolve, reject) => {
    const { ext } = await fromBuffer(buffer);
    let FormData = new formData();
    FormData.append("file", buffer, `${Date.now() +"."+ ext}`);
    let data;
    await axios({
    method: "POST",
    url: "https://telegra.ph/upload",
    data: FormData.getBuffer(),
    headers: {
      ...FormData.getHeaders()
    }
  })
  .then(({ data }) => {
    if(data.error) throw data.error;
    resolve(`https://telegra.ph${data[0].src}`);
  }).catch(reject);
  });
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
	fs.unwatchFile(file);
	console.log(`Update ${__filename}`);
	delete require.cache[file];
	require(file);
});
