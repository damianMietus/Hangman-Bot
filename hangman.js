const Discord = require('Discord.js');
const bot = new Discord.Client();
const TOKEN = 'Token goes here'
const util = require('./util.json');

var prefix = '!';
/* Author: Varion
*  https://github.com/discordjs/discord.js/issues/2287
*  Special thanks to Varion for providing this list of unicode friendly number emojis */
var reaction_numbers = ["\u0030\u20E3","\u0031\u20E3","\u0032\u20E3","\u0033\u20E3","\u0034\u20E3","\u0035\u20E3", "\u0036\u20E3","\u0037\u20E3","\u0038\u20E3","\u0039\u20E3"]

var topics = ["", "Countries", "Capital Cities", "Food", "Movies", "Bands",
 "Animals", "Computers", "Compound Words", "Pokémon"];

//var botOn = false;
var gameOn = false;
var nonAlphaFlag = false;
var randNum;

// Hangman Game Variables
var playWord = "";
var boardWord = "";
var damage = 0;
var guessedList = "";
var solvedList = []

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
    .setTitle("Topic Select")
    .setDescription("Please select a topic by typing in '!topic <number>' ")
    .addField(reaction_numbers[1]+" "+topics[1], "-----------")
    .addField(reaction_numbers[2]+" "+topics[2], "-----------")
    .addField(reaction_numbers[3]+" "+topics[3], "-----------")
    .addField(reaction_numbers[4]+" "+topics[4], "-----------")
    .addField(reaction_numbers[5]+" "+topics[5], "-----------")
    .addField(reaction_numbers[6]+" "+topics[6], "-----------")
    .addField(reaction_numbers[7]+" "+topics[7], "-----------")
    .addField(reaction_numbers[8]+" "+topics[8], "-----------")
    .addField("⭕ Dynamic Topics ⭕", "These topics contain subcategories and are accessed by:\n '!topic <subcategory>")
    .addField("⭕ Pokemon", "Kanto, Johto, Hoenn, Sinnoh, Unova, Kalos, Alola ")
    .setThumbnail("https://cdn3.iconfinder.com/data/icons/brain-games/128/Hangman-Game.png")
    .setColor('1BB2F3')

var helpBoard = new Discord.RichEmbed()
    .setTitle("Help")
    .addField("!topic <number>", "Starts a game with the chosen topic")
    .addField("!topic <category>", "Starts a game with the chosen dynamic topic")
    .addField("!guess <letter>", "Guesses a letter in the game")
    .addField("!solve '<string>'", "Attempts to end the game by solving the word")
    .setColor('0022FF')

