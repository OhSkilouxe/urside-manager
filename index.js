const Discord = require("discord.js");
const client = new Discord.Client();
const prefix = "e!";
const config = require("./config.json");
const fs = require("fs");

client.on("ready", () => {
  client.user.setActivity("🕵️ » 01110011 01101111 01101111 01101110", {
    type: "STREAMING",
    url: "https://www.twitch.tv/fayslechat"
  });
  console.log("on");
});

let points = JSON.parse(fs.readFileSync("./points.json", "utf8"));

const { promisify } = require("util");
const write = promisify(fs.writeFile);
var saveEnCours = false;

async function save(file) {
  switch (file) {
    case "points":
      if (!saveEnCours) {
        saveEnCours = true;
        await write("points.json", JSON.stringify(points, null, "\t"));
        saveEnCours = false;
      }
      break;
    default:
      return console.log("Fichier de sauvegarde introuvable !");
  }
}

client.on("message", async function(message) {
  if (message.author.bot || !message.guild) return;
  let args = message.content
    .split(" ")
    .slice(1)
    .join(" ");

  if (points[message.author.id] === undefined) {
    points[message.author.id] = 0;
    save("points");
  }
  if (message.content.toLowerCase().startsWith(prefix + "give")) {
    if (!message.member.hasPermission("ADMINISTRATOR")) return;
    console.log("test give");
    let mention = message.mentions.users.first();
    if (!mention)
      return erreur(
        "Vous devez mentionner un utilisateur !",
        message.channel.id
      );
    if (points[mention.id] === undefined)
      return erreur(
        "Cet utilisateur ne peut pas avoir de points !",
        message.channel.id
      );
    let nb = args.slice(22);
    if (!nb || isNaN(nb))
      return erreur(
        "Vous devez entrer le nombre de points à ajouter !",
        message.channel.id
      );
    points[mention.id] += Number(nb);
    save("points");
    message.channel.send({
      embed: {
        color: 0x00f919,
        author: {
          name: nb > 1 ? "Points ajoutés !" : "Point ajouté !",
          icon_url: client.user.displayAvatarURL
        },
        description:
          mention +
          " a reçu " +
          nb +
          (nb > 1 ? " points " : " point ") +
          "de la part de " +
          message.author +
          " !"
      }
    });
  }

  if (message.content.toLowerCase().startsWith(prefix + "show")) {
    let mention = message.mentions.users.first() || message.author;
    if (!points[mention.id] === undefined)
      return erreur("Cet utilisateur n'a aucun points !", message.channel.id);
    message.channel.send({
      embed: {
        color: 0x00f919,
        author: {
          name: "Points de " + mention.username,
          icon_url: client.user.displayAvatarURL
        },
        description:
          mention +
          " a actuellement " +
          points[mention.id] +
          (points[mention.id] > 1 ? " points !" : " point !")
      }
    });
  }
});

function erreur(message, channel) {
  client.channels.get(channel).send({
    embed: {
      color: 0xfe2e2e,
      description: message
    }
  });
}

client.login(config.token);
