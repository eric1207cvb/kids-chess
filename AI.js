// AI.js (最終移植完成版)

const chessAI = {
    // 中文棋子 -> 悟空 AI 數字編碼 的翻譯機
    CHAR_TO_PIECE: {
      '兵': 1, '仕': 2, '相': 3, '傌': 4, '炮': 5, '俥': 6, '帥': 7,
      '卒': 8, '士': 9, '象': 10, '馬': 11, '砲': 12, '車': 13, '將': 14
    },

    // --- 以下是從悟空象棋移植過來的「知識庫」 ---
    MATERIAL_WEIGHTS: [0, 30, 120, 120, 270, 285, 600, 6000, -30, -120, -120, -270, -285, -600, -6000],
    PST: [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,6,9,12,9,6,3,0,0,0,18,36,56,80,120,80,56,36,18,0,0,14,26,42,60,80,60,42,26,14,0,0,10,20,30,34,40,34,30,20,10,0,0,6,12,18,18,20,18,18,12,6,0,0,2,0,8,0,8,0,8,0,2,0,0,0,0,-2,0,4,0,-2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[],[],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,8,16,12,4,12,16,8,4,0,0,4,10,28,16,8,16,28,10,4,0,0,12,14,16,20,18,20,16,14,12,0,0,8,24,18,24,20,24,18,24,8,0,0,6,16,14,18,16,18,14,16,6,0,0,4,12,16,14,12,14,16,12,4,0,0,2,6,8,6,10,6,8,6,2,0,0,4,2,8,8,4,8,8,2,4,0,0,0,2,4,4,-2,4,4,2,0,0,0,0,-4,0,0,0,0,0,-4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,4,0,-10,-12,-10,0,4,6,0,0,2,2,0,-4,-14,-4,0,2,2,0,0,2,2,0,-10,-8,-10,0,2,2,0,0,0,0,-2,4,10,4,-2,0,0,0,0,0,0,0,2,8,2,0,0,0,0,0,-2,0,4,2,6,2,4,0,-2,0,0,0,0,0,2,4,2,0,0,0,0,0,4,0,8,6,10,6,8,0,4,0,0,0,2,4,6,6,6,4,2,0,0,0,0,0,2,6,6,6,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,14,14,12,18,16,18,12,14,14,0,0,16,20,18,24,26,24,18,20,16,0,0,12,12,12,18,18,18,12,12,12,0,0,12,18,16,22,22,22,16,18,12,0,0,12,14,12,18,18,18,12,14,12,0,0,12,16,14,20,20,20,14,16,12,0,0,6,10,8,14,14,14,8,10,6,0,0,4,8,6,14,12,14,6,8,4,0,0,8,4,8,16,8,16,8,4,8,0,0,-2,10,6,14,12,14,6,10,-2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[]],
    MIRROR_SQUARE: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,130,129,128,127,126,125,124,123,122,0,0,119,118,117,116,115,114,113,112,111,0,0,108,107,106,105,104,103,102,101,100,0,0,97,96,95,94,93,92,91,90,89,0,0,86,85,84,83,82,81,80,79,78,0,0,75,74,73,72,71,70,69,68,67,0,0,64,63,62,61,60,59,58,57,56,0,0,53,52,51,50,49,48,47,46,45,0,0,42,41,40,39,38,37,36,35,34,0,0,31,30,29,28,27,26,25,24,23,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],

    evaluateBoard(board, aiIsRed) {
        let totalScore = 0;
        for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 9; c++) {
                const pieceChar = board[r][c];
                if (pieceChar) {
                    const piece = this.CHAR_TO_PIECE[pieceChar];
                    const square = (r + 2) * 11 + (c + 1);
                    const isRed = (piece <= 7);
                    let score = 0;
                    score += this.MATERIAL_WEIGHTS[piece];
                    const pstIndex = isRed ? piece - 1 : (piece - 7) - 1;
                    const evaluateTypes = [1, 0, 0, 1, 1, 1, 0];
                    if (evaluateTypes[pstIndex]) {
                        if (isRed) {
                            score += this.PST[pstIndex][square];
                        } else {
                            score -= this.PST[pstIndex][this.MIRROR_SQUARE[square]];
                        }
                    }
                    totalScore += (isRed === aiIsRed) ? score : -score;
                }
            }
        }
        return totalScore;
    },

    findBestMove(board, isRedTurn, isMoveLegalFunc) {
        console.log("AI 正在使用 Minimax 演算法深度思考...");
        const searchDepth = 4;
        const bestMove = this.search(board, searchDepth, -Infinity, Infinity, isRedTurn, isMoveLegalFunc);
        console.log(`AI 找到的最佳棋步是:`, bestMove.move, `分數:`, bestMove.score);
        return bestMove.move;
    },

    search(board, depth, alpha, beta, isMaximizingPlayer, isMoveLegalFunc) {
        if (depth === 0) {
            return { score: this.evaluateBoard(board, isMaximizingPlayer), move: null };
        }
        const allMoves = this.generateAllMoves(board, isMaximizingPlayer, isMoveLegalFunc);
        if (allMoves.length === 0) {
            return { score: this.evaluateBoard(board, isMaximizingPlayer), move: null };
        }
        let bestMove = { score: isMaximizingPlayer ? -Infinity : Infinity, move: null };
        for (const move of allMoves) {
            const newBoard = this.makeMoveOnBoard(board, move);
            const result = this.search(newBoard, depth - 1, alpha, beta, !isMaximizingPlayer, isMoveLegalFunc);
            if (isMaximizingPlayer) {
                if (result.score > bestMove.score) {
                    bestMove.score = result.score;
                    bestMove.move = move;
                }
                alpha = Math.max(alpha, result.score);
            } else {
                if (result.score < bestMove.score) {
                    bestMove.score = result.score;
                    bestMove.move = move;
                }
                beta = Math.min(beta, result.score);
            }
            if (beta <= alpha) {
                break;
            }
        }
        return bestMove;
    },

    generateAllMoves(board, forRedPlayer, isMoveLegalFunc) {
        const moves = [];
        const isRedPiece = (char) => ['帥','仕','相','俥','傌','炮','兵'].includes(char);
        for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 9; c++) {
                const pieceChar = board[r][c];
                if (pieceChar && isRedPiece(pieceChar) === forRedPlayer) {
                    for (let tr = 0; tr < 10; tr++) {
                        for (let tc = 0; tc < 9; tc++) {
                            if (isMoveLegalFunc(r, c, tr, tc).legal) {
                                moves.push({ fromRow: r, fromCol: c, toRow: tr, toCol: tc });
                            }
                        }
                    }
                }
            }
        }
        return moves;
    },

    makeMoveOnBoard(board, move) {
        const newBoard = board.map(row => [...row]);
        const piece = newBoard[move.fromRow][move.fromCol];
        newBoard[move.toRow][move.toCol] = piece;
        newBoard[move.fromRow][move.fromCol] = '';
        return newBoard;
    }
};