bot.on('message', function(message) {
    var msg = message.content;
    msg = msg.toLowerCase();
    if (msg == prefix+'topic'){
        if (gameOn === false){
          //Display the topic menu
            message.channel.sendEmbed(mainMenu)
        } else {
            bm = badManners();
            message.reply("The game is already on, "+bm)
                .then(msg => {
                    msg.delete(8000)
                })
        }
    }

    if (msg == prefix+'help'){
        message.channel.sendEmbed(helpBoard)
    }

    //Take guesses here
    if (gameOn === true){

        // Check if it is alhpabetical, eight characaters long, is not !solve, and starts with prefix
        if (msg.includes("guess") && alphaCheck(msg.charAt(7)) !== null && msg.length === 8 && msg.charAt(0) === prefix && !msg.includes("!solve")){
            console.log('Yup, its legal!');
            var guess = msg.charAt(7);
            //Check if duplicate
            var doubleFlag = checkIfGuessed(guessedList, guess);
            if (doubleFlag === true){
                bm = badManners();
                message.reply("That has been guessed, "+bm)
                    .then(msg => {
                        msg.delete(8000)
                    })                
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

                        helperBoard
                            .setTitle("Congratulations!")
                            .setFooter("You Win!")
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

                    // If dead, print the "You Lose" screen and reset game
                    if (damage === 6){

                        correctAnswer = "The correct answer was: "+playWord;

                        helperBoard
                            .setTitle("You Lose!")
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
            //Make sure there are only two quotes in the solve string
            if (findTwoQuotes(msg) === true){
                var solv = msg.split("!solve ");
                solv = solv + '';
                solv = solv.split("'")[1];
                console.log("Solv ="+solv);

                alreadyGuessed = false;

                //Check if guess is only alphabetical
                var c = 0;
                nonAlphaFlag = true;
                for (c = 0; c < solv.length; c++){
                    if (solv.charAt(c) === null){
                        nonAlphaFlag = false;
                    }
                }
                //Check if it was already guessed
                for (c = 0; c < solvedList.length; c++){
                    console.log("guesslist at c = "+solvedList[c])
                    if (solv == solvedList[c]){
                        alreadyGuessed = true;
                    }
                }
                //It passed. Proceed to check
                if (nonAlphaFlag === true && alreadyGuessed === false){
                    //Continue by checking length of solv + length of command + the two quotes
                    // This will make sure it only accepts valid input <!solve ''> this ahs 9 chars
                    if ((solv.length + 9) === msg.length){
                        //Check if winner
                        if (solv === playWord){
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
                            solvedList.push(solv)

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
                } else {
                    //Invalid input: Already guessed
                    if (alreadyGuessed === true){
                        bm = badManners();
                        message.reply("This has been guessed, "+bm)
                            .then(msg => {
                                msg.delete(8000)
                            })
                    } else {
                    //Invalid input: non Alpha solve
                    bm = badManners();
                    message.reply("Guesses should only contain alphabetical characters, "+bm)
                        .then(msg => {
                            msg.delete(8000)
                        })
                    }  
                }
            } else {
                //Invalid input: Unrecognized input
                message.reply("Guesses should be alphabetical.")
                //Check if Invalid Guess
                if (msg.startsWith(prefix+"guess " && alphaCheck(msg.charAt(7)) != null) ){
                    message.reply("Guesses should be alphabetical.")   
                }
            }
        }
        if (msg.startsWith(prefix+"guess ")  && (alphaCheck(msg.charAt(7)) == null || msg.length !== 8  )){
            message.reply("Guesses should be a single alphabetical character.")   
        }
    }
    // Topic selection check
    if (/*botOn === true && */gameOn === false){
        if ((msg == prefix+'topic 1') || (msg == prefix+'topic one') || (msg == prefix+'topic '+reaction_numbers[1]) || (msg == prefix+'topic countries')){
            console.log('Playing Countries')
            playWord = getPlayWord(util.country, util.numCountry);
            console.log(playWord);
            gameOn = true;

            helperTopic = helperTopic + topics[1];
        } else if ((msg == prefix+'topic 2') || (msg == prefix+'topic two') || (msg == prefix+'topic '+reaction_numbers[2]) || (msg == prefix+'topic capital cities')){
            console.log('Playing Cities')
            playWord = getPlayWord(util.capitalcity, util.numCities);
            console.log(playWord);
            gameOn = true;

            helperTopic = helperTopic + topics[2];
        } else if ((msg == prefix+'topic 3') || (msg == prefix+'topic three') || (msg == prefix+'topic '+reaction_numbers[3]) || (msg == prefix+'topic food')){
            console.log('Playing Foods')
            playWord = getPlayWord(util.food, util.numFoods);
            console.log(playWord);
            gameOn = true;

            helperTopic = helperTopic + topics[3];
        } else if ((msg == prefix+'topic 4') || (msg == prefix+'topic four') || (msg == prefix+'topic '+reaction_numbers[4]) || (msg == prefix+'topic movies')){
            console.log('Playing Movies')
            playWord = getPlayWord(util.movie, util.numMovies);
            console.log(playWord);
            gameOn = true;

            helperTopic = helperTopic + topics[4];
        } else if ((msg == prefix+'topic 5') || (msg == prefix+'topic five') || (msg == prefix+'topic '+reaction_numbers[5]) || (msg == prefix+'topic bands')){
            console.log('Playing Bands')
            playWord = getPlayWord(util.band, util.numBands);
            console.log(playWord);
            gameOn = true;

            helperTopic = helperTopic + topics[5];
        } else if ((msg == prefix+'topic 6') || (msg == prefix+'topic six') || (msg == prefix+'topic '+reaction_numbers[6]) || (msg == prefix+'topic animals')){
            console.log('Playing Animals')
            playWord = getPlayWord(util.animal, util.numAnimals);
            console.log(playWord);
            gameOn = true;

            helperTopic = helperTopic + topics[6];
        } else if ((msg == prefix+'topic 7') || (msg == prefix+'topic seven') || (msg == prefix+'topic '+reaction_numbers[7]) || (msg == prefix+'topic computers')){
            console.log('Playing Computers')
            playWord = getPlayWord(util.computer, util.numComputers);
            console.log(playWord);
            gameOn = true;

            helperTopic = helperTopic + topics[7];
        } else if ((msg == prefix+'topic 8') || (msg == prefix+'topic eight') || (msg == prefix+'topic '+reaction_numbers[8]) || (msg == prefix+'topic compound words')){
            console.log('Playing Compound Word')
            playWord = getPlayWord(util.compoundWord, util.numComputers);
            console.log(playWord);
            gameOn = true;

            helperTopic = helperTopic + topics[8];
        // Dynamic Topic
        } else if (msg.startsWith(prefix+"topic")){
            if ((msg == "!topic pokemon kanto") || (msg == "!topic kanto")){
                randNum = Math.floor(Math.random() * 151);
                playWord = util.pokemon[randNum]
                console.log(playWord);
                gameOn = true;
     
                helperTopic = helperTopic + topics[9]+" (Kanto)";
            } else if ((msg == "!topic pokemon johto") || (msg == "!topic johto")){
                randNum = Math.floor(Math.random() * 100) + 151;
                playWord = util.pokemon[randNum]
                console.log(playWord);
                gameOn = true;
     
                helperTopic = helperTopic + topics[9]+" (Johto)";
            } else if ((msg == "!topic pokemon hoenn") || (msg == "!topic hoenn")){
                randNum = Math.floor(Math.random() * 136) + 251;
                playWord = util.pokemon[randNum]
                console.log(playWord);
                gameOn = true;
     
                helperTopic = helperTopic + topics[9]+" (Hoenn)";
            } else if ((msg == "!topic pokemon sinnoh") || (msg == "!topic sinnoh")){
                 randNum = Math.floor(Math.random() * 107) + 386;
                 playWord = util.pokemon[randNum]
                 console.log(playWord);
                 gameOn = true;
     
                helperTopic = helperTopic + topics[9]+" (Sinnoh)";
            } else if ((msg == "!topic pokemon unova") || (msg == "!topic unova")){
                randNum = Math.floor(Math.random() * 156) + 492;                 
                playWord = util.pokemon[randNum]
                console.log(playWord);
                gameOn = true;
     
                helperTopic = helperTopic + topics[9]+" (Unova)";
            } else if ((msg == "!topic pokemon kalos") || (msg == "!topic kalos")){
                console.log(util.pokemon[720]+" and "+util.pokemon[721])
                randNum = Math.floor(Math.random() * 72) +649;                 
                playWord = util.pokemon[randNum]
                console.log(playWord);
                gameOn = true;
     
                helperTopic = helperTopic + topics[9]+" (Kalos)";
            } else if ((msg == "!topic pokemon alola") || (msg == "!topic alola")){
                console.log(util.pokemon[806]+"Is pokemon")
                randNum = Math.floor(Math.random() * 86) +721;                 
                playWord = util.pokemon[randNum]
                console.log(playWord);
                gameOn = true;
     
                helperTopic = helperTopic + topics[9]+" (Alola)";
            } else if (msg == prefix+'topic pokemon'){
                playWord = getPlayWord(util.pokemon, util.numPokemon);
                console.log(playWord);
                gameOn = true;
    
                helperTopic = helperTopic + topics[9];
            } 
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
});

bot.login(TOKEN);

// Functions
function getPlayWord(topic, numWords){
    var randomNum = Math.floor(Math.random() * numWords);
    return topic[randomNum];
}

function resetGame(){
    //botOn = false;
    gameOn = false;
    playWord = "";
    boardWord = "";
    damage = 0;
    guessedList = "";
    guessedList = []

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
