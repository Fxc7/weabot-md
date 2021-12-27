const m = '```';

exports.help = this.help = (prefix) => {
	return `
			 *❑ DOWNLOADER MENU ❑*
${m}✰ ${prefix}ytshort${m}
${m}✰ ${prefix}ytmp3${m}
${m}✰ ${prefix}ytmp4${m}
${m}✰ ${prefix}joox${m}
${m}✰ ${prefix}fbdl${m}
${m}✰ ${prefix}igtv${m}
${m}✰ ${prefix}igdl${m}
${m}✰ ${prefix}tiktok${m}
${m}✰ ${prefix}soundcloud${m}
${m}✰ ${prefix}ifunny${m}
${m}✰ ${prefix}imdb${m}
${m}✰ ${prefix}twitter${m}
${m}✰ ${prefix}cocofun${m}
${m}✰ ${prefix}pindl${m}
${m}✰ ${prefix}xnxxdl${m}
${m}✰ ${prefix}xvideosdl${m}
		
				*❑ STALKER MENU ❑*
${m}✰ ${prefix}ttstalk${m}
${m}✰ ${prefix}igstalk${m}
${m}✰ ${prefix}githubstalk${m}

			 *❑ CONVERTER MENU ❑*
${m}✰ ${prefix}tourl${m}
${m}✰ ${prefix}sticker${m}

			 *❑ MAKER MENU ❑*
${m}✰ ${prefix}tahta${m}

			 *❑ ANIME/WIBU ❑*
${m}✰ ${prefix}loli${m}

			 *❑ GROUPS ONLY ❑*
${m}✰ ${prefix}tagall${m}
${m}✰ ${prefix}listadmin${m}

			 *❑ OWNERS ONLY ❑*
${m}✰ >${m}
${m}✰ $${m}
${m}✰ ${prefix}setprefix${m}
${m}✰ ${prefix}restart${m}
${m}✰ ${prefix}language${m}
${m}✰ ${prefix}setexif${m}

		\t\t\t\t*_WhatsApp BOT Multi Device_*
	`;
};

exports.stats = this.stats = (os, speed, perf, performance, runtime, sizeFormat) => {
	const used = process.memoryUsage();
	const cpus = os.cpus().map(cpu => { cpu.total = Object.keys(cpu.times).reduce((last, type) => last + cpu.times[type], 0); return cpu });
	const cpu = cpus.reduce((last, cpu, _, { length }) => {
		last.total += cpu.total;
		last.speed += cpu.speed / length;
		last.times.user += cpu.times.user;
		last.times.nice += cpu.times.nice;
		last.times.sys += cpu.times.sys;
		last.times.idle += cpu.times.idle;
		last.times.irq += cpu.times.irq;
		return last;
	}, { speed: 0, total: 0, times: { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 } });
	let timestamp = speed();
	let latensi = speed() - timestamp;
	let perf_now = perf.now();
	let perf_old = performance.now();
	return `
	Kecepatan Respon ${latensi.toFixed(4)} _Second_ \n ${perf_old - perf_now} _miliseconds_

⊳ Runtime : ${runtime(process.uptime())}

	💻 Info Server
⊳ RAM: ${sizeFormat(os.totalmem() - os.freemem())} / ${sizeFormat(os.totalmem())}
⊳ Homedir: ${os.userInfo().homedir}
⊳ OS Type: ${os.type()}
⊳ OS Version: ${os.version()}
⊳ Hostname: ${os.hostname()}

	🔰 NodeJS Memory Usage
${Object.keys(used).map((key, _, arr) => `⊳ ${key.padEnd(Math.max(...arr.map(v => v.length)), ' ')}: ${sizeFormat(used[key])}`).join('\n')}
${cpus[0] ? `\n\t🌐 Total CPU Usage 
${cpus[0].model.trim()} (${cpu.speed} MHZ)\n${Object.keys(cpu.times).map(type => `⊳ ${(type).padEnd(6)}: ${(100 * cpu.times[type] / cpu.total).toFixed(2)}%`).join('\n')}

	♨️ CPU Core(s) Usage (${cpus.length} Core CPU)
${cpus.map((cpu, i) => `${i + 1}. ${cpu.model.trim()} (${cpu.speed} MHZ)\n${Object.keys(cpu.times).map(type => `⊳ ${(type).padEnd(6)}: ${(100 * cpu.times[type] / cpu.total).toFixed(2)}%`).join('\n')}`).join('\n\n')}` : ''}
`.trim();
};

exports.templateContentText = this.templateContentText = (senderName, says) => {
	return `\n\t\t\t\t\t*Hai ${senderName + ' ' + says} 💫*\n\n\n\t\t\t\t\t*_WhatsApp Bot Multi Device_*\n\n\t\t\t\t\t\t_Powered By Farhannn_`;
};

exports.templateFooterText = this.templateFooterText = () => {
	return `𝐓𝐡𝐚𝐧𝐤𝐬 𝐓𝐨:\n• 𝐀𝐝𝐢𝐰𝐚𝐣𝐬𝐡𝐢𝐧𝐠\n• 𝐖𝐚𝐧𝐬\n• 𝐋𝐨𝐩𝐢𝐚\n• 𝐆𝐚𝐥𝐮𝐧𝐠\n• 𝐋𝐨𝐫𝐝 𝐌𝐚𝐧𝐨\t\t\t\t`;
};

const fs = require("fs");

let file = require.resolve(__filename);
fs.watchFile(file, () => {
	fs.unwatchFile(file);
	console.log(`Update ${__filename}`);
	delete require.cache[file];
	require(file);
});