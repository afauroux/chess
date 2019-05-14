function ij2coord(i,j){
    return 'abcdefgh'[j]+(8-i)
}
function coord2ij(coord){
    return [8-parseInt(coord[1]),'abcdefgh'.split('').indexOf(coord[0]) ]
}
function makepiece(piece, color){
    let elem = document.createElement("img")
    elem.className = 'piece'
    elem.src = `images/Chess_${piece}${color}t60.png`
    elem.alt = `${piece}${color}`
    elem.draggable = true;
    elem.ondragstart = function(e){

        e.dataTransfer.setData("piece", piece);
        e.dataTransfer.setData("color", color);
        e.dataTransfer.setData("from", elem.parentElement.id);
       
    }
    return elem
}
function drawBoard(){
    for (let i=0; i<8; i++){
        for (let j=0; j<8; j++){
        let div = document.createElement("div");
        div.style.backgroundColor = (i+ j%2)%2  ? "var(--black)" : "var(--white)"
        div.id = ij2coord(i,j)
        div.ondrop = function(e){
            console.log('drop')
            e.preventDefault();
            let piece = e.dataTransfer.getData("piece");
            let color = e.dataTransfer.getData("color");
            let from = e.dataTransfer.getData("from");
            let m = chess.move({from:from, to:this.id})
        
            if(m!=null){ // it was an ok move !
                drawPieces()
            }
   
            //e.target.appendChild(makepiece(piece, color));
        }
        div.ondragover = function(e){
            e.preventDefault();
        }
        board.appendChild(div);
        cells[i][j] = div
        }
    }
}
function clearBoard(){
    for(let i=0; i<8; i++){
        for(let j=0; j<8; j++){
            let p = cells[i][j].querySelector('.piece')
            if(p != null){
                cells[i][j].removeChild(p)
            }
        }
    }
            
}
function drawPieces(){
    clearBoard()
    checkStatus()
    let board = chess.board()
    for(let i=0; i<8; i++){
        for(let j=0; j<8; j++){
            let b = board[i][j]
            if(board[i][j]!= null){
                cells[i][j].appendChild(makepiece(b.type, b.color))
            }
        }
    }
   
    window.location.hash = chess.fen().replace(/ /g,'_');
}
function checkStatus(){
    let stat = document.querySelector('.status')
    stat.textContent = (chess.turn() == 'w' ? 'White' : 'Black' )+" to move";
    let hist = chess.history()
    
    let i = 0;
    let s = ""
    while(i<hist.length){
        s += hist[i].padEnd(5," ")
        if(i%2){
            s+="\n"
        }else{
            s+=" "
        }
        i++;
    }
   
    
    document.querySelector('.history').value = s;

}
function reset(){
    chess.reset()
    drawPieces()
}
function undo(){
    chess.undo()
    drawPieces()
}


// ----------------------------------- MAIN -----------------------
let fen = window.location.hash.replace(/_/g, ' ')
let chess  = new Chess();
if(fen != ""){
    debugger
    chess.load(fen)
}

        
let board = document.querySelector(".chessboard");
let cells = [[],[],[],[],[],[],[],[]];

drawBoard()
drawPieces()
