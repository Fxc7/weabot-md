"use strict";

const pino = require("pino");
const CFonts = require("cfonts");
const chalk = require("chalk");
const ora = require("ora");
const os = require("os");
const {
	default: makeWASocket,
	DisconnectReason,
	useSingleFileAuthState
} = require("@adiwajshing/baileys-md");

const { state, saveState } = useSingleFileAuthState("./sessions.json");

// start a connection
const started = () => {
	const xcoders = makeWASocket({
		version: [2, 2147, 16],
		logger: pino({ level: "fatal" }),
		printQRInTerminal: true,
		auth: state
	});
	console.clear();
	CFonts.say("WEABOT|MD", {
		font: "block",
		align: "center",
		gradient: ["red", "magenta"],
		background: "transparent",
		letterSpacing: 1,
		lineHeight: 1,
		space: true,
		maxLength: 0,
		independentGradient: true,
		transitionGradient: false,
		env: "node"
	});
	CFonts.say("WhatsApps BOT Multi Device", {
		font: "console",
		align: "center",
		gradient: ["red", "magenta"]
	});
	const spin = ora({ discardStdin: true, text: chalk.bold.green.italic("Connecting"), spinner: "aesthetic" });

	xcoders.ev.on("messages.upsert", async function (m) {
		const x = m.messages[0];
		if (!x.message) return;
		if (x.key && x.key.remoteJid == "status@broadcast") return;
		x.message = (Object.keys(x.message)[0] === "ephemeralMessage") ? x.message.ephemeralMessage.message : x.message;
		require("./handlerMessage")(xcoders, x);
	});
	xcoders.ev.on("connection.update", async function (update) {
		//connection configuration update
		if(update.lastDisconnect === undefined) {
			// update connection when qr session is unknown or not exist
			if (update.qr !== undefined) spin.warn(chalk.bold.green.italic("Scan This QR Code\n"));

			//connection when reconnecting or just starting
			if (update.connection === "connecting") spin.start();

			//connection when open or connected in whatsapp device
			if (update.connection === "open") spin.succeed(chalk.bold.green.italic(`Connected\n`));
		} else {
			//connection when it is closed or the network is interrupted
			if (update.connection === "close") return started();
			spin.fail(chalk.bold.green.italic("WhatsApp WEB Disconnected"));
		}
	});

	// listen for when the auth credentials is updated
	xcoders.ev.on("creds.update", saveState);
	return xcoders;
};
started();