let startCounter = false;
let selectedNumber;
let gameTable;
let click;
let backgroundMusic;
let playerName;
let toplist = [];

function start() {
    playerName = document.getElementById("name").value;
    if(playerName === "") return;

    fetchGame("easy");
    document.getElementById("start").style.display = "none";
}

function setEventListeners(){
    for(let i = 1; i < 10; i++) {
        document.getElementById(i + "").addEventListener("click", event => {selectNumber(event.target)});
    }
    let cells = document.getElementsByTagName("td");
    for(let i = 0; i<cells.length; i++){
        cells[i].addEventListener("click", event => insertNumber(event.target));
        cells[i].addEventListener("mouseenter", event => hover(event.target));
    }
    
}

function hover(element){
    if(!selectedNumber) return;
    let res = element.className.split(" ");

    let row = parseInt(res[0].charAt(res[0].length - 1));
    let column = parseInt(res[1].charAt(res[1].length - 1));
    let partition = parseInt(res[2].charAt(res[2].length - 1));

    if(res[3] !== "hoverable" && res[3] !== "immutable" && !isInvalid(row, column, partition)){
        element.classList.add("hoverable");
    }

    if(res[3] === "hoverable"){
        if(isInvalid(row, column, partition)){
            element.classList.remove("hoverable");
        }
    }
}

function insertNumber (element){
    if(!selectedNumber) return;
    let res = element.className.split(" ");

    let row = parseInt(res[0].charAt(res[0].length - 1));
    let column = parseInt(res[1].charAt(res[1].length - 1));
    let partition = parseInt(res[2].charAt(res[2].length - 1));
    let immutable = res[3];

    if(immutable === "immutable" || isInvalid(row, column, partition)){
        return;
    }

    element.innerHTML = selectedNumber;
    gameTable[row][column] = parseInt(element.innerHTML);
    
    checkAvailableNumbers();
    colorOccurances();
    click.play();
    checkEnd();
}

function checkEnd(){    
    for(let i = 0; i < 9; i++){
        for(let j = 0; j < 9; j++){
            if(gameTable[i][j] === 0) {
                return;
            }
        }
    }

    startCounter = false;
    let score = Math.round((10/sec) * 100);
    $("#scores").append(`<tr><td>${playerName}</td><td>${score}</td></tr>`);
    resetNumbers();
    document.getElementById("start").style.display = "inherit";
    document.getElementById("main").style.display = "none";
    document.getElementById("grid").innerHTML = "";
    backgroundMusic.stop();
    selectedNumber = null;
    sec = 0;
    document.getElementById("seconds").innerHTML="00";
    document.getElementById("minutes").innerHTML="00";
}

function isInvalid(i, j, k){
    let row = document.getElementsByClassName(`row${i}`)
    let column = document.getElementsByClassName(`column${j}`)
    let partition = document.getElementsByClassName(`partition${k}`)

    for(let element in row){
        if(row[element].innerText === selectedNumber){
            return true;
        }
    }

    for(let element in column){
        if(column[element].innerText === selectedNumber){
            return true;
        }
    }

    for(let element in partition){
        if(partition[element].innerText === selectedNumber){
            return true;
        }
    }

    return false;
}

function checkAvailableNumbers(){
    counter = new Array(10);
    for(let i = 0; i< 10; i++){
        counter[i] = 0;
    }

    gameTable.forEach(row => {
        row.forEach(element => {
            counter[element]++;
        })
    });

    for(let i = 1; i< 10; i++){
        let number = document.getElementById(i);
        if(counter[i] >= 9){
            number.style.visibility = "hidden";
            if(selectedNumber === i.toString()){
                selectedNumber = null;
                resetNumbers();
            }
        }
        else{
            number.style.visibility = "visible";
        }
    }
}

function selectNumber(element){
    resetNumbers();

    selectedNumber = element.innerText;

    //set selected
    element.style.borderColor = "red";
    element.style.color = "red";

    colorOccurances();
    click.play();
}

function colorOccurances(){
    //color every occurance in grid
    for(let i = 0; i < 9; i++){
        for(let j = 0; j < 9; j++){
            if(gameTable[i][j] === parseInt(selectedNumber)){
                let td = document.getElementsByClassName(`row${i} column${j}`);
                td[0].style.color = "red";
            }
        }
    }
}

function resetNumbers(){
    //reset others
    for(let i = 1; i < 10; i++) {
        document.getElementById(i + "").style.borderColor = "#252526";
        document.getElementById(i + "").style.color = "#252526";
    }

    for(let i = 0; i < 9; i++){
        for(let j = 0; j < 9; j++){
            let td = document.getElementsByClassName(`row${i} column${j}`);
            td[0].style.color = "#252526";
        }
    }
}

function updateGameField(array) {
    gameTable = array.board;
    console.log(gameTable);
    let game = document.getElementById("grid");
    
    for(let i = 0; i < 9; i++){
        numbers = getNumbersByRow(array, i);
        game.innerHTML += `
        <tr class="row-${i}">`

        for(let j = 0; j < 9; j++){
            $(`.row-${i}`).append(`<td class=\"row${i} column${j} partition${getPartitionByIndices(i,j)} ${numbers[j] === " " ? "" : "immutable"}\">${numbers[j]}</td>`);
        }
    }
}

function getPartitionByIndices(i, j){
    let array = [[0,1,2],
                 [3,4,5],
                 [6,7,8]];

    return array[parseInt(i/3, 10)][parseInt(j/3, 10)];
}

function getNumbersByRow(array, i) {
    result = [];

    for(let j = 0; j < 9; j++){
        result.push(array.board[i][j] === 0 ? " " : array.board[i][j]);
    }
    return result;
}


let sec = 0;
function pad ( val ) { return val > 9 ? val : "0" + val; }
setInterval( function(){
    if(startCounter)
    document.getElementById("seconds").innerHTML=pad(++sec%60);
    document.getElementById("minutes").innerHTML=pad(parseInt(sec/60,10));
}, 1000);


function fetchGame(difficulty){
    let result;

    fetch(`https://sugoku.herokuapp.com/board?difficulty=${difficulty}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    .then(response => response.json())
    .then(array => updateGameField(array))
    .then(() => setEventListeners())
    .then(() => {
        document.getElementById("main").style.display = "inherit";

        backgroundMusic = new sound("background.mp3");
        click = new sound("click.mp3", false);

        backgroundMusic.play();
        startCounter = true;
    })
    .catch(console.warn);

    return result;
}

function sound(src, loop=true) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.muted = "";
    this.sound.loop = loop;
    this.sound.volume = 0.05;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
      this.sound.play();
    }
    this.stop = function(){
      this.sound.pause();
    }
  }