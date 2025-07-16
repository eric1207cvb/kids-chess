// script.js (最終合併修正版 V2)

// 教學功能物件
const tutorial = {
    moveDescriptions: {
        '帥': '【帥】在九宮內直走或橫走，每次限走一格。',
        '將': '【將】在九宮內直走或橫走，每次限走一格。',
        '仕': '【仕】在九宮內沿對角線走，每次限走一格。',
        '士': '【士】在九宮內沿對角線走，每次限走一格。',
        '相': '【相】走「田」字，且不能過河。俗稱「相飛田」。',
        '象': '【象】走「田」字，且不能過河。俗稱「象飛田」。',
        '俥': '【俥】直走或橫走，路徑上不能有棋子。',
        '車': '【車】直走或橫走，路徑上不能有棋子。',
        '傌': '【傌】走「日」字，路徑上不能有棋子擋住。俗稱「馬走日」。',
        '馬': '【馬】走「日」字，路徑上不能有棋子擋住。俗稱「馬走日」。',
        '炮': '【炮】移動時同「車」，但吃子時需隔一個棋子。俗稱「炮翻山」。',
        '砲': '【砲】移動時同「車」，但吃子時需隔一個棋子。俗稱「炮翻山」。',
        '兵': '【兵】過河前只能前進，過河後可前進或橫走，但不能後退。',
        '卒': '【卒】過河前只能前進，過河後可前進或橫走，但不能後退。'
    },
    getPieceDescription(piece) {
        if (!piece) return null;
        const pieceChar = game.state.boardData[piece.row][piece.col];
        return this.moveDescriptions[pieceChar] || null;
    },
    showLegalMoves(piece) {
        this.clearHighlights();
        if (!piece) return;
        const fromRow = piece.row;
        const fromCol = piece.col;
        for (let toRow = 0; toRow < 10; toRow++) {
            for (let toCol = 0; toCol < 9; toCol++) {
                const moveResult = game.isMoveLegal(fromRow, fromCol, toRow, toCol, game.state.boardData);
                if (moveResult.legal) {
                    const targetSquare = game.elements.board.querySelector(`[data-row='${toRow}'][data-col='${toCol}']`);
                    if (targetSquare) {
                        const dot = document.createElement('div');
                        dot.className = 'valid-move-dot';
                        targetSquare.appendChild(dot);
                    }
                }
            }
        }
    },
    clearHighlights() {
        const allDots = game.elements.board.querySelectorAll('.valid-move-dot');
        allDots.forEach(dot => dot.remove());
    }
};

