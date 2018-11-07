const Discord = require('Discord.js');
const bot = new Discord.Client();
const TOKEN = 'Token goes here'
const util = require('./util.json');

var prefix = '!';
/* Author: Varion
*  https://github.com/discordjs/discord.js/issues/2287
*  Special thanks to Varion for providing this list of unicode friendly number emojis */
var reaction_numbers = ["\u0030\u20E3","\u0031\u20E3","\u0032\u20E3","\u0033\u20E3","\u0034\u20E3","\u0035\u20E3", "\u0036\u20E3","\u0037\u20E3","\u0038\u20E3","\u0039\u20E3"]

var topics = ["", "Countries", "Cities", "Food"];

var botOn = false;
var gameOn = false;
var nonAlphaFlag = false;

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
"+---------+\n |                |\nO               |\n                  |\n                  |\n                  |\n                  |\n                  |\n===============\n",
"+---------+\n |                |\nO               |\n |                |\n                  |\n                  |\n                  |\n                  |\n===============\n",
"+---------+\n  |               |\n O              |\n/|               |\n                  |\n                  |\n                  |\n                  |\n===============\n",
"+---------+\n  |               |\n O              |\n/|\\            |\n                  |\n                  |\n                  |\n                  |\n===============\n",
"+---------+\n  |               |\n O              |\n/|\\            |\n/                |\n                  |\n                  |\n                  |\n===============\n",
"+---------+\n  |               |\n O              |\n/|\\            |\n/ \\            |\n                  |\n                  |\n                  |\n===============\n"
]
var healthCode = ["0022FF", "00EFFF", "2BFF00", "F7FF00", "FF7700", "FF0000", "000000"]

console.log("I am on!");

