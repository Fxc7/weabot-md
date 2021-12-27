const fs = require("fs");

global.apikeys = "Your Apikeys";
global.prefix = "!";
global.multiprefix = false;
global.nonprefix = false;
global.watermark = "𝕎𝕙𝕒𝕥𝕤𝔸𝕡𝕡 𝔹𝕆𝕋 𝕄𝕦𝕝𝕥𝕚 𝔻𝕖𝕧𝕚𝕔𝕖";
global.packname = "Created By";
global.authorname = "Farhannn";
global.language = true;
global.ownerNumber = ["0@s.whatsapp.net"];
global.thumbnail = fs.readFileSync("./images/thumbnail.jpg");
global.responseEN = {
  isCreators: "*Owner Only*",
  success: "*Success...*",
  error: {
    request: "*Oops, Your request error '_'*",
    url: "*Invalid Input url*"
  },
  process: "```[⏳] Waiting Processed```",
};
global.responseID = {
  isCreators: "*Khusus Owner*",
  success: "*Sukses...*",
  error: {
    request: "*Ups, permintaan Anda error '_'*",
    url: "*URL Yang Anda Masukkan Tidak Valid*"
  },
  process: "```[⏳] Mohon Tunggu Permintaan Anda Diproses```",
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(`Update ${__filename}`);
  delete require.cache[file];
  require(file);
});
