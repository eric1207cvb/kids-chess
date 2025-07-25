const tutorial = {
    moveDescriptions: {'帥':'【帥】在九宮內直走或橫走，每次限走一格。','將':'【將】在九宮內直走或橫走，每次限走一格。','仕':'【仕】在九宮內沿對角線走，每次限走一格。','士':'【士】在九宮內沿對角線走，每次限走一格。','相':'【相】走「田」字，且不能過河。','象':'【象】走「田」字，且不能過河。','俥':'【俥】直走或橫走，路徑上不能有棋子。','車':'【車】直走或橫走，路徑上不能有棋子。','傌':'【傌】走「日」字。','馬':'【馬】走「日」字。','炮':'【炮】移動時同「車」，吃子時需隔一個棋子。','砲':'【砲】移動時同「車」，吃子時需隔一個棋子。','兵':'【兵】過河前只能前進，過河後可前進或橫走，但不能後退。','卒':'【卒】過河前只能前進，過河後可前進或橫走，但不能後退。'},
    getPieceDescription(piece){if(!piece)return null;const pieceChar=game.state.boardData[piece.row][piece.col];return this.moveDescriptions[pieceChar]||null},
    showLegalMoves(piece){this.clearHighlights();if(!piece)return;const{row:fromRow,col:fromCol}=piece;for(let r=0;r<10;r++){for(let c=0;c<9;c++){const moveResult=game.isMoveLegal(fromRow,fromCol,r,c,game.state.boardData);if(moveResult.legal){const s=game.elements.board.querySelector(`[data-row='${r}'][data-col='${c}']`);if(s){const d=document.createElement('div');d.className='valid-move-dot';s.appendChild(d)}}}}},
    clearHighlights(){game.elements.board.querySelectorAll('.valid-move-dot').forEach(d=>d.remove())}
};

const game = {
    state:{boardData:[],selectedPiece:null,isRedTurn:true,isGameOver:false,moveHistory:[],initialBoard:[['車','馬','象','士','將','士','象','馬','車'],['','','','','','','','',''],['','砲','','','','','','砲',''],['卒','','卒','','卒','','卒','','卒'],['','','','','','','','',''],['','','','','','','','',''],['兵','','兵','','兵','','兵','','兵'],['','炮','','','','','','炮',''],['','','','','','','','',''],['俥','傌','相','仕','帥','仕','相','傌','俥']],aiIsEnabled:false,aiIsRed:false,aiDifficulty:'normal'},
    elements:{board:document.getElementById('xiangqi-board'),info:document.getElementById('game-info'),restartBtn:document.getElementById('restart-button'),undoBtn:document.getElementById('undo-button'),mainMenu:document.getElementById('main-menu-overlay'),gameContainer:document.getElementById('game-container'),btnPvp:document.getElementById('menu-btn-pvp'),btnBaby:document.getElementById('menu-btn-baby'),btnNormal:document.getElementById('menu-btn-normal'),backToMenuBtn:document.getElementById('back-to-menu-button'),modal:document.getElementById('game-over-modal'),modalMessage:document.getElementById('modal-message'),modalRestartBtn:document.getElementById('modal-restart-button')},
    boundEventHandlers:{},
    bindEventHandlers(){this.boundEventHandlers.handleBoardClick=this.handleBoardClick.bind(this);this.boundEventHandlers.resetGame=this.resetGame.bind(this);this.boundEventHandlers.undoMove=this.undoMove.bind(this);this.boundEventHandlers.showMainMenu=this.showMainMenu.bind(this)},
    setupInGameListeners(){this.elements.board.addEventListener('click',this.boundEventHandlers.handleBoardClick);this.elements.restartBtn.addEventListener('click',this.boundEventHandlers.resetGame);this.elements.undoBtn.addEventListener('click',this.boundEventHandlers.undoMove);this.elements.backToMenuBtn.addEventListener('click',this.boundEventHandlers.showMainMenu)},
    cleanupInGameListeners(){this.elements.board.removeEventListener('click',this.boundEventHandlers.handleBoardClick);this.elements.restartBtn.removeEventListener('click',this.boundEventHandlers.resetGame);this.elements.undoBtn.removeEventListener('click',this.boundEventHandlers.undoMove);this.elements.backToMenuBtn.removeEventListener('click',this.boundEventHandlers.showMainMenu)},
    init(){this.bindEventHandlers();this.elements.btnPvp.addEventListener('click',()=>this.startGame('pvp'));this.elements.btnBaby.addEventListener('click',()=>this.startGame('normal'));this.elements.btnNormal.addEventListener('click',()=>this.startGame('expert'));this.elements.modalRestartBtn.addEventListener('click',()=>{this.elements.modal.style.display='none';this.resetGame()})},
    startGame(mode){this.elements.mainMenu.style.display='none';this.elements.gameContainer.style.display='flex';if(mode==='pvp'){this.state.aiIsEnabled=false;this.state.aiDifficulty='pvp';}else{this.state.aiIsEnabled=true;this.state.aiIsRed=false;this.state.aiDifficulty=mode}this.setupInGameListeners();this.resetGame()},
    resetGame(){this.state.boardData=this.state.initialBoard.map(row=>[...row]);this.state.selectedPiece=null;this.state.isRedTurn=true;this.state.isGameOver=false;this.state.moveHistory=[];this.renderBoard();this.checkGameState();tutorial.clearHighlights()},
    handleBoardClick(event){if(this.state.isGameOver)return;const square=event.target.closest('.square');if(!square)return;const row=parseInt(square.dataset.row);const col=parseInt(square.dataset.col);const pieceChar=this.state.boardData[row][col];if(this.state.selectedPiece){const fromRow=this.state.selectedPiece.row;const fromCol=this.state.selectedPiece.col;if(fromRow===row&&fromCol===col){this.selectPiece(null);return}const moveResult=this.isMoveLegal(fromRow,fromCol,row,col,this.state.boardData);if(moveResult.legal){this.movePiece(fromRow,fromCol,row,col)}else if(pieceChar&&this.isRedPiece(pieceChar)===this.state.isRedTurn){this.selectPiece(row,col)}else{this.showWarning(moveResult.reason)}}else if(pieceChar&&this.isRedPiece(pieceChar)===this.state.isRedTurn){this.selectPiece(row,col)}},
    
    selectPiece(row, col) {
        this.elements.board.classList.toggle('piece-selected-mode', row !== null);
        if (row === null) {
            this.state.selectedPiece = null;
        } else {
            this.state.selectedPiece = { row, col };
        }
        this.renderBoard();
        tutorial.clearHighlights();

        if (row !== null) {
            // 【修改】只在非 'expert' (也就是你設定的 "一般模式") 的難度下顯示綠色提示
            if (this.state.aiDifficulty !== 'expert') {
                tutorial.showLegalMoves(this.state.selectedPiece);
            }
            
            const description = tutorial.getPieceDescription(this.state.selectedPiece);
            if (description) {
                this.updateInfo(description);
            }
        } else {
            this.checkGameState();
        }
    },

    movePiece(fromRow, fromCol, toRow, toCol) {
        const movedPiece = this.state.boardData[fromRow][fromCol];
        const capturedPiece = this.state.boardData[toRow][toCol];
        this.state.moveHistory.push({ fromRow, fromCol, toRow, toCol, movedPiece, capturedPiece });
        this.state.boardData[toRow][toCol] = movedPiece;
        this.state.boardData[fromRow][fromCol] = '';
        this.state.selectedPiece = null;
        this.elements.board.classList.remove('piece-selected-mode');
        tutorial.clearHighlights();
        this.state.isRedTurn = !this.state.isRedTurn;
        this.renderBoard();
        this.checkGameState();
        if (this.state.aiIsEnabled && this.state.isRedTurn === this.state.aiIsRed && !this.state.isGameOver) {
            setTimeout(() => this.triggerAI(), 500);
        }
    },

    undoMove(){if(this.state.isGameOver||this.state.moveHistory.length===0)return;const lastMove=this.state.moveHistory.pop();this.state.boardData[lastMove.fromRow][lastMove.fromCol]=lastMove.movedPiece;this.state.boardData[lastMove.toRow][lastMove.toCol]=lastMove.capturedPiece;this.state.isRedTurn=!this.state.isRedTurn;this.state.isGameOver=false;this.selectPiece(null)},
    triggerAI(){if(this.state.isGameOver)return;const bestMove=chessAI.findBestMove(this.state.boardData,this.state.aiIsRed,this.isMoveLegal.bind(this),this.state.aiDifficulty);if(bestMove){this.movePiece(bestMove.fromRow,bestMove.fromCol,bestMove.toRow,bestMove.toCol)}else{console.log("AI 找不到合法的棋步，遊戲可能已結束。")}},
    showMainMenu(){this.cleanupInGameListeners();this.elements.gameContainer.style.display='none';this.elements.mainMenu.style.display='flex'},
    isMoveLegal(fromRow,fromCol,toRow,toCol,board){if(!this.isValidMove(fromRow,fromCol,toRow,toCol,board)){return{legal:false,reason:'basic'}}const tempBoard=board.map(row=>[...row]);tempBoard[toRow][toCol]=tempBoard[fromRow][fromCol];tempBoard[fromRow][fromCol]='';if(this.isKingFacingKing(tempBoard)){return{legal:false,reason:'king_face'}}const movingPlayerIsRed=this.isRedPiece(board[fromRow][fromCol]);if(this.isKingInCheck(movingPlayerIsRed,tempBoard)){return{legal:false,reason:'self_check'}}return{legal:true,reason:null}},
    isValidMove(fromRow,fromCol,toRow,toCol,board){const pieceChar=board[fromRow][fromCol];const targetChar=board[toRow][toCol];if(targetChar&&this.isRedPiece(targetChar)===this.isRedPiece(pieceChar))return false;switch(pieceChar){case'兵':return(fromRow>4)?(toRow===fromRow-1&&toCol===fromCol):((toRow===fromRow-1&&toCol===fromCol)||(toRow===fromRow&&Math.abs(toCol-fromCol)===1));case'卒':return(fromRow<5)?(toRow===fromRow+1&&toCol===fromCol):((toRow===fromRow+1&&toCol===fromCol)||(toRow===fromRow&&Math.abs(toCol-fromCol)===1));case'俥':case'車':if(fromRow!==toRow&&fromCol!==toCol)return false;if(fromRow===toRow){for(let c=Math.min(fromCol,toCol)+1;c<Math.max(fromCol,toCol);c++)if(board[fromRow][c])return false}else{for(let r=Math.min(fromRow,toRow)+1;r<Math.max(fromRow,toRow);r++)if(board[r][fromCol])return false}return true;case'傌':case'馬':const rowDiff=Math.abs(fromRow-toRow),colDiff=Math.abs(fromCol-toCol);if(!((rowDiff===1&&colDiff===2)||(rowDiff===2&&colDiff===1)))return false;if(rowDiff===2){if(board[fromRow+(toRow-fromRow)/2][fromCol])return false}else{if(board[fromRow][fromCol+(toCol-fromCol)/2])return false}return true;case'相':if(toRow<5)return false;if(!(Math.abs(fromRow-toRow)===2&&Math.abs(fromCol-toCol)===2))return false;if(board[(fromRow+toRow)/2][(fromCol+toCol)/2])return false;return true;case'象':if(toRow>4)return false;if(!(Math.abs(fromRow-toRow)===2&&Math.abs(fromCol-toCol)===2))return false;if(board[(fromRow+toRow)/2][(fromCol+toCol)/2])return false;return true;case'仕':if(!(toCol>=3&&toCol<=5&&toRow>=7&&toRow<=9))return false;return Math.abs(fromRow-toRow)===1&&Math.abs(fromCol-toCol)===1;case'士':if(!(toCol>=3&&toCol<=5&&toRow>=0&&toRow<=2))return false;return Math.abs(fromRow-toRow)===1&&Math.abs(fromCol-toCol)===1;case'帥':case'將':const palace=(pieceChar==='帥')?{r_min:7,r_max:9}:{r_min:0,r_max:2};if(!(toCol>=3&&toCol<=5&&toRow>=palace.r_min&&toRow<=palace.r_max))return false;return Math.abs(fromRow-toRow)+Math.abs(fromCol-toCol)===1;case'炮':case'砲':if(fromRow!==toRow&&fromCol!==toCol)return false;let screenCount=0;if(fromRow===toRow){for(let c=Math.min(fromCol,toCol)+1;c<Math.max(fromCol,toCol);c++)if(board[fromRow][c])screenCount++}else{for(let r=Math.min(fromRow,toRow)+1;r<Math.max(fromRow,toRow);r++)if(board[r][fromCol])screenCount++}return targetChar?screenCount===1:screenCount===0;default:return false}},
    isKingInCheck(kingIsRed,board){const kingChar=kingIsRed?'帥':'將';let kingPos=null;for(let r=0;r<10;r++)for(let c=0;c<9;c++)if(board[r][c]===kingChar)kingPos={r,c};if(!kingPos)return false;for(let r=0;r<10;r++){for(let c=0;c<9;c++){const piece=board[r][c];if(piece&&this.isRedPiece(piece)!==kingIsRed){if(this.isValidMove(r,c,kingPos.r,kingPos.c,board))return true}}}return false},
    isKingFacingKing(board){const kings=[];for(let r=0;r<10;r++)for(let c=0;c<9;c++)if(board[r][c]==='將'||board[r][c]==='帥')kings.push({r,c});if(kings.length<2)return false;const[k1,k2]=kings;if(k1.c!==k2.c)return false;for(let r=Math.min(k1.r,k2.r)+1;r<Math.max(k1.r,k2.r);r++)if(board[r][k1.c])return false;return true},
    hasAnyValidMoves(isRed,board){for(let r=0;r<10;r++){for(let c=0;c<9;c++){if(board[r][c]&&this.isRedPiece(board[r][c])===isRed){for(let tr=0;tr<10;tr++){for(let tc=0;tc<9;tc++){if(this.isMoveLegal(r,c,tr,tc,board).legal)return true}}}}}return false},
    checkGameState(){const inCheck=this.isKingInCheck(this.state.isRedTurn,this.state.boardData);const hasMoves=this.hasAnyValidMoves(this.state.isRedTurn,this.state.boardData);if(!hasMoves){this.state.isGameOver=true;const message=inCheck?(this.state.isRedTurn?'紅方被絕殺，黑方獲勝!':'黑方被絕殺，紅方獲勝!'):'和局 (困斃)!';this.updateInfo(message);this.showGameOverModal(message)}else if(inCheck){this.updateInfo(this.state.isRedTurn?'紅方將軍！':'黑方將軍！')}else{this.updateInfo(this.state.isRedTurn?'輪到紅方':'輪到黑方')}},
    isRedPiece(char){return['帥','仕','相','俥','傌','炮','兵'].includes(char)},
    updateInfo(message){this.elements.info.textContent=message},
    showWarning(reason){const messages={self_check:'無效移動：帥(將)會被將軍！',king_face:'無效移動：王不見王！'};const msg=messages[reason];if(msg){this.updateInfo(msg)}},
    renderBoard() {
        this.elements.board.querySelectorAll('.square').forEach(sq => sq.remove());
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
                    piece.className = `piece ${this.isRedPiece(pieceChar) ? 'red-piece' : 'black-piece'}`;
                    piece.innerText = pieceChar;
                    if (this.state.selectedPiece && this.state.selectedPiece.row === rowIndex && this.state.selectedPiece.col === colIndex) {
                        piece.classList.add('selected');
                    }
                    square.appendChild(piece);
                }
                this.elements.board.appendChild(square);
            });
        });
        this.elements.undoBtn.disabled = this.state.moveHistory.length === 0;
    },
    showGameOverModal(message){this.elements.modalMessage.textContent=message;this.elements.modal.style.display='flex'}
};

document.addEventListener('DOMContentLoaded',()=>game.init());