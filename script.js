function startGame() {
    const td = document.querySelector(".td");
    const board = document.querySelector("#board");
    const levels = document.querySelector("#levels");
    let flagCnt = document.querySelector(".flagCnt");
    const closeBtn = document.querySelector(".close-btn");
    const startBtn = document.querySelector(".start-btn");
    const cheatMode = document.querySelector(".cheat-mode");
    const playground = document.querySelector(".playground");
    const cheatToggle = document.querySelector(".cheatToggle");
    const homeContainer = document.querySelector(".home-container");
    const mainContainer = document.querySelector(".main-container");

    let revealCnt = 0;
    let level = "easy";
    let boardSize = 10;
    let mineCount = 5;
    let flagsCount = mineCount;
    let mines = [];
    let gameOver = false;
    // Update grid when difficulty level changes
    levels.addEventListener("change", (event) => {
        level = event.target.value;
        boardSize = levelMapper[level].boardSize
        mineCount = levelMapper[level].mineCount;
        flagsCount = mineCount;

        // Clear previous game state
        boardArr = []; 
        mines = [];
        gameOver = false;
        flagCnt.innerText = flagsCount
        
        generateGrid(boardSize);
        addMine();

        

        // if(event.target.value === "easy"){
        //     flagCnt.innerText = 10;
        // }else if(event.target.value === "medium"){
        //     flagCnt.innerText = 40;
        // }else if(event.target.value === "hard"){
        //     flagCnt.innerText = 99;
        // }
    });

    let boardArr = [];
    startBtn.addEventListener('click', ()=>{
        console.log("start game")
        homeContainer.style.display = "none";
        mainContainer.style.display = "flex";
    })
    
    closeBtn.addEventListener('click', ()=>{
        console.log("close game")
        location.reload();
        mainContainer.style.display = "none";
        homeContainer.style.display = "flex";
    })
    
    cheatMode.addEventListener('click', (e) => {
        if (e.target.innerText.includes("Off")) {
            cheatToggle.innerText = "On";
            revealAllCells();
        } else {
            cheatToggle.innerText = "Off";
            hideAllCells();
        }
    });
    
    function revealAllCells() {
        for (let r = 0; r < boardSize; r++) {
            for (let c = 0; c < boardSize; c++) {
                const cell = boardArr[r][c];
                if (!cell.classList.contains("revealed")) {
                    const id = `${r}-${c}`;
                    if (mines.includes(id)) {
                        cell.innerText = "💣";
                    } else {
                        const adjacentMines = countAdjacentMines(r, c);
                        cell.innerText = adjacentMines > 0 ? adjacentMines : "";
                    }
                    cell.classList.add("cheat-revealed");
                }
            }
        }
    }
    
    function hideAllCells() {
        for (let r = 0; r < boardSize; r++) {
            for (let c = 0; c < boardSize; c++) {
                const cell = boardArr[r][c];
                if (cell.classList.contains("cheat-revealed")) {
                    cell.innerText = "";
                    cell.classList.remove("cheat-revealed");
                }
            }
        }
    }
    
    function countAdjacentMines(r, c) {
        let cnt = 0;
        for (let i = r - 1; i <= r + 1; i++) {
            for (let j = c - 1; j <= c + 1; j++) {
                if (i < 0 || j < 0 || i >= boardSize || j >= boardSize) continue;
                if (mines.includes(`${i}-${j}`)) cnt++;
            }
        }
        return cnt;
    }
    
     // Function to generate the grid based on selected difficulty
    function generateGrid(size) {
        playground.innerHTML = ""; // Clear any existing grid
        const table = document.createElement("table");

        for (let i = 0; i < size; i++) {
            const row = document.createElement("tr");
            let rowArray = [];
            for (let j = 0; j < size; j++) {
                const cell = document.createElement("td");
                cell.id = i + "-" + j;
                // Set dynamic cell dimensions based on grid size
                cell.style.width = `calc(100% / ${size})`;
                cell.style.height = `calc(100% / ${size})`;
                cell.addEventListener('click', revealBox);
                cell.addEventListener('contextmenu', flagBox);
                rowArray.push(cell);
                row.appendChild(cell);
            }
            table.appendChild(row);
            boardArr.push(rowArray);
        }
        playground.appendChild(table);
        addMine();
    }

    function addMine() {
        while(mines.length < mineCount){
            const r = Math.floor(Math.random() * boardSize)
            const c = Math.floor(Math.random() * boardSize)
            let id = r + "-" + c;
            if(!mines.includes(id)){
                mines.push(id)
            }
        }
        console.log(mines)
    }

    function revealBox(e) {
        const box = e.currentTarget;
        const values = e.currentTarget.id.split("-");
        const r = parseInt(values[0]);
        const c = parseInt(values[1]);

        if (box.classList.contains("flag")) {
            return;
        }

        if (box.classList.contains("revealed")) {
            console.log("yes contains revealed")
            box.removeEventListener("click", revealBox);
            return;
        }

        checkMine(box);
        revealCount(r, c);
    }

    function flagBox(e){
        e.preventDefault();
        const box = e.currentTarget;
        if(box.classList.contains("revealed")) return;
        if(box.classList.contains("flag")){
            box.classList.remove("flag");
            box.innerText = "";
            flagsCount++;
            flagCnt.innerText = flagsCount;
        }else{
            box.classList.add("flag");
            box.innerText = "🚩";
            flagsCount--;
            flagCnt.innerText = flagsCount;
        }
    } 

    function checkMine(box) {
        console.log(box)
        if(mines.includes(box.id)){
            gameOver = true;
            revealAllCells();
            GameOver();
        }
    }

    function revealCount(r, c) {
        if(r < 0 || c < 0 || r >= boardSize || c >= boardSize || gameOver || boardArr[r][c].classList.contains("revealed")) return;

        boardArr[r][c].classList.add("revealed");
        revealCnt++;

        let cnt = countAdjacentMines(r, c);

        // Trigger shake animation if the count is zero
        if (cnt === 0) {
            const table = document.querySelector(".playground table");
            table.classList.add("shake");

            setTimeout(() => {
                table.classList.remove("shake");
            }, 500);
        }

        if(cnt > 0){
            boardArr[r][c].innerText = cnt;
        }else{
            for(let i = r-1; i<= r+1; i++){
                for (let j = c-1; j <= c+1; j++) {
                    if(i < 0 || j < 0 || i >= boardSize || j >= boardSize) continue;
                    revealCount(i, j);
                }
            }
        }

        if (revealCnt === boardSize * boardSize - mineCount) {
            gameOver = true;
            revealAllCells();
            YouWon();
        }
    }
    
    function GameOver(){
        console.log("You Lost");
        const div = document.createElement("div");
        div.className = "loser-screen"

        const loserText = document.createElement("h2")
        loserText.innerText = "---- GAME OVER ----"

        const playAgain = document.createElement("div");
        playAgain.className = "playAgain";
        const p = document.createElement("p");
        p.innerText = "Play Again";
        const restart = document.createElement("img")
        restart.src = "assests/restart.svg";
        restart.className = "restart";
        playAgain.append(p, restart);

        playAgain.addEventListener("click", ()=>{
            location.reload();
        })

        div.append(loserText, playAgain);
        playground.append(div);
    }

    function YouWon(){
        console.log("You won");
        const div = document.createElement("div");
        div.className = "winner-screen"

        const winnerText = document.createElement("h2")
        winnerText.innerText = "---- 🎊 YOU WON 🎊 ----"

        const playAgain = document.createElement("div");
        playAgain.className = "playAgain";
        const p = document.createElement("p");
        p.innerText = "Play Again";
        const restart = document.createElement("img")
        restart.src = "assests/restart.svg";
        restart.className = "restart";
        playAgain.append(p, restart);

        playAgain.addEventListener("click", ()=>{
            location.reload();
        })

        div.append(winnerText, playAgain);
        playground.append(div);
    }

    generateGrid(boardSize)
    addMine();
}



document.addEventListener("DOMContentLoaded", startGame());

const levelMapper = {
    easy : {
        boardSize : 10,
        mineCount : 5,
    },
    medium : {
        boardSize : 15,
        mineCount : 12,
    }, hard :{
        boardSize : 20,
        mineCount : 25,
    }
}