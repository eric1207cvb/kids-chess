const gameBoard = document.getElementById('xiangqi-board');

let boardData = [
    ['車', '馬', '象', '士', '將', '士', '象', '馬', '車'],
    ['', '', '', '', '', '', '', '', ''],
    ['', '砲', '', '', '', '', '', '砲', ''],
    ['卒', '', '卒', '', '卒', '', '卒', '', '卒'],
    ['', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', ''],
    ['兵', '', '兵', '', '兵', '', '兵', '', '兵'],
    ['', '炮', '', '', '', '', '', '炮', ''],
    ['', '', '', '', '', '', '', '', ''],
    ['俥', '傌', '相', '仕', '帥', '仕', '相', '傌', '俥']
];

let selectedPiece = null; 
let isRedTurn = true; 

function createBoard() {
    gameBoard.innerHTML = ''; 
    boardData.forEach((row, rowIndex) => {
        row.forEach((pieceChar, colIndex) => {
            const square = document.createElement('div');
            square.classList.add('square');
            square.style.gridRowStart = rowIndex + 1;
            square.style.gridColumnStart = colIndex + 1;

            if (pieceChar) {
                const piece = document.createElement('div');
                piece.classList.add('piece');
                piece.innerText = pieceChar;
                const isRed = isRedPiece(pieceChar);
                piece.classList.add(isRed ? 'red-piece' : 'black-piece');
                if (selectedPiece && selectedPiece.row === rowIndex && selectedPiece.col === colIndex) {
                    piece.classList.add('selected');
                }
                square.appendChild(piece);
            }
            square.addEventListener('click', () => handleSquareClick(rowIndex, colIndex));
            gameBoard.appendChild(square);
        });
    });
}

function handleSquareClick(row, col) {
    if (row === 4 || row === 5) return;
    const pieceChar = boardData[row][col];
    if (selectedPiece) {
        const targetIsRed = pieceChar ? isRedPiece(pieceChar) : null;
        const selectedIsRed = isRedPiece(boardData[selectedPiece.row][selectedPiece.col]);
        if (targetIsRed === selectedIsRed && pieceChar) {
            selectPiece(row, col);
        } else {
            movePiece(selectedPiece.row, selectedPiece.col, row, col);
            selectedPiece = null; 
            isRedTurn = !isRedTurn; 
        }
    } else if (pieceChar) {
        const isRed = isRedPiece(pieceChar);
        if (isRed === isRedTurn) {
            selectPiece(row, col);
        }
    }
}

function isRedPiece(char) {
    const redPieces = ['帥', '仕', '相', '俥', '傌', '炮', '兵'];
    return redPieces.includes(char);
}

function selectPiece(row, col) {
    selectedPiece = { row, col };
    createBoard();
}

function movePiece(fromRow, fromCol, toRow, toCol) {
    const pieceToMove = boardData[fromRow][fromCol];
    boardData[toRow][toCol] = pieceToMove;
    boardData[fromRow][fromCol] = '';
    createBoard();
}

createBoard();