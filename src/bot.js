if (process.env.NODE_VER !== "production") require("dotenv").config();

const { Client } = require("discord.js");
const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(require("../firebase.json")),
});
let db = admin.firestore();

const bot = new Client();

bot.on("ready", () => {
  console.log("Bot is running!");
});

bot.on("message", async (message) => {
  db.collection("guilds")
    .doc(message.guild.id)
    .get()
    .then(async (data) => {
      data = await data.data();

      data.functions.forEach((e) => {
        if (e.type !== "onMessage") return;
        else {
          if (!message.content.startsWith(data.prefix)) return;
          if (message.author.bot) return;
          if (message.channel.type == "dm") return;

          let args = message.content.slice(1);
          if (args.includes(" ")) args = args.split(" ");
          else args = [args];

          let cmd = undefined;

          data.functions.forEach((e) => {
            if (e.trigger === args[0].toLowerCase()) cmd = e;
            console.log(e.trigger, args[0]);
          });

          if (!cmd) return;
          else {
            let exec = cmd.exec.split("then");

            for (let i = 0; i < exec.length; i++) {
              if (i.startsWith("sendMessage")) {
                let msgToSend = exec[0].split("'");
                message.channel.send();
              }
            }
          }
        }
      });
    });
});

bot.on("guildCreate", (guild) => {
  db.collection("guilds")
    .doc(guild.id)
    .create({
      id: guild.id,
      prefix: "=",
      functions: [
        {
          name: "Example Command",
          trigger: "test",
          type: "onMessage",
          exec: "sendMessage 'Hello world!' then return",
        },
      ],
    });
});

bot.login(process.env.TOKEN);
