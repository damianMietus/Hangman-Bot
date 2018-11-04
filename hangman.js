const Discord = require('Discord.js');
const bot = new Discord.Client();
const TOKEN = ''

var botOn = false;
/* Author: Varion
*  https://github.com/discordjs/discord.js/issues/2287
*  Special thanks to Varion for providing this list of unicode friendly number emojis */
var reaction_numbers = ["\u0030\u20E3","\u0031\u20E3","\u0032\u20E3","\u0033\u20E3","\u0034\u20E3","\u0035\u20E3", "\u0036\u20E3","\u0037\u20E3","\u0038\u20E3","\u0039\u20E3"]

console.log("I am on!");

var mainMenu = new Discord.RichEmbed()
    .setTitle("Hangman Bot")
    .setDescription("Please select a topic")
    .addField(reaction_numbers[1]+" Countries", "-----------")
    .addField(reaction_numbers[2]+" Cities", "-----------")
    .addField(reaction_numbers[3]+" Food", "-----------")
    .setThumbnail("https://cdn3.iconfinder.com/data/icons/brain-games/128/Hangman-Game.png")

bot.on('message', function(message){
    if (message.content == 'Hello'){
        message.reply("Hello, how are you?");
    }
});

bot.on('message', async function(message) {
    if (message.content == 'play'){
        if (botOn === false){
            //message.channel.sendEmbed(mainMenu);

            //  MUST be async or else reactions are added in random order
            message.channel.send({embed: mainMenu}).then(async function (embedMessage) {
                await embedMessage.react(reaction_numbers[1]);
                await embedMessage.react(reaction_numbers[2]);
                await embedMessage.react(reaction_numbers[3]);
            });



            botOn = true;
        } else {
            message.reply("The game is already on, loser!")
                .then(msg => {
                    msg.delete(8000)
                })
        }
    }
});


/*
const collector = message.createReactionCollector((reaction, user) => 
    user.id === message.author.id &&
    reaction.emoji.name === reaction_numbers[1] ||
    reaction.emoji.name === reaction_numbers[2] ||
    reaction.emoji.name === reaction_numbers[3]
).once("collect", reaction => {
    const chosen = reaction.emoji.name;
    if(chosen === reaction_numbers[1]){
        console.log("You picked one")
    }else if(chosen === reaction_numbers[2]){
        console.log("You picked two")
    }else if (chosen === reaction_numbers[3]){
        console.log("You picked three")
    }
    collector.stop();
});
*/


bot.login(TOKEN);