// 主要遊戲物件
const game = {
    state: {
        boardData: [],
        selectedPiece: null,
        isRedTurn: true,
        isGameOver: false,
        moveHistory: [],
        initialBoard: [
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
        ],
        aiIsEnabled: false,
        aiIsRed: false
    },
    elements: {
        board: document.getElementById('xiangqi-board'),
        info: document.getElementById('game-info'),
        restartBtn: document.getElementById('restart-button'),
        undoBtn: document.getElementById('undo-button'),
        pvpBtn: document.getElementById('pvp-button'),
        pveBtn: document.getElementById('pve-button')
    },

    init() {
        this.resetGame();
        this.elements.board.addEventListener('click', this.handleBoardClick.bind(this));
        this.elements.restartBtn.addEventListener('click', this.resetGame.bind(this));
        this.elements.undoBtn.addEventListener('click', this.undoMove.bind(this));
        this.elements.pvpBtn.addEventListener('click', this.startPvpMode.bind(this));
        this.elements.pveBtn.addEventListener('click', this.startAiMode.bind(this));
    },
    
    resetGame() {
        console.log("1. 正在執行 resetGame...");
        this.state.boardData = this.state.initialBoard.map(row => [...row]);
        this.state.selectedPiece = null;
        this.state.isRedTurn = true;
        this.state.isGameOver = false;
        this.state.moveHistory = [];
        this.renderBoard();
        this.checkGameState();
        tutorial.clearHighlights();
    },

    handleBoardClick(event) {
        if (this.state.isGameOver) return;
        const square = event.target.closest('.square');
        if (!square) return;
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        const pieceChar = this.state.boardData[row][col];
        if (this.state.selectedPiece) {
            const fromRow = this.state.selectedPiece.row;
            const fromCol = this.state.selectedPiece.col;
            if (fromRow === row && fromCol === col) {
                this.selectPiece(null);
                return;
            }
            const moveResult = this.isMoveLegal(fromRow, fromCol, row, col, this.state.boardData);
            if (moveResult.legal) {
                this.movePiece(fromRow, fromCol, row, col);
            } else if (pieceChar && this.isRedPiece(pieceChar) === this.state.isRedTurn) {
                this.selectPiece(row, col);
            } else {
                this.showWarning(moveResult.reason);
            }
        } else if (pieceChar && this.isRedPiece(pieceChar) === this.state.isRedTurn) {
            this.selectPiece(row, col);
        }
    },

    selectPiece(row, col) {
        if (row === null) {
            this.state.selectedPiece = null;
            this.renderBoard();
            tutorial.clearHighlights();
            this.checkGameState();
        } else {
            this.state.selectedPiece = { row, col };
            this.renderBoard();
            tutorial.showLegalMoves(this.state.selectedPiece);
            const description = tutorial.getPieceDescription(this.state.selectedPiece);
            if (description) {
                this.updateInfo(description);
            }
        }
    },

    movePiece(fromRow, fromCol, toRow, toCol) {
        const movedPiece = this.state.boardData[fromRow][fromCol];
        const capturedPiece = this.state.boardData[toRow][toCol];
        this.state.moveHistory.push({ fromRow, fromCol, toRow, toCol, movedPiece, capturedPiece });
        this.state.boardData[toRow][toCol] = movedPiece;
        this.state.boardData[fromRow][fromCol] = '';
        this.state.selectedPiece = null;
        this.state.isRedTurn = !this.state.isRedTurn;
        tutorial.clearHighlights();
        this.renderBoard();
        this.checkGameState();
        if (this.state.aiIsEnabled && this.state.isRedTurn === this.state.aiIsRed && !this.state.isGameOver) {
            setTimeout(() => this.triggerAI(), 500);
        }
    },

    undoMove() {
        if (this.state.isGameOver || this.state.moveHistory.length === 0) return;
        const lastMove = this.state.moveHistory.pop();
        this.state.boardData[lastMove.fromRow][lastMove.fromCol] = lastMove.movedPiece;
        this.state.boardData[lastMove.toRow][lastMove.toCol] = lastMove.capturedPiece;
        this.state.isRedTurn = !this.state.isRedTurn;
        this.state.isGameOver = false;
        this.state.selectedPiece = null;
        tutorial.clearHighlights();
        this.renderBoard();
        this.checkGameState();
    },

    triggerAI() {
        if (this.state.isGameOver) return;
        console.log("輪到 AI，正在呼叫 AI 大腦...");
        const bestMove = chessAI.findBestMove(
            this.state.boardData,
            this.state.aiIsRed,
            this.isMoveLegal.bind(this)
        );
        if (bestMove) {
            this.movePiece(bestMove.fromRow, bestMove.fromCol, bestMove.toRow, bestMove.toCol);
        } else {
            console.log("AI 找不到合法的棋步，可能遊戲已經結束。");
        }
    },

    startPvpMode() {
        console.log("切換至：雙人對弈模式");
        this.state.aiIsEnabled = false;
        this.resetGame();
        this.updateInfo("雙人對弈：紅方先行");
    },

    startAiMode() {
        console.log("切換至：人機對戰模式");
        this.state.aiIsEnabled = true;
        this.state.aiIsRed = false;
        this.resetGame();
        this.updateInfo("人機對戰：請紅方先行");
    },

    isMoveLegal(fromRow, fromCol, toRow, toCol, board) {
        if (!this.isValidMove(fromRow, fromCol, toRow, toCol, board)) {
            return { legal: false, reason: 'basic' };
        }
        const tempBoard = board.map(row => [...row]);
        tempBoard[toRow][toCol] = tempBoard[fromRow][fromCol];
        tempBoard[fromRow][fromCol] = '';
        if (this.isKingFacingKing(tempBoard)) {
            return { legal: false, reason: 'king_face' };
        }
        const movingPlayerIsRed = this.isRedPiece(board[fromRow][fromCol]);
        if (this.isKingInCheck(movingPlayerIsRed, tempBoard)) {
            return { legal: false, reason: 'self_check' };
        }
        return { legal: true, reason: null };
    },

    isValidMove(fromRow, fromCol, toRow, toCol, board) {
        const pieceChar = board[fromRow][fromCol];
        const targetChar = board[toRow][toCol];
        if (targetChar && this.isRedPiece(targetChar) === this.isRedPiece(pieceChar)) return false;
        switch (pieceChar) {
            case '兵': return (fromRow > 4) ? (toRow === fromRow - 1 && toCol === fromCol) : ((toRow === fromRow - 1 && toCol === fromCol) || (toRow === fromRow && Math.abs(toCol - fromCol) === 1));
            case '卒': return (fromRow < 5) ? (toRow === fromRow + 1 && toCol === fromCol) : ((toRow === fromRow + 1 && toCol === fromCol) || (toRow === fromRow && Math.abs(toCol - fromCol) === 1));
            case '俥': case '車': if (fromRow !== toRow && fromCol !== toCol) return false; if (fromRow === toRow) { for (let c = Math.min(fromCol, toCol) + 1; c < Math.max(fromCol, toCol); c++) if (board[fromRow][c]) return false; } else { for (let r = Math.min(fromRow, toRow) + 1; r < Math.max(fromRow, toRow); r++) if (board[r][fromCol]) return false; } return true;
            case '傌': case '馬': const rowDiff = Math.abs(fromRow - toRow), colDiff = Math.abs(fromCol - toCol); if (!((rowDiff === 1 && colDiff === 2) || (rowDiff === 2 && colDiff === 1))) return false; if (rowDiff === 2) { if (board[fromRow + (toRow - fromRow) / 2][fromCol]) return false; } else { if (board[fromRow][fromCol + (toCol - fromCol) / 2]) return false; } return true;
            case '相': if (toRow < 5) return false; if (!(Math.abs(fromRow - toRow) === 2 && Math.abs(fromCol - toCol) === 2)) return false; if (board[(fromRow + toRow) / 2][(fromCol + toCol) / 2]) return false; return true;
            case '象': if (toRow > 4) return false; if (!(Math.abs(fromRow - toRow) === 2 && Math.abs(fromCol - toCol) === 2)) return false; if (board[(fromRow + toRow) / 2][(fromCol + toCol) / 2]) return false; return true;
            case '仕': if (!(toCol >= 3 && toCol <= 5 && toRow >= 7 && toRow <= 9)) return false; return Math.abs(fromRow - toRow) === 1 && Math.abs(fromCol - toCol) === 1;
            case '士': if (!(toCol >= 3 && toCol <= 5 && toRow >= 0 && toRow <= 2)) return false; return Math.abs(fromRow - toRow) === 1 && Math.abs(fromCol - toCol) === 1;
            case '帥': case '將': const palace = (pieceChar === '帥') ? { r_min: 7, r_max: 9 } : { r_min: 0, r_max: 2 }; if (!(toCol >= 3 && toCol <= 5 && toRow >= palace.r_min && toRow <= palace.r_max)) return false; return Math.abs(fromRow - toRow) + Math.abs(fromCol - toCol) === 1;
            case '炮': case '砲': if (fromRow !== toRow && fromCol !== toCol) return false; let screenCount = 0; if (fromRow === toRow) { for (let c = Math.min(fromCol, toCol) + 1; c < Math.max(fromCol, toCol); c++) if (board[fromRow][c]) screenCount++; } else { for (let r = Math.min(fromRow, toRow) + 1; r < Math.max(fromRow, toRow); r++) if (board[r][fromCol]) screenCount++; } return targetChar ? screenCount === 1 : screenCount === 0;
            default: return false;
        }
    },
    isKingInCheck(kingIsRed, board) { const kingChar = kingIsRed ? '帥' : '將'; let kingPos = null; for (let r = 0; r < 10; r++) for (let c = 0; c < 9; c++) if (board[r][c] === kingChar) kingPos = { r, c }; if (!kingPos) return false; for (let r = 0; r < 10; r++) { for (let c = 0; c < 9; c++) { const piece = board[r][c]; if (piece && this.isRedPiece(piece) !== kingIsRed) { if (this.isValidMove(r, c, kingPos.r, kingPos.c, board)) return true; } } } return false; },
    isKingFacingKing(board) { const kings = []; for (let r = 0; r < 10; r++) for (let c = 0; c < 9; c++) if (board[r][c] === '將' || board[r][c] === '帥') kings.push({ r, c }); if (kings.length < 2) return false; const [k1, k2] = kings; if (k1.c !== k2.c) return false; for (let r = Math.min(k1.r, k2.r) + 1; r < Math.max(k1.r, k2.r); r++) if (board[r][k1.c]) return false; return true; },
    hasAnyValidMoves(isRed, board) {
        for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 9; c++) {
                if (board[r][c] && this.isRedPiece(board[r][c]) === isRed) {
                    for (let tr = 0; tr < 10; tr++) {
                        for (let tc = 0; tc < 9; tc++) {
                            if (this.isMoveLegal(r, c, tr, tc, board).legal) return true;
                        }
                    }
                }
            }
        }
        return false;
    },
    checkGameState() { const opponentIsRed = this.state.isRedTurn; const inCheck = this.isKingInCheck(opponentIsRed, this.state.boardData); const hasMoves = this.hasAnyValidMoves(opponentIsRed, this.state.boardData); if (!hasMoves) { this.state.isGameOver = true; this.updateInfo(inCheck ? (opponentIsRed ? '黑方獲勝 (絕殺)!' : '紅方獲勝 (絕殺)!') : '和局 (困斃)!'); } else if (inCheck) { this.updateInfo(this.state.isRedTurn ? '黑方將軍！' : '紅方將軍！'); } else { this.updateInfo(this.state.isRedTurn ? '輪到紅方' : '輪到黑方'); } },
    isRedPiece(char) { return ['帥', '仕', '相', '俥', '傌', '炮', '兵'].includes(char); },
    updateInfo(message) { this.elements.info.textContent = message; this.elements.info.style.color = ''; },
    showWarning(reason) { const warningMessages = { self_check: '無效移動：帥(將)會被將軍！', king_face: '無效移動：王不見王！' }; const message = warningMessages[reason]; if (!message) return; const currentStatusMessage = this.elements.info.textContent; this.elements.info.textContent = message; this.elements.info.style.color = '#e74c3c'; setTimeout(() => { if (this.elements.info.textContent === message) { this.elements.info.textContent = currentStatusMessage; this.elements.info.style.color = ''; } }, 2000); },
    renderBoard() {
        console.log("2. 正在執行 renderBoard...");
        this.elements.board.innerHTML = '';
        console.log("3. 準備渲染的棋盤資料:", this.state.boardData);
        this.state.boardData.forEach((row, rowIndex) => {
            row.forEach((pieceChar, colIndex) => {
                const square = document.createElement('div');
                square.className = 'square';
                square.dataset.row = rowIndex;
                square.dataset.col = colIndex;
                square.style.gridRowStart = rowIndex + 1;
                square.style.gridColumnStart = colIndex + 1;
                if (pieceChar) {
                    const piece = document.createElement('div');
                    piece.className = 'piece';
                    piece.innerText = pieceChar;
                    piece.classList.add(this.isRedPiece(pieceChar) ? 'red-piece' : 'black-piece');
                    if (this.state.selectedPiece && this.state.selectedPiece.row === rowIndex && this.state.selectedPiece.col === colIndex) {
                        piece.classList.add('selected');
                    }
                    square.appendChild(piece);
                }
                this.elements.board.appendChild(square);
            });
        });
        this.elements.undoBtn.disabled = this.state.moveHistory.length === 0;
    }
};

// --- 遊戲啟動 ---
document.addEventListener('DOMContentLoaded', () => {
    game.init();
});