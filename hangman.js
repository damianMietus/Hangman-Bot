const Discord = require('Discord.js');
const bot = new Discord.Client();
const TOKEN = '/* goes here */'
const util = require('./util.json');

var prefix = '!';
/* Author: Varion
*  https://github.com/discordjs/discord.js/issues/2287
*  Special thanks to Varion for providing this list of unicode friendly number emojis */
var reaction_numbers = ["\u0030\u20E3","\u0031\u20E3","\u0032\u20E3","\u0033\u20E3","\u0034\u20E3","\u0035\u20E3", "\u0036\u20E3","\u0037\u20E3","\u0038\u20E3","\u0039\u20E3"]

var topics = ["", "Countries", "Cities", "Food"];

var botOn = false;
var gameOn = false;

// Hangman Game Variables
var playWord = "";
var boardWord = "";
var damage = 0;
var guessedList = "";

var missList = "Missed Guesses: ";
var helperTopic = "Topic: ";
var helperBoard = new Discord.RichEmbed();
var gameBoard = new Discord.RichEmbed();
var hangASCII = [
"+---------+\n |                |\n                  |\n                  |\n                  |\n                  |\n                  |\n                  |\n===============\n",
"+---------+\n |                |\n O              |\n                  |\n                  |\n                  |\n                  |\n                  |\n===============\n",
"+---------+\n |                |\n O              |\n  |               |\n                  |\n                  |\n                  |\n                  |\n===============\n",
"+---------+\n |                |\n O              |\n/|               |\n                  |\n                  |\n                  |\n                  |\n===============\n",
"+---------+\n |                |\n O              |\n/|\\            |\n                  |\n                  |\n                  |\n                  |\n===============\n",
"+---------+\n |                |\n O              |\n/|\\            |\n/                |\n                  |\n                  |\n                  |\n===============\n",
"+---------+\n |                |\n O              |\n/|\\            |\n/ \\            |\n                  |\n                  |\n                  |\n===============\n"
]

console.log("I am on!");

var mainMenu = new Discord.RichEmbed()
    .setTitle("Hangman Bot")
    .setDescription("Please select a topic by typing in '!topic <number>' ")
    .addField(reaction_numbers[1]+" "+topics[1], "-----------")
    .addField(reaction_numbers[2]+" "+topics[2], "-----------")
    .addField(reaction_numbers[3]+" "+topics[3], "-----------")
    .setThumbnail("https://cdn3.iconfinder.com/data/icons/brain-games/128/Hangman-Game.png")


