// --- 基礎設定 ---
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

// --- 核心函式 ---

/**
 * 根據 boardData 陣列，重新繪製整個棋盤的 UI
 */
function createBoard() {
    gameBoard.innerHTML = ''; 
    boardData.forEach((row, rowIndex) => {
        row.forEach((pieceChar, colIndex) => {
            const square = document.createElement('div');
            square.classList.add('square');
            square.dataset.row = rowIndex;
            square.dataset.col = colIndex;
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
            gameBoard.appendChild(square);
        });
    });
}

/**
 * 處理整個棋盤的點擊事件 (事件委派)
 */
function handleBoardClick(event) {
    const square = event.target.closest('.square');
    if (!square) return;

    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);

    const pieceChar = boardData[row][col];

    if (selectedPiece) {
        if (isValidMove(selectedPiece.row, selectedPiece.col, row, col)) {
            movePiece(selectedPiece.row, selectedPiece.col, row, col);
            selectedPiece = null; 
            isRedTurn = !isRedTurn;
        } else if (pieceChar && isRedPiece(pieceChar) === isRedTurn) {
            selectPiece(row, col);
        } else {
            selectedPiece = null;
            createBoard();
        }
    } 
    else if (pieceChar) {
        if (isRedPiece(pieceChar) === isRedTurn) {
            selectPiece(row, col);
        }
    }
}

/**
 * 裁判函式：判斷移動是否合法
 */
function isValidMove(fromRow, fromCol, toRow, toCol) {
    const pieceChar = boardData[fromRow][fromCol];
    const targetChar = boardData[toRow][toCol];
    
    if (targetChar && isRedPiece(targetChar) === isRedPiece(pieceChar)) return false;

    switch (pieceChar) {
        case '兵':
            if (fromRow > 4) { return (toRow === fromRow - 1 && toCol === fromCol); } 
            else { return (toRow === fromRow - 1 && toCol === fromCol) || (toRow === fromRow && Math.abs(toCol - fromCol) === 1); }
        case '卒':
            if (fromRow < 5) { return (toRow === fromRow + 1 && toCol === fromCol); } 
            else { return (toRow === fromRow && Math.abs(toCol - fromCol) === 1) || (toRow === fromRow + 1 && toCol === fromCol); }
        case '俥': case '車':
            if (fromRow !== toRow && fromCol !== toCol) return false;
            if (fromRow === toRow) {
                const startCol = Math.min(fromCol, toCol) + 1; const endCol = Math.max(fromCol, toCol);
                for (let col = startCol; col < endCol; col++) { if (boardData[fromRow][col]) return false; }
            } else {
                const startRow = Math.min(fromRow, toRow) + 1; const endRow = Math.max(fromRow, toRow);
                for (let row = startRow; row < endRow; row++) { if (boardData[row][fromCol]) return false; }
            }
            return true;
        case '傌': case '馬':
            const rowDiff = Math.abs(fromRow - toRow); const colDiff = Math.abs(fromCol - toCol);
            if (!((rowDiff === 1 && colDiff === 2) || (rowDiff === 2 && colDiff === 1))) return false;
            if (rowDiff === 2) { if (boardData[fromRow + (toRow - fromRow) / 2][fromCol]) return false; } 
            else { if (boardData[fromRow][fromCol + (toCol - fromCol) / 2]) return false; }
            return true;
        case '相':
            if (toRow < 5) return false;
            if (!(Math.abs(fromRow - toRow) === 2 && Math.abs(fromCol - toCol) === 2)) return false;
            if (boardData[(fromRow + toRow) / 2][(fromCol + toCol) / 2]) return false;
            return true;
        case '象':
            if (toRow > 4) return false;
            if (!(Math.abs(fromRow - toRow) === 2 && Math.abs(fromCol - toCol) === 2)) return false;
            if (boardData[(fromRow + toRow) / 2][(fromCol + toCol) / 2]) return false;
            return true;
        case '仕':
            if (!(toCol >= 3 && toCol <= 5 && toRow >= 7 && toRow <= 9)) return false;
            if (!(Math.abs(fromRow - toRow) === 1 && Math.abs(fromCol - toCol) === 1)) return false;
            return true;
        case '士':
            if (!(toCol >= 3 && toCol <= 5 && toRow >= 0 && toRow <= 2)) return false;
            if (!(Math.abs(fromRow - toRow) === 1 && Math.abs(fromCol - toCol) === 1)) return false;
            return true;
        case '帥':
            if (!(toCol >= 3 && toCol <= 5 && toRow >= 7 && toRow <= 9)) return false;
            if (!(Math.abs(fromRow - toRow) + Math.abs(fromCol - toCol) === 1)) return false;
            return true;
        case '將':
            if (!(toCol >= 3 && toCol <= 5 && toRow >= 0 && toRow <= 2)) return false;
            if (!(Math.abs(fromRow - toRow) + Math.abs(fromCol - toCol) === 1)) return false;
            return true;
        case '炮': case '砲':
            if (fromRow !== toRow && fromCol !== toCol) return false;
            let screenCount = 0;
            if (fromRow === toRow) {
                const startCol = Math.min(fromCol, toCol) + 1; const endCol = Math.max(fromCol, toCol);
                for (let col = startCol; col < endCol; col++) { if (boardData[fromRow][col]) screenCount++; }
            } else {
                const startRow = Math.min(fromRow, toRow) + 1; const endRow = Math.max(fromRow, toRow);
                for (let row = startRow; row < endRow; row++) { if (boardData[row][fromCol]) screenCount++; }
            }
            if (targetChar) { return screenCount === 1; } 
            else { return screenCount === 0; }
        default:
            return false;
    }
}

// --- 輔助函式 ---
function isRedPiece(char) {
    const redPieces = ['帥', '仕', '相', '俥', '傌', '炮', '兵'];
    return redPieces.includes(char);
}
function selectPiece(row, col) {
    selectedPiece = { row, col };
    createBoard();
}
function movePiece(fromRow, fromCol, toRow, toCol) {
    boardData[toRow][toCol] = boardData[fromRow][fromCol];
    boardData[fromRow][fromCol] = '';
    createBoard();
}

// --- 事件監聽與初始執行 ---
gameBoard.addEventListener('click', handleBoardClick);
createBoard();