var bm ="";
var correctAnswer = "";
var mainMenu = new Discord.RichEmbed()
    .setTitle("Hangman Bot")
    .setDescription("Please select a topic by typing in '!topic <number>' ")
    .addField(reaction_numbers[1]+" "+topics[1], "-----------")
    .addField(reaction_numbers[2]+" "+topics[2], "-----------")
    .addField(reaction_numbers[3]+" "+topics[3], "-----------")
    .setThumbnail("https://cdn3.iconfinder.com/data/icons/brain-games/128/Hangman-Game.png")
    .setColor('1BB2F3')


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
            bm = badManners();
            message.reply("The game is already on, "+bm)
                .then(msg => {
                    msg.delete(8000)
                })
        }
    }

    //Take guesses here
    if (gameOn === true){

       // console.log("msg is:"+msg.content+"| length: "+msg.length+"| charat(8): "+msg.charAt(7));

        // Check if it is alhpabetical, eight characaters long, is not !solve, and starts with prefix
        if (msg.includes("guess") && alphaCheck(msg.charAt(7)) !== null && msg.length === 8 && msg.charAt(0) === prefix && !msg.includes("!solve")){
            console.log('Yup, its legal!');
            var guess = msg.charAt(7);
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
                        .setColor(healthCode[damage])
                    message.channel.sendEmbed(gameBoard);



                    //Check if winner
                    if (boardWord === playWord){
                        message.channel.send("Conglaturation, you're winner!");

                        helperBoard
                            .setTitle("Conglaturation!")
                            .setFooter("You're Winner!")
                            .setColor(healthCode[damage])
                        message.channel.sendEmbed(helperBoard);

                        resetGame();
                    } else {
                        //Print normally
                        helperBoard
                            .setTitle(helperTopic)
                            .setFooter(missList)
                            .setColor(healthCode[damage])
                        message.channel.sendEmbed(helperBoard);
                    }

                } else {
                // Missed! Deduct health and display board
                    damage = damage + 1;
                    missList = missList + " " + guess;

                    //Print the board
                    gameBoard
                        .setTitle(hangASCII[damage])
                        .setFooter(boardWord)
                        .setColor(healthCode[damage])
                    message.channel.sendEmbed(gameBoard);

                    // If dead, print "You're Loser" screen and reset game
                    if (damage === 6){
                        //message.channel.send("You're Loser!");

                        correctAnswer = "The correct answer was: "+playWord;

                        helperBoard
                            .setTitle("You're Loser!")
                            .setFooter(correctAnswer)
                            .setColor(healthCode[damage])
                        message.channel.sendEmbed(helperBoard);

                        console.log('RESET THE GAME!');
                        resetGame();
                    } else {
                    // Not dead, print normal helper board
                    helperBoard
                        .setTitle(helperTopic)
                        .setFooter(missList)
                        .setColor(healthCode[damage])
                    message.channel.sendEmbed(helperBoard);
                    }

                }

            }

        } else if (msg.includes("solve") && msg.charAt(0) === prefix && msg.charAt(msg.length-1) == "'"){
            console.log('This is a string solve. Here is msg: '+msg)
            //Make sure there are only two quotes in the solve string
            if (findTwoQuotes(msg) === true){
                var solv = msg.split("!solve ");
                solv = solv + '';
                solv = solv.split("'")[1];
                console.log("Solv ="+solv);

                //Check if guess is only alphabetical
                var c = 0;
                nonAlphaFlag = true;
                for (c = 0; c < solv.length; c++){
                    if (solv.charAt(c) === null){
                        nonAlphaFlag = false;
                    }
                }
                //It passed. Proceed to check
                if (nonAlphaFlag === true){
                    //Continue by checking length of solv + length of command + the two quotes
                    // This will make sure it only accepts valid input <!solve ''> this ahs 9 chars
                    if ((solv.length + 9) === msg.length){

                        //Check if winner
                        if (solv === playWord){
                            //message.channel.send("Conglaturation, you're winner!");
                            boardWord = playWord;

                            gameBoard
                                .setTitle(hangASCII[damage])
                                .setFooter(boardWord)
                                .setColor(healthCode[damage])
                            message.channel.sendEmbed(gameBoard);
    
                            helperBoard
                                .setTitle("Conglaturation!")
                                .setFooter("You're Winner!")
                                .setColor(healthCode[damage])
                            message.channel.sendEmbed(helperBoard);

                            resetGame();
                        } else {
                            // Missed! Deduct health and display board
                            damage = damage + 1;
                            missList = missList + " '" + solv+"'";

                            //Print the board
                            gameBoard
                                .setTitle(hangASCII[damage])
                                .setFooter(boardWord)
                                .setColor(healthCode[damage])
                            message.channel.sendEmbed(gameBoard);

                            if (damage === 6){

                                correctAnswer = "The correct answer was: "+playWord;

                                helperBoard
                                    .setTitle("You're Loser!")
                                    .setFooter(correctAnswer)
                                    .setColor(healthCode[damage])
                                message.channel.sendEmbed(helperBoard);

                                message.channel.send("You're Loser!");
                                console.log('RESET THE GAME!');
                                resetGame();
                            } else {
                            helperBoard
                                .setTitle(helperTopic)
                                .setFooter(missList)
                                .setColor(healthCode[damage])
                            message.channel.sendEmbed(helperBoard);
                            }
                        }
                    }


                    //console.log("stringLen = "+msg.length+"Its this string: "+msg);
                    //console.log("SolvLen = "+solv.length);

                } else {
                    //Invalid input: non Alpha solve    
                }



            } else {
                //Invalid input: Unrecognized input
            }


            
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
                .setColor(healthCode[damage])
            message.channel.sendEmbed(gameBoard);

            helperBoard
                .setTitle(helperTopic)
                .setFooter(missList)
                .setColor(healthCode[damage])
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

function findTwoQuotes(string){
    var j;
    var quotesFound = 0;
    for (j = 0; j < string.length; j++){
        if (string.charAt(j) === "'"){
            quotesFound = quotesFound+1;
        }
    }

    if (quotesFound === 2){
        return true;
    } else {
        return false;
    }
}

function badManners(){
    const badManner = ["loser!", "idiot!", "bozo!", "moron!", "knucklehead!", "Einstein!", "nincompoop!", "nitwit!", "fool!"];
    var rand = Math.floor(Math.random() * 9);
    return badManner[rand];
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