bot.on('message', function(message) {
    var msg = message.content;
    msg = msg.toLowerCase();
    //console.log(msg)
    if (msg == prefix+'play'){
        if (botOn === false){
          //Display the topic menu
            message.channel.sendEmbed(mainMenu)
            botOn = true;
        } else {
          const badManner = ["loser!", "idiot!", "bozo!"];
          var rand = Math.floor(Math.random() * 3);
            message.reply("The game is already on, "+badManner[rand])
                .then(msg => {
                    msg.delete(8000)
                })
        }
    }

    //Take guesses here
    if (gameOn === true){
        // Check if it is alhpabetical, two characaters long, and starts with prefix
        if (alphaCheck(msg.charAt(1)) !== null && msg.length === 2 && msg.charAt(0) === prefix){
            console.log('Yup, its legal!');
            var guess = msg.charAt(1);
            //Check if duplicate
            var doubleFlag = checkIfGuessed(guessedList, guess);
            if (doubleFlag === true){
                console.log('Already been guessed.');
            } else {
                //Check if it exists in string
                var l;
                var passFlag = false;
                for (l = 0; l < playWord.length; l++){
                    if (playWord[l] === guess){
                        boardWord = replaceAt(boardWord, l, guess);
                        passFlag = true;
                    }
                }

                guessedList = guessedList + guess;

                // If this is true, it was correct. Display board and check if winner
                if (passFlag === true){
                    //Print the board
                    gameBoard
                        .setTitle(hangASCII[damage])
                        .setFooter(boardWord)
                    message.channel.sendEmbed(gameBoard);

                    helperBoard
                        .setTitle(helperTopic)
                        .setFooter(missList)
                    message.channel.sendEmbed(helperBoard);

                    //Check if winner
                    if (boardWord === playWord){
                        message.channel.send("Conglaturation, you're winner!");
                        resetGame();
                    }

                } else {
                // Missed! Deduct health and display board
                    damage = damage + 1;
                    missList = missList + " " + guess;

                    //Print the board
                    gameBoard
                        .setTitle(hangASCII[damage])
                        .setFooter(boardWord)
                    message.channel.sendEmbed(gameBoard);

                    helperBoard
                        .setTitle(helperTopic)
                        .setFooter(missList)
                    message.channel.sendEmbed(helperBoard);

                    if (damage === 6){
                        message.channel.send("You're Loser!");
                        console.log('RESET THE GAME!');
                        resetGame();
                    }

                }

            }

        } else if (msg.includes("solve") && msg.charAt(0) === prefix && msg.charAt(msg.length) == "'"){
            console.log('This is a string solve. Here is msg: '+msg)

            var solv = msg.split("!solve ");
            solv = solv + '';
            solv = solv.split("'")[1];
            console.log("Solv ="+solv);
        }
        

    }




    // Topic selection check
    if (botOn === true && gameOn === false){
        if ((msg == prefix+'topic 1') || (msg == prefix+'topic one') || (msg == prefix+'topic '+reaction_numbers[1])){
            console.log('Playing Countries')
            playWord = getPlayWord(util.country, util.numCountry);
            console.log(playWord);
            gameOn = true;

            helperTopic = helperTopic + topics[1];


        } else if ((msg == prefix+'topic 2') || (msg == prefix+'topic two') || (msg == prefix+'topic '+reaction_numbers[2])){
            console.log('Playing Cities')
        } else if ((msg == prefix+'topic 3') || (msg == prefix+'topic three') || (msg == prefix+'topic '+reaction_numbers[3])){
            console.log('Playing Foods')
        }
        //generate the board
        if (gameOn === true){

            boardWord = generateBoardWord(playWord);
            gameBoard
                .setTitle(hangASCII[damage])
                .setColor('GREEN')
                .setFooter(boardWord)
            message.channel.sendEmbed(gameBoard);

            helperBoard
                .setTitle(helperTopic)
                .setFooter(missList)
            message.channel.sendEmbed(helperBoard);
        }
    }

    


    /* Command deleter
    if (msg.charAt(0) === "!"){
        message.delete(3000)
        .catch();
    }
    */
});


bot.login(TOKEN);


// Functions
function getPlayWord(topic, numWords){
    var randomNum = Math.floor(Math.random() * numWords);
    return topic[randomNum];
}

function resetGame(){
    botOn = false;
    gameOn = false;
    playWord = "";
    boardWord = "";
    damage = 0;
    guessedList = "";

    missList = "Missed Guesses: ";
    helperTopic = "Topic: ";
}
//All functions below this comment were repurposed from my Oatmeal Bot
function generateBoardWord(gameWord){
    var i;
    var bWord = "";
    for (i = 0; i < gameWord.length; i++){
        if (gameWord[i] === ' '){
            bWord = bWord + ' ';
        } else {
            bWord = bWord + '-';
        }
    }

    return bWord;
}

function alphaCheck(input){
    return input.match("^[a-zA-Z]+$");    
}

function checkIfGuessed(gList, guess){
    var j;
    var doubleFlag = false;
    if (gList.length !== undefined){
        for (j = 0; j < gList.length; j++){
            if (gList[j] === guess){
                doubleFlag = true;
            }
        }
    }

    return doubleFlag;
}

/** Author of this Function: Efe Naci Giray
 * Retrieved from https://gist.github.com/efenacigiray/9367920
 * November 5 2018
 */ 
function replaceAt(string, index, replace) {
    return string.substring(0, index) + replace + string.substring(index + 1);
}
