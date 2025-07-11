// 將所有遊戲相關的邏輯和狀態封裝在一個物件中
const game = {
    // --- 遊戲狀態 (State) ---
    state: {
        boardData: [],
        selectedPiece: null,
        isRedTurn: true,
        isGameOver: false,
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
        ]
    },

    // --- DOM 元素 ---
    elements: {
        board: document.getElementById('xiangqi-board'),
        info: document.getElementById('game-info'),
        restartBtn: document.getElementById('restart-button')
    },

    // --- 初始化函式 ---
    init() {
        this.resetGame();
        this.elements.board.addEventListener('click', this.handleBoardClick.bind(this));
        this.elements.restartBtn.addEventListener('click', this.resetGame.bind(this));
    },
    
    resetGame() {
        // 深拷貝一份初始棋盤狀態，防止原始陣列被修改
        this.state.boardData = this.state.initialBoard.map(row => [...row]);
        this.state.selectedPiece = null;
        this.state.isRedTurn = true;
        this.state.isGameOver = false;
        this.renderBoard();
        this.updateInfo('遊戲開始，紅方先行！');
    },

    // --- 核心事件處理 ---
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

            // 如果點擊同一棋子，取消選擇
            if (fromRow === row && fromCol === col) {
                this.selectPiece(null);
                return;
            }
            
            const moveResult = this.isMoveLegal(fromRow, fromCol, row, col);

            if (moveResult.legal) {
                this.movePiece(fromRow, fromCol, row, col);
            } else if (pieceChar && this.isRedPiece(pieceChar) === this.state.isRedTurn) {
                // 如果點擊的是自己的另一個棋子，則換選
                this.selectPiece(row, col);
            } else {
                // 如果點擊的是無效位置，顯示警告
                this.showWarning(moveResult.reason);
            }
        } else if (pieceChar && this.isRedPiece(pieceChar) === this.state.isRedTurn) {
            this.selectPiece(row, col);
        }
    },

    // --- 動作函式 ---
    selectPiece(row, col) {
        if (row === null) {
            this.state.selectedPiece = null;
        } else {
            this.state.selectedPiece = { row, col };
        }
        this.renderBoard();
    },

    movePiece(fromRow, fromCol, toRow, toCol) {
        this.state.boardData[toRow][toCol] = this.state.boardData[fromRow][fromCol];
        this.state.boardData[fromRow][fromCol] = '';
        
        this.state.selectedPiece = null;
        this.state.isRedTurn = !this.state.isRedTurn;

        this.renderBoard();
        this.checkGameState();
    },

    // --- 規則判斷函式 (裁判) ---
    isMoveLegal(fromRow, fromCol, toRow, toCol) {
        if (!this.isValidMove(fromRow, fromCol, toRow, toCol, this.state.boardData)) {
            return { legal: false, reason: 'basic' };
        }

        const tempBoard = this.state.boardData.map(row => [...row]);
        tempBoard[toRow][toCol] = tempBoard[fromRow][fromCol];
        tempBoard[fromRow][fromCol] = '';

        if (this.isKingFacingKing(tempBoard)) {
            return { legal: false, reason: 'king_face' };
        }
        
        const movingPlayerIsRed = this.isRedPiece(this.state.boardData[fromRow][fromCol]);
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
            case '兵':
                return (fromRow > 4) ? (toRow === fromRow - 1 && toCol === fromCol) : ((toRow === fromRow - 1 && toCol === fromCol) || (toRow === fromRow && Math.abs(toCol - fromCol) === 1));
            case '卒':
                return (fromRow < 5) ? (toRow === fromRow + 1 && toCol === fromCol) : ((toRow === fromRow + 1 && toCol === fromCol) || (toRow === fromRow && Math.abs(toCol - fromCol) === 1));
            case '俥': case '車':
                if (fromRow !== toRow && fromCol !== toCol) return false;
                if (fromRow === toRow) {
                    for (let c = Math.min(fromCol, toCol) + 1; c < Math.max(fromCol, toCol); c++) if (board[fromRow][c]) return false;
                } else {
                    for (let r = Math.min(fromRow, toRow) + 1; r < Math.max(fromRow, toRow); r++) if (board[r][fromCol]) return false;
                }
                return true;
            case '傌': case '馬':
                const rowDiff = Math.abs(fromRow - toRow), colDiff = Math.abs(fromCol - toCol);
                if (!((rowDiff === 1 && colDiff === 2) || (rowDiff === 2 && colDiff === 1))) return false;
                if (rowDiff === 2) { if (board[fromRow + (toRow - fromRow) / 2][fromCol]) return false; } 
                else { if (board[fromRow][fromCol + (toCol - fromCol) / 2]) return false; }
                return true;
            case '相':
                if (toRow < 5) return false;
                if (!(Math.abs(fromRow - toRow) === 2 && Math.abs(fromCol - toCol) === 2)) return false;
                if (board[(fromRow + toRow) / 2][(fromCol + toCol) / 2]) return false;
                return true;
            case '象':
                if (toRow > 4) return false;
                if (!(Math.abs(fromRow - toRow) === 2 && Math.abs(fromCol - toCol) === 2)) return false;
                if (board[(fromRow + toRow) / 2][(fromCol + toCol) / 2]) return false;
                return true;
            case '仕':
                if (!(toCol >= 3 && toCol <= 5 && toRow >= 7 && toRow <= 9)) return false;
                return Math.abs(fromRow - toRow) === 1 && Math.abs(fromCol - toCol) === 1;
            case '士':
                if (!(toCol >= 3 && toCol <= 5 && toRow >= 0 && toRow <= 2)) return false;
                return Math.abs(fromRow - toRow) === 1 && Math.abs(fromCol - toCol) === 1;
            case '帥': case '將':
                const palace = (pieceChar === '帥') ? { r_min: 7, r_max: 9 } : { r_min: 0, r_max: 2 };
                if (!(toCol >= 3 && toCol <= 5 && toRow >= palace.r_min && toRow <= palace.r_max)) return false;
                return Math.abs(fromRow - toRow) + Math.abs(fromCol - toCol) === 1;
            case '炮': case '砲':
                if (fromRow !== toRow && fromCol !== toCol) return false;
                let screenCount = 0;
                if (fromRow === toRow) {
                    for (let c = Math.min(fromCol, toCol) + 1; c < Math.max(fromCol, toCol); c++) if (board[fromRow][c]) screenCount++;
                } else {
                    for (let r = Math.min(fromRow, toRow) + 1; r < Math.max(fromRow, toRow); r++) if (board[r][fromCol]) screenCount++;
                }
                return targetChar ? screenCount === 1 : screenCount === 0;
            default: return false;
        }
    },

    isKingInCheck(kingIsRed, board) {
        const kingChar = kingIsRed ? '帥' : '將';
        let kingPos = null;
        for (let r = 0; r < 10; r++) for (let c = 0; c < 9; c++) if (board[r][c] === kingChar) kingPos = { r, c };
        if (!kingPos) return false;

        for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 9; c++) {
                const piece = board[r][c];
                if (piece && this.isRedPiece(piece) !== kingIsRed) {
                    if (this.isValidMove(r, c, kingPos.r, kingPos.c, board)) return true;
                }
            }
        }
        return false;
    },

    isKingFacingKing(board) {
        const kings = [];
        for (let r = 0; r < 10; r++) for (let c = 0; c < 9; c++) if (board[r][c] === '將' || board[r][c] === '帥') kings.push({ r, c });
        if (kings.length < 2) return false;
        const [k1, k2] = kings;
        if (k1.c !== k2.c) return false;
        for (let r = Math.min(k1.r, k2.r) + 1; r < Math.max(k1.r, k2.r); r++) if (board[r][k1.c]) return false;
        return true;
    },

    hasAnyValidMoves(isRed, board) {
        for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 9; c++) {
                if (board[r][c] && this.isRedPiece(board[r][c]) === isRed) {
                    for (let tr = 0; tr < 10; tr++) {
                        for (let tc = 0; tc < 9; tc++) {
                            if (this.isMoveLegal(r, c, tr, tc).legal) return true;
                        }
                    }
                }
            }
        }
        return false;
    },

    checkGameState() {
        const opponentIsRed = this.state.isRedTurn;
        const inCheck = this.isKingInCheck(opponentIsRed, this.state.boardData);
        const hasMoves = this.hasAnyValidMoves(opponentIsRed, this.state.boardData);

        if (!hasMoves) {
            this.state.isGameOver = true;
            this.updateInfo(inCheck ? (opponentIsRed ? '黑方獲勝 (絕殺)!' : '紅方獲勝 (絕殺)!') : '和局 (困斃)!');
        } else if (inCheck) {
            this.updateInfo(opponentIsRed ? '紅方將軍！' : '黑方將軍！');
        } else {
            this.updateInfo(opponentIsRed ? '輪到紅方' : '輪到黑方');
        }
    },

    // --- 輔助 & 渲染函式 ---
    isRedPiece(char) {
        return ['帥', '仕', '相', '俥', '傌', '炮', '兵'].includes(char);
    },

    updateInfo(message) {
        this.elements.info.textContent = message;
        this.elements.info.style.color = ''; // 恢復預設顏色
    },
    
    showWarning(reason) {
        const warningMessages = {
            self_check: '無效移動：帥(將)會被將軍！',
            king_face: '無效移動：王不見王！'
        };
        const message = warningMessages[reason];
        if (!message) return; // 對於不符合基本規則的移動，不顯示特定警告

        const currentStatusMessage = this.elements.info.textContent;
        
        this.elements.info.textContent = message;
        this.elements.info.style.color = '#e74c3c'; // 警告的紅色

        // 2秒後恢復原本的狀態訊息
        setTimeout(() => {
            this.elements.info.textContent = currentStatusMessage;
            this.elements.info.style.color = '';
        }, 2000);
    },

    renderBoard() {
        this.elements.board.innerHTML = '';
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
    }
};

// --- 遊戲啟動 ---
game.init();
