require("./../configs");
const {
	prepareWAMessageMedia,
	generateWAMessageFromContent,
	proto
} = require("@adiwajshing/baileys-md");
const fs = require("fs");
const {
	templateContentText,
	templateFooterText
} = require("./../helpers");
const {
	getBuffer
} = require("./../functions");

exports.sendButtonsMenu = async (from, xcoders, prefix, senderName, thumbnail, says, quotedObj) => {
	const prepareMessage = await prepareWAMessageMedia({ image: thumbnail }, { upload: xcoders.waUploadToServer });
	const templateMessage = await generateWAMessageFromContent(from, proto.Message.fromObject({
		templateMessage: {
			hydratedTemplate: {
				imageMessage: prepareMessage.imageMessage,
				hydratedContentText: templateContentText(senderName, says),
				hydratedFooterText: templateFooterText(),
				hydratedButtons: [{
					urlButton: {
						displayText: "𝐑𝐞𝐬𝐭 𝐀𝐏𝐈𝐬",
						url: "https://api-xcoders.xyz/"
					}
				}, {
					callButton: {
						displayText: "𝐂𝐚𝐥𝐥 𝐍𝐮𝐦𝐛𝐞𝐫",
						phoneNumber: "+62 831-1800-241"
					}
				}, {
					quickReplyButton: {
						displayText: "𝐂𝐨𝐦𝐦𝐚𝐧𝐝",
						id: `${prefix}allmenu`
					}
				}, {
					quickReplyButton: {
						displayText: "𝐒𝐭𝐚𝐭𝐢𝐬𝐭𝐢𝐜",
						id: `${prefix}statistic`
					}
				}, {
					quickReplyButton: {
						displayText: "𝐎𝐰𝐧𝐞𝐫𝐬",
						id: `${prefix}owner`
					}
				}]
			}
		}
	}), { userJid: from });
	return await xcoders.relayMessage(from, templateMessage.message, { messageId: templateMessage.key.id, quoted: quotedObj });
};

exports.buttonsDownload = this.buttonsDownload = async (from, xcoders, video, audio, thumbnail , caption, x, senderNumber) => {
	button = [{ buttonId: audio, buttonText: { displayText: `🎵 Audio` }, type: 1 }, { buttonId: video, buttonText: { displayText: `🎥 Video` }, type: 1 }];
	return await xcoders.sendMessage(from, { location: { jpegThumbnail: await getBuffer(thumbnail) }, caption: caption, buttons: button, footer: "Pilih Salah Satu Button Dibawah ⬇️", mentions: [senderNumber] }).catch(e => { xcoders.sendMessage(from, {text: global.responseEN.error.request}, {quoted: x}) });
};

exports.sendImage = async (from, xcoders, url, caption = global.responseEN.success, x) => {
	return await xcoders.sendMessage(from, { image: { url: url }, caption: caption }, { quoted: x }).catch(e => { xcoders.sendMessage(from, {text: global.responseEN.error.request}, {quoted: x}) });
};

exports.sendAudio = async (from, xcoders, url, filename, x) => {
	return xcoders.sendMessage(from, { document: { url: url }, fileName: filename, mimetype: 'audio/mp4' }, { quoted: x}).catch(e => { xcoders.sendMessage(from, {text: global.responseEN.error.request}, {quoted: x}) });
};

exports.sendVideo = async (from, xcoders, url, caption, x) => {
	return await xcoders.sendMessage(from, { video: { url: url }, caption: caption }, { quoted: x }).catch(e => { xcoders.sendMessage(from, {text: global.responseEN.error.request}, {quoted: x}) });
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
	fs.unwatchFile(file);
	console.log(`Update ${__filename}`);
	delete require.cache[file];
	require(file);
});