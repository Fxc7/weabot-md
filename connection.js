const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

function start(connect) {
	let args = [path.join(connect), ...process.argv.slice(2)];
	let p = spawn(process.argv[0], args, {
		stdio: ['inherit', 'inherit', 'inherit', 'ipc']
	}).on('message', data => {
		console.log('[RECEIVED]', data);
		switch (data) {
			case 'reset':
				p.kill();
				start.apply(this, arguments);
				break;
			case 'uptime':
				p.send(process.uptime());
				break;
		}
	}).on('error', e => {
			console.error(e);
			fs.watchFile(args[0], () => {
				start();
				fs.unwatchFile(args[0]);
			});
		});
}
start('./index');