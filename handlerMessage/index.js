//External Modules
const {
	downloadContentFromMessage
} = require("@adiwajshing/baileys-md");
const {
	fromBuffer
} = require("file-type");
const perf = require("perf_hooks").performance;
const chalk = require("chalk");
const util = require("util");
const axios = require("axios");
const moment = require("moment-timezone");
const speed = require("performance-now");
const child = require("child_process");
const ffmpeg = require("fluent-ffmpeg");
const os = require("os");
const fs = require("fs");

//internal Modules
require("./../configs");
const {
	getBuffer,
	getJson,
	runtime,
	sizeFormat,
	h2k,
	getRandom,
	getNumberAdminsGroups,
	exif,
	uploader
} = require("./../functions");

const {
	help,
	stats
} = require("./../helpers");

const {
	sendButtonsMenu,
	buttonsDownload,
	sendImage,
	sendAudio,
	sendVideo
} = require("./../sendingMessage");

//global configs
let owners = global.ownerNumber;
let apikeys = global.apikeys;
let watermark = global.watermark;
let packname = global.packname;
let authorname = global.authorname;
let multiprefix = global.multiprefix;
let nonprefix = global.nonprefix;
let thumbnail = global.thumbnail;
let participantRequest = [];

module.exports = async (xcoders, x) => {
	try {
		const type = Object.keys(x.message)[0];
		const content = JSON.stringify(x.message);
		const from = x.key.remoteJid;
		const cmd = (type === "conversation" && x.message.conversation) ? x.message.conversation : (type == "imageMessage") && x.message.imageMessage.caption ? x.message.imageMessage.caption : (type == "videoMessage") && x.message.videoMessage.caption ? x.message.videoMessage.caption : (type == "extendedTextMessage") && x.message.extendedTextMessage.text ? x.message.extendedTextMessage.text : "".slice(1).trim().split(/ +/).shift().toLowerCase();
		let prefix;
	  if (multiprefix) {
			prefix = /^[°⊳π÷×¶∆£¢€¥®™✓=|~zZ+×_!#$%^&./\\©^]/.test(cmd) ? cmd.match(/^[°⊳π÷×¶∆£¢€¥®™✓=|~zZ+×_!#$,|`÷?;:%abcdefghijklmnopqrstuvwxyz%^&./\\©^]/gi) : ".";
		} else {
			if (nonprefix) prefix = "";
			else prefix = global.prefix;
		}
		const buttonsResponseText = (type == "buttonsResponseMessage") ? x.message.buttonsResponseMessage.selectedDisplayText : "";
		const buttonsResponseID = (type == "buttonsResponseMessage") ? x.message.buttonsResponseMessage.selectedButtonId : "";
		const body = (type === "conversation" && x.message.conversation.startsWith(prefix)) ? x.message.conversation : (type == "imageMessage") && x.message[type].caption.startsWith(prefix) ? x.message[type].caption : (type == "videoMessage") && x.message[type].caption.startsWith(prefix) ? x.message[type].caption : (type == "extendedTextMessage") && x.message[type].text.startsWith(prefix) ? x.message[type].text : (type == "templateButtonReplyMessage") && x.message.templateButtonReplyMessage.selectedId ? x.message.templateButtonReplyMessage.selectedId : "";
		const budy = (type === "conversation") ? x.message.conversation : (type === "extendedTextMessage") ? x.message.extendedTextMessage.text : "";
		const isCmd = body.startsWith(prefix);
		const isGroups = from.endsWith("@g.us");
		const metadataGroups = isGroups ? await xcoders.groupMetadata(from) : "";
		const nameGroups = isGroups ? metadataGroups.subject : "";
		const countAdminsGroups = isGroups ? metadataGroups.participants.map(map => map.admin == null).filter(fill => fill == true).length : "";
		const getParticipants = isGroups ? metadataGroups.participants : "";
		const getAdminsGroups = isGroups ? getNumberAdminsGroups(getParticipants) : "";

		const senderNumber = isGroups ? x.key.participant : x.key.remoteJid;
		const senderName = x.pushName;
		const isCreators = x.key.fromMe || owners.includes(senderNumber);
		const command = body.replace(prefix, "").trim().split(/ +/).shift().toLowerCase();
		const args = body.trim().split(/ +/).slice(1);
		const query = body.trim().substring(body.indexOf(" ") + 1);

		const timeNow = moment.tz("Asia/Jakarta").format("HH:mm");
		const hours = moment(Date.now()).tz("Asia/Jakarta").locale("id").format("a");
		const says = `Selamat ${hours.charAt(0).toUpperCase() + hours.slice(1)}`;
		let response;
		if(global.language == false) {
			response = global.responseID;
		} else {
			response = global.responseEN;
		}

		//sender message 
		const reply = async (text) => {
			await xcoders.sendMessage(from, { text }, { quoted: x });
		};
		const toJSON = (string) => {
			return JSON.stringify(string, null, 2);
		};
		const monospace = (string) => {
			return "```"+ string +"```";
		};
		const isUrl = (url) => {
			return url.match(new RegExp(/[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)?/gi));
		};

		if (!isCmd) {
			if (isGroups) console.log(chalk.bgBlack.italic.red.bold(timeNow), chalk.italic.red("[ MSG ]"), chalk.bold.italic.greenBright(" From "), chalk.italic.bold.yellow(senderName), chalk.italic.bold.greenBright("in"), chalk.visible.italic.bold(nameGroups));
			else if (!isGroups) console.log(chalk.bgBlack.italic.red.bold(timeNow), chalk.italic.red("[ MSG ]"), chalk.bold.italic.greenBright(" From "), chalk.italic.bold.yellow(senderName));
		} else {
			if (isGroups) console.log(chalk.bgBlack.red.italic.bold(timeNow), chalk.bold.italic.green(`[ EXEC ${command.toUpperCase()} ]`), chalk.italic.greenBright.bold(" From"), chalk.bold.italic.yellow(senderName), chalk.italic.bold.greenBright("in"), chalk.bold.italic.yellow(nameGroups));
			else if (!isGroups) console.log(chalk.bgBlack.red.italic.bold(timeNow), chalk.bold.italic.greenBright(`[ EXEC ${command.toUpperCase()} ]`), chalk.italic.greenBright.bold(" From"), chalk.bold.italic.yellow(senderName));
		}
		const isQuotedImage = (type == "extendedTextMessage") && content.includes("imageMessage");
		const isQuotedAudio = (type == "extendedTextMessage") && content.includes("audioMessage");
		const isQuotedDocument = (type == "extendedTextMessage") && content.includes("documentMessage");
		const isQuotedVideo = (type == "extendedTextMessage") && content.includes("videoMessage");
		const isQuotedSticker = (type == "extendedTextMessage") && content.includes("stickerMessage");

		switch (command) {
			case "statistic":
				xcoders.sendMessage(from, { text: monospace(stats(os, speed, perf, performance, runtime, sizeFormat)) }, { quoted: x });
				break;
			case "help": case "menu":
				sendButtonsMenu(from, xcoders, prefix, senderName, thumbnail, says, x);
				break;
			case "allmenu":
				xcoders.sendMessage(from, { text: help(prefix), mentions: [senderNumber] }, { quoted: x });
				break;
			case "owner":
				let vcard = "BEGIN:VCARD\n" + "VERSION:3.0\n" + "FN:Fxc7\n" + "ORG:Fxc7;\n" + "TEL;type=CELL;type=VOICE;waid="+ owners[0].split("@")[0].replace(/[^0-9]/g, "") +":+"+ owners[0].split("@")[0].replace(/[^0-9]/g, "") +"\n" + "END:VCARD";
				xcoders.sendMessage(from, { contacts: { displayName: "Farhannnn", contacts: [{ vcard }] } }, { quoted: x });
				break;

				//downloader
				case "tiktok":
					if (args.length < 1) return reply(`Example: ${prefix + command} https://vt.tiktok.com/ZSJhvu1AE`);
					if (!query.match(/tiktok/gi)) return reply(response.error.url);
					var res = await getJson(`https://api-xcoders.xyz/api/download/tiktok3?url=${query}&apikey=${apikeys}`);
					if (res.result == undefined || res.status == false) return reply(response.error.request);
					reply(response.process);
					const caption = monospace(`\n\t\t『 TIKTOK DOWNLOADER 』\n\n❑ Request Form: @${senderNumber.split("@")[0]}\nMerespon Dalam: ${res.processed}\n`);
					await buttonsDownload(from, xcoders, res.result.video_nowm, res.result.audio, res.result.thumbnail, caption, x, senderNumber);
					participantRequest.push(senderNumber);
				break;
				case "ytshort":
				if (args.length < 1) return reply(`Example: ${prefix + command} https://youtube.com/shorts/kkScVmU_2Lg?feature=share`);
				if (!query.match(/youtube\.com\/short/gi)) return reply(response.error.url);
				var res = await getJson(`https://api-xcoders.xyz/api/download/ytshort?url=${query}&apikey=${apikeys}`);
				if (res.status == false) return reply(response.error.request);
				ytshort = monospace(`\n\t\t\t\t『 YOUTUBE SHORT 』\n\n❑ Title: ${res.result.title}\n❑ Quality: ${res.result.quality}\n❑ Size: ${res.result.size}\n`);
				sendImage(from, xcoders, res.result.thumbnail, ytshort, x);
				reply(response.process);
				sendVideo(from, xcoders, res.result.url, response.success, x);
				break;
			case "ytmp3":
				if (args.length < 1) return reply(`Example: ${prefix + command} https://youtu.be/Nq5rzeJ5Ab4`);
				if (!query.match(/youtu/gi)) return reply(response.error.url);
				var res = await getJson(`https://api-xcoders.xyz/api/download/ytmp3?url=${encodeURIComponent(query)}&apikey=${apikeys}`);
				if (res.status == false) return reply(response.error.request);
				ytmp3 = monospace(`\n\t\t\t\t『 YOUTUBE MP3 』\n\n❑ Title: ${res.result.title}\n❑ Quality: ${res.result.quality}\n❑ Size: ${res.result.size}\n`);
				sendImage(from, xcoders, res.result.thumbnail, ytmp3, x);
				reply(response.process);
				sendAudio(from, xcoders, res.result.url, res.result.title, x);
				break;
			case "ytmp4":
				if (args.length < 1) return reply(`Example: ${prefix + command} https://youtu.be/Nq5rzeJ5Ab4`);
				if (!query.match(/youtu/gi)) return reply(response.error.url);
				var res = await getJson(`https://api-xcoders.xyz/api/download/ytmp4?url=${encodeURIComponent(query)}&apikey=${apikeys}`);
				if (res.status == false) return reply(response.error.request);
				ytmp4 = monospace(`\n\t\t\t\t『 YOUTUBE MP4 』\n\n❑ Title: ${res.result.title}\n❑ Quality: ${res.result.quality}\n❑ Size: ${res.result.size}\n`);
				sendImage(from, xcoders, res.result.thumbnail, ytmp4, x);
				reply(response.process);
				sendVideo(from, xcoders, res.result.url, response.success, x);
				break;
			case "joox":
				if (args.length < 1) return reply(`Example: ${prefix + command} momolog pamumgkas`);
				var res = await getJson(`https://api-xcoders.xyz/api/download/joox?query=${encodeURIComponent(query)}&apikey=${apikeys}`);
				if (res.result == undefined || res.status == false) return reply(response.error.request);
				joox = monospace(`\n\t\t\t\t『 JOOX DOWNLOADER 』\n\n❑ Title: ${res.result.judul}\n❑ Artist: ${res.result.artist}\n❑ Album: ${res.result.album}\n❑ Size: ${res.result.size}\n❑ Duration: ${res.result.duration}\n`);
				sendImage(from, xcoders, res.result.thumbnail, joox, x);
				reply(response.process);
				sendAudio(from, xcoders, res.result.link, res.result.judul+".mp3", x);
				break;
			case "fbdl":
				if (args.length < 1) return reply(`Example: ${prefix + command} https://www.facebook.com/alanwalkermusic/videos/277641643524720`);
				if (!query.match(/facebook/gi)) return reply(response.error.url);
				var res = await getJson(`https://api-xcoders.xyz/api/download/fb?url=${query}&apikey=${apikeys}`);
				if (res.result == undefined || res.status == false) return reply(response.error.request);
				const fbdlUrl = await axios.get(`https://tinyurl.com/api-create.php?url=${res.result.data.url}`);
				if (res.result.data.size > 50000000) {
					var fbdl = monospace(`\n\t\t\t\t『 FACEBOOK DOWNLOADER 』\n\n❑ Size: ${res.result.data.formattedSize}\n❑ Quality: ${res.result.data.quality}\n\n\nOps Your Request Soo Large Please Klick Url Below To Download Video\n\n❑ Url: ${fbdlUrl.data}`);
					sendImage(from, xcoders, res.result.thumbnail, fbdl, x);
				} else {
					var fbdl = monospace(`\n\t\t\t\t『 FACEBOOK DOWNLOADER 』\n\n❑ Size: ${res.result.data.formattedSize}\n❑ Quality: ${res.result.data.quality}\n`);
					sendImage(from, xcoders, res.result.thumbnail, fbdl, x);
					reply(response.process);
					sendVideo(from, xcoders, fbdlUrl.data, response.success, x);
				}
				break
			case "igdl":
				if (args.length < 1) return reply(`Example: ${prefix + command} https://www.instagram.com/p/CNtpwxuH5NK/?igshid=g26k5coikzwr`)
				if (!query.match(/instagram\.com\/(?:p|reel)/gi)) return reply(response.error.url);
				await getJson(`https://api-xcoders.xyz/api/download/ig?url=${query}&apikey=${apikeys}`).then(async res => {
					if (res.result == undefined || res.status == false) return reply(response.error.request);
					if (res.result.media_count == 1) {
						if (res.result.type == "image") {
							var caption = monospace(`\n\t\t\t\t\t『 INSTAGRAM DOWNLOADER 』\n\n❑ Username: ${res.result.username}\n❑ Fullname: ${res.result.name}\n❑ Like: ${res.result.likes}\n❑ Caption: ${res.result.caption}\n`);
							reply(response.process)
							sendImage(from, xcoders, res.result.url, caption, x);
						} else if (res.result.type == "video") {
							var caption = monospace(`\n\t\t\t\t\t『 INSTAGRAM DOWNLOADER 』\n\n❑ Username: ${res.result.username}\n❑ Fullname: ${res.result.name}\n❑ Duration: ${res.result.duration}\n❑ ViewsCount: ${res.result.viewCount}\n❑ Like: ${res.result.likes}\n❑ Caption: ${res.result.caption}\n`);
							reply(response.process);
							sendVideo(from, xcoders, res.result.url, caption, x);
						} else {
							reply(response.error.request);
						}
					} else if (res.result.media_count !== 1) {
						var caption = monospace(`\n\t\t\t\t\t『 INSTAGRAM DOWNLOADER 』\n\n❑ Username: ${res.result.username}\n❑ Fullname: ${res.result.name}\n❑ Like: ${res.result.likes}\n❑ Caption: ${res.result.caption}\n`);
						reply(response.process);
						for (let grapSidecar of res.result.link) {
							if (grapSidecar.type == "image") {
								sendImage(from, xcoders, grapSidecar.url, caption, x);
							} else {
								sendVideo(from, xcoders, grapSidecar.url, caption, x);
							}
						}
					} else {
						reply(response.error.request);
					}
				}).catch(e => { console.error(e); reply(response.error.request)});
				break;
			case "igtv":
				if (args.length < 1) return reply(`Example: ${prefix + command} https://www.instagram.com/tv/CSW1PMohXDm/?utm_medium=copy_link`)
				if (!query.match(/instagram\.com\/tv/gi)) return reply(response.error.url);
				var res = await getJson(`https://api-xcoders.xyz/api/download/igtv?url=${query}&apikey=${apikeys}`)
				if (res.result == undefined || res.status == false) return reply(response.error.request);
				const igtvUrl = await axios.get(`https://tinyurl.com/api-create.php?url=${res.result.data.url}`);
				if (res.result.data.size >= 50000000) {
					igtv = monospace(`\n\t\t『 INSTAGRAM TV DOWNLOADER 』\n\n❑ Title: ${res.result.title}\n❑ Size: ${res.result.data.formattedSize}\n❑ Quality: ${res.result.data.quality}\n\n\nOps Your Request Soo Large Please Klick Url Below To Download Video\n\n❑ Url: ${igtvUrl.data}`);
					sendImage(from, xcoders, res.result.thumbnail, igtv, x);
				} else {
					igtv = monospace(`\n\t\t『 INSTAGRAM TV DOWNLOADER 』\n\n❑ Title: ${res.result.title}\n❑ Size: ${res.result.data.formattedSize}\n❑ Quality: ${res.result.data.quality}\n`);
					sendImage(from, xcoders, res.result.thumbnail, igtv, x);
					reply(response.process);
					sendVideo(from, xcoders, igtvUrl.data, response.success, x);
				}
				break;
			case "soundcloud": case "scdl":
				if (args.length < 1) return reply(`Example: ${prefix + command} https://m.soundcloud.com/licooys/pamungkas-monolog`);
				if (!query.match(/soundcloud/gi)) return reply(response.error.url);
				await getJson(`https://api-xcoders.xyz/api/download/soundcloud?url=${query}&apikey=${apikeys}`).then(async res => {
					if (res.result == undefined || res.status == false) return reply(response.error.request);
					soundCloud = monospace(`\n\t\t\t『 SOUND CLOUD DOWNLOADER 』\n\n❑ Title: ${res.result.title}\n❑ Duration: ${res.result.duration}\n❑ Quality: ${res.result.data.quality}\n❑ Size: ${res.result.data.formattedSize}\n`);
					sendImage(from, xcoders, res.result.thumbnail, soundCloud, x);
					reply(response.process);
					sendAudio(from, xcoders, res.result.data.url, res.result.title, x);
				}).catch(() => reply(response.error.request));
				break;
			case "ifunny":
				if (args.length < 1) return reply(`Example: ${prefix + command} https://ifunny.co/video/cf-tiktok-hi-lemoine-Ye4Uu0729?s=cl`);
				if (!query.match(/ifunny/gi)) return reply(response.error.url);
				await getJson(`https://api-xcoders.xyz/api/download/ifunny?url=${query}&apikey=${apikeys}`).then(async res => {
					ifunny = monospace(`\n\t\t\t\t『 IFUNNY DOWNLOADER 』 \n \n❑ Title: ${res.result.title}\n❑ Quality: ${res.result.data.quality}\n❑ Size: ${res.result.data.formattedSize}\n`);
					sendImage(from, xcoders, res.result.thumbnail, ifunny, x);
					reply(response.process);
					sendVideo(from, xcoders, res.result.data.url, response.success, x);
				}).catch(() => reply(response.error.request));
				break;
			case "imdb":
				if (args.length < 1) return reply(`Example ${prefix + command} https://m.imdb.com/video/vi3698310169?playlistId=tt6806448&ref_=tt_ov_vi`)
				if (!query.match(/imdb/gi)) return reply(response.error.url);
				await getJson(`https://api-xcoders.xyz/api/download/imdb?url=${query}&apikey=${apikeys}`).then(async res => {
					if (res.result.data.size > 50000000) {
						imdb = monospace(`\n\t\t\t\t『 IMDB DOWNLOADER 』\n\n❑ Quality: ${res.result.data.quality}\n❑ Size: ${res.result.data.formattedSize}\n\n\n Oops Your Request Is Too Large Please Click The Url Below To Download Video\n\n❑ Url: ${imdbUrl.data}\n`);
						sendImage(from, xcoders, res.result.thumbnail, imdb, x);
					} else {
						imdb = monospace(`\n\t\t\t\t『 IMDB DOWNLOADER 』\n\n❑ Quality: ${res.result.data.quality}\n❑ Size: ${res.result.data.formattedSize}\n`);
						sendImage(from, xcoders, res.result.thumbnail, imdb, x);
						reply(response.process);
						sendVideo(from, xcoders, res.result.data.url, response.success, x);
					}
				}).catch(() => reply(response.error.request));
				break;
			case "twitter":
				if (args.length < 1) return reply(`Example: ${prefix + command} https://twitter.com/AligBocah/status/1416673824058134534?s=20`);
				if (!query.match(/twitter/gi)) return reply(response.error.url);
				await getJson(`https://api-xcoders.xyz/api/download/twitter?url=${query}&apikey=${apikeys}`).then(async res => {
					if (res.result == undefined || res.status == false) return reply(response.error.request);
					twitterdl = monospace(`\n\t\t\t\t『 TWITTER DOWNLOADER 』\n\n${res.result.desc}\n`);
					sendImage(from, xcoders, res.result.thumb, twitterdl, x);
					reply(response.process);
					sendVideo(from, xcoders, res.result.HD, response.success, x);
				}).catch(() => reply(response.error.request));
				break;
			case "cocofun":
				if (args.length < 1) return reply(`Example: ${prefix + command} https://www.icocofun.com/share/post/qUc04yiC8WapxKtUXRy9dg==?lang=id&pkg=id&share_to=copy_link&m=23d0cac4747cc62954b3b1ed94697669&d=387544412ee2b99fddea8cb15c30fdd15b79f282b6c54a2aac6ca62db597c140&nt=1`);
				if (!query.match(/cocofun/gi)) return reply(response.error.url);
				await getJson(`https://api-xcoders.xyz/api/download/cocofun?url=${query}&apikey=${apikeys}`).then(async res => {
					if (res.result == undefined || res.status == false) return reply(response.error.request);
					cocofun = monospace(`\n\t\t\t\t『 COCOFUN DOWNLOADER 』 \n\n❑ Title: ${res.result.title}\n❑ Desc: ${res.result.desc}\n❑ Like: ${h2k(res.result.like)}\n❑ Play Count: ${h2k(res.result.play_count)}\n❑ Shared: ${h2k(res.result.shared)}\n❑ Resolusi: ${res.result.resolution}\n❑ Duration: ${res.result.duration}\n`);
					sendImage(from, xcoders, res.result.thumbnail, cocofun, x);
					sendVideo(from, xcoders, res.result.url, response.success, x);
				}).catch(() => reply(response.error.request));
				break;
			case "pindl":
				if (args.length < 1) return reply(`Example: ${prefix + command} https://id.pinterest.com/pin/881790802010631188/`);
				if (!query.match(/pin/gi)) return reply(response.error.url);
				await getJson(`https://api-xcoders.xyz/api/download/pinterest?url=${query}&apikey=${apikeys}`).then(async res => {
					var str = monospace(`\n\t\t\t\t『 PINTEREST DOWNLOADER 』\n\n❑ Duration: ${res.result.duration}\n❑ Quality: ${res.result.data.quality}\n❑ Size: ${res.result.data.formattedSize}\n`);
					sendImage(from, xcoders, res.result.thumbnail, str, x);
					sendVideo(from, xcoders, res.result.data.url, response.success, x);
				}).catch(() => reply(response.error.request));
				break;
			case "xvideosdl":
				if (args.length < 1) return reply(`Example: ${prefix + command} https://www.xvideos.com/video45738459/pervymother.com_-_mom_and_sister_threeway_fantasy`);
				if (!query.match(/xvideos/gi)) return reply(response.error.url);
				await getJson(`https://api-xcoders.xyz/api/download/xvideos?url=${query}&apikey=${apikeys}`).then(async res => {
					str = monospace(`\n\t\t\t『 XVIDEOS DOWNLOADER 』\n\nTitle: ${res.result.title}\n❑ Viewers: ${res.result.views}\n❑ Votes: ${res.result.vote}\n❑ Likes: ${res.result.like_count}\n❑ Dislikes: ${res.result.dislike_count}\n\nKeywords: \n❑ ${res.result.keyword.split(/,/g).join("\n❑ ")}\n`);
					sendImage(from, xcoders, res.result.thumb, str, x);
					reply(response.process);
					sendVideo(from, xcoders, res.result.url, response.success, x);
				}).catch(() => reply(response.error.request));
				break;
			case "xnxxdl":
				if (args.length < 1) return reply(`Example: ${prefix + command} https://www.xnxx.com/video-kmyob38/hot_milf_step_mom_huge_boobs_brunette_ryder_skye_sex_with_stepson_pov`);
				if (!query.match(/xnxx/gi)) return reply(response.error.url);
				await getJson(`https://api-xcoders.xyz/api/download/xnxx?url=${query}&apikey=${apikeys}`).then(async res => {
					var str = monospace(`\n\t\t\t『 XNXX DOWNLOADER 』\n\n❑ Title: ${res.result.title}\n❑ Duration: ${res.result.duration}\n❑ Quality: ${res.result.quality}\n❑ Viewers: ${res.result.views}\n\nKeywords: \n❑ ${res.result.keyword.split(/,/g).join("\n❑ ")}\n`);
					sendImage(from, xcoders, res.result.thumb, str, x);
					reply(response.process);
					sendVideo(from, xcoders, res.result.url, response.success, x);
				}).catch(() => reply(response.error.request));
				break;

				//stalker fitur
			case "ttstalk":
				if (args.length < 1) return reply(`Example: ${prefix + command} chikakiku`);
				await getJson(`https://api-xcoders.xyz/api/stalk/tiktok?username=${query}&apikey=${apikeys}`).then(async res => {
					const ttstalk = `\n\t\t\t\t『 TIKTOK STALKER 』\n\n❑ Username : ${res.result.username}\n❑ Nickname : ${res.result.nickname}\n❑ Signature : ${res.result.signature}\n❑ Verified Acc : ${res.result.verified}\n❑ Private Acc : ${res.result.privateAccount}\n❑ Followers : ${h2k(res.result.followers)}\n❑ Following : ${h2k(res.result.followings)}\n❑ Heart Count : ${h2k(res.result.hearts)}\n❑ Video Count : ${h2k(res.result.videoCount)}\n\n❑ Created Time : ${res.result.createTime}`;
					reply(response.process);
					sendImage(from, xcoders, res.result.profile, ttstalk, x);
				}).catch(() => reply(response.error.request));
				break;
			case "igstalk":
				if (args.length < 1) return reply(`Example: ${prefix + command} only_fxc7`);
				await getJson(`https://api-xcoders.xyz/api/stalk/ig?username=${query}&apikey=${apikeys}`).then(async res => {
					const Igstlk = `\n\t\t\t『 INSTAGRAM STALKER 』\n\n❑ Username : ${res.result.username}\n❑ Fullname : ${res.result.full_name}\n❑ Followers : ${res.result.followers}\n❑ Following : ${res.result.following}\n❑ Private Acc : ${res.result.is_private}\n❑ Verified Acc : ${res.result.is_verified}\n❑ Post Count : ${res.result.posts_count}\n❑ Bio :\n${res.result.biography}\n`
					reply(response.process);
					sendImage(from, xcoders, res.result.profile_url, Igstlk, x)
				}).catch(() => reply(response.error.request));
				break;
			case "githubstalk": case "ghstalk":
				if (args.length < 1) return reply(`Example: ${prefix + command} Fxc7`);
				await getJson(`https://api-xcoders.xyz/api/stalk/github?username=${query}&apikey=${apikeys}`).then(async res => {
					Ghstalk = `\n\t\t\t\t\t『 GITHUB STALKER 』\n\n`
					Ghstalk += `❑ Username : ${res.result.username}\n❑ Name : ${res.result.name}\n❑ Blog : ${res.result.blog}\n❑ Company : ${res.result.company}\n❑ Location : ${res.result.location}\n❑ Followers : ${h2k(res.result.followers)}\n❑ Following : ${h2k(res.result.following)}\n❑ Repo Count : ${h2k(res.result.repository_count)}\n❑ Bio :\n${res.result.bio}\n\n\n❑ Created at : ${res.result.created_at}\n❑ Update at : ${res.result.update_at}`;
					reply(response.process);
					sendImage(from, xcoders, res.result.profile_url, Ghstalk, x);
				}).catch(() => reply(response.error.request));
				break;
			//end stalker

			//maker/convert 
			case "tourl":
				var downloadMediaMessage =	(x.message.imageMessage || x.message.extendedTextMessage?.contextInfo.quotedMessage.imageMessage) || (x.message.videoMessage || x.message.extendedTextMessage?.contextInfo.quotedMessage.videoMessage)
				if(downloadMediaMessage === undefined) return reply(`Kirim Image/Video dengan caption ${prefix + command} / reply media`);
				let mime;
				if(downloadMediaMessage.mimetype === "video/mp4") mime = "video";
				else mime = "image";
				reply(response.process);
				var downloadContentMedia = await downloadContentFromMessage(downloadMediaMessage, mime);
				var buffer = Buffer.from([]);
				for await(const chunk of downloadContentMedia) {
						buffer = Buffer.concat([buffer, chunk]);
				}
				reply(await uploader(buffer));
				break;
			case "sticker": case "stiker": case "s":
					if ((type === "imageMessage") || isQuotedImage) {
						var downloadContentMedia = await downloadContentFromMessage(x.message.imageMessage || x.message.extendedTextMessage?.contextInfo.quotedMessage.imageMessage, "image");
						 var buffer = Buffer.from([]);
						 for await(const chunk of downloadContentMedia) {
								buffer = Buffer.concat([buffer, chunk]);
						 }
						 var filenameS = "./tmp/"+ getRandom(".jpg");
						 var filenameW = "./tmp/"+ getRandom(".webp");
						 fs.writeFileSync(filenameS, buffer);
						 ffmpeg(filenameS).on("error", console.error).on("end", () => {
							 child.exec(`webpmux -set exif ./tmp/data.exif ${filenameW} -o ${filenameW}`, async (error) => {
								 reply(response.process);
								 xcoders.sendMessage(from, { sticker: fs.readFileSync(filenameW) }, { quoted: x });
								 fs.unlinkSync(filenameS);
								 fs.unlinkSync(filenameW);
							 });
				 }).addOutputOptions(["-vcodec", "libwebp", "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse"]).toFormat("webp").save(filenameW);
					 } else if ((type === "videoMessage") || isQuotedVideo) {
				 var downloadContentMedia = await downloadContentFromMessage(x.message.imageMessage || x.message.extendedTextMessage?.contextInfo.quotedMessage.videoMessage, "video");
				 var buffer = Buffer.from([])
				 for await(const chunk of downloadContentMedia) {
					 buffer = Buffer.concat([buffer, chunk]);
				 }
				 var filenameS = "./tmp/"+ getRandom(".mp4")
				 var filenameW = "./tmp/"+ getRandom(".webp")
				 fs.writeFileSync(filenameS, buffer);
				 ffmpeg(filenameS).on("error", console.error).on("end", () => {
					 child.exec(`webpmux -set exif ./tmp/data.exif ${filenameW} -o ${filenameW}`, async (error) => {
						 reply(response.process);
							xcoders.sendMessage(from, { sticker: fs.readFileSync(filenameW) }, { quoted: x });
							fs.unlinkSync(filenameS);
							fs.unlinkSync(filenameW);
					 });
				 }).addOutputOptions(["-vcodec", "libwebp", "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse"]).toFormat("webp").save(filenameW);
					 } else {
						 reply(`Kirim gambar/vidio dengan caption ${command} atau balas gambar/vidio yang sudah dikirim\nNote : Maximal vidio 10 detik!`);
					 }
					 break;
			case "tahta":
				if(args.length < 1) return reply(`Example: ${prefix + command} Farhan`);
				reply(response.process);
				sendImage(from, xcoders, `https://api-xcoders.xyz/api/maker/tahta?text=${query}&apikey=${apikeys}`, response.success, x)
				break;

			//anime/wibu
			case "loli":
				reply(response.process);
				sendImage(from, xcoders, `https://api-xcoders.xyz/api/anime/loli?apikey=${apikeys}`, response.success, x);
				break;

			//group only
			case "tagall":
				if (!isGroups) return reply("*Only Groups*");
				let number = [];
				let tagall = `\t\tMember *${nameGroups}*\n\n`;
				for (let mem of getParticipants) {
					tagall += `[+] @${mem.id.split("@")[0]}\n`;
					number.push(mem.id);
				}
				xcoders.sendMessage(from, { text: tagall, mentions: number }, { quoted: x });
				break;
			case "listadmin": case "adminlist":
				if (!isGroups) return reply("*Only Groups");
				let numberAdmin = [];
				let listadmin = `\t\tAdmins *${nameGroups}*\n\n`;
				for (let adm of getParticipants) {
					if (adm.admin !== null) {
						numberAdmin.push(adm.id);
						listadmin += `[+] @${adm.id.split("@")[0]}\n`;
					}
				}
				xcoders.sendMessage(from, { text: listadmin, mentions: numberAdmin }, { quoted: x });
				break;
				
				//owner only 
			case "setexif":
				if(!isCreators) return reply(response.isCreator);
				await exif(args[0] || packname, args[1] || authorname);
				reply(response.success);
				break;
			case "setprefix":
			  if(!isCreators) return reply(response.isCreator);
			  if(args.length < 1) return reply(`Example Optional:\n ${prefix + command} nopref/multi/[optional]`);
			  if(query === "multi") {
			    multiprefix = true;
			    nonprefix = false;
			    reply(response.success);
			  } else if(query === "nopref") {
			    multiprefix = false;
			    nonprefix = true;
			    reply(response.success);
			  } else {
			    multiprefix = false;
			    nonprefix = false;
			    global.prefix = query
			    reply(response.success);
			  }
			  reply(response.success);
			  break;
			case "restart":
			  if(!isCreators) return reply(response.isCreator);
			  child.exec(process.send("reset"), (err, stdout) => {
					if (err) return reply(util.format(err));
					if (stdout) return reply(util.format(stdout));
				});
				break;
			case "language":
				if(!isCreators) return reply(response.isCreators);
				if(args.length < 1) return reply("Masukkan Optional");
				if(query.toLowerCase() == "en") {
					global.language = true;
					reply(response.success);
				} else if(query.toLowerCase() == "id") {
					global.language = false;
					reply(response.success);
				} else {
					reply(`Optional: \n${prefix + command} en/id`);
				}
				break;

			default:
				if (budy.startsWith(">") || budy.startsWith("=>")) {
				if(!isCreators) return;
					try {
						const evaling = await eval(`;(async () => {
							${budy.slice(2)}
							})();`);
						const utilites = await util.format(evaling);
						reply(utilites);
					} catch (e) {
						reply(util.format(e));
					}
				}
				if (budy.startsWith("$")) {
					if (!isCreators) return;
					child.exec(budy.slice(2), (err, stdout) => {
						if (err) return reply(util.format(err));
						if (stdout) return reply(util.format(stdout));
					});
				}
				if(buttonsResponseText == "🎥 Video") {
				if(!participantRequest.includes(senderNumber)) return reply("these buttons are not for you");
				reply(response.process);
				sendVideo(from, xcoders, buttonsResponseID, response.success, x);
				for(let i=0; i < participantRequest.length; i++) {
					if(participantRequest[i] == senderNumber) {
						participantRequest.splice(i, 1);
						break;
					}
				}
			}
			if(buttonsResponseText == "🎵 Audio") {
				if(!participantRequest.includes(senderNumber)) return reply("these buttons are not for you");
				reply(response.process);
				sendAudio(from, xcoders, buttonsResponseID, getRandom(".mp3"), x);
				for(let i=0; i < participantRequest.length; i++) {
					if(participantRequest[i] == senderNumber) {
						participantRequest.splice(i, 1);
						break;
					}
				}
			}
		}
	} catch (e) {
		console.log(chalk.red.bold.underline(String(e)));
		xcoders.sendMessage(owners[0], { text: util.format(e) });
	}
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
	fs.unwatchFile(file);
	console.log(`Update ${__filename}`);
	delete require.cache[file];
	require(file);
});
