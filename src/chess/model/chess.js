import Chess from 'chess.js';
import ChessPiece from './chesspiece';
import Square from './square';

class Game {
    constructor(thisPlayersColorIsWhite) {
        this.thisPlayersColorIsWhite = thisPlayersColorIsWhite;
        this.chessBoard = this.makeStartingBoard();
        this.chess = new Chess(); // Note: The `chess.js` library supports standard chess rules and might not work well with a 5x5 board out of the box
        this.nQueens = 1;

        // Coordinate and alphabet mappings for 5x5
        this.toCoord = this.thisPlayersColorIsWhite ? {0:5, 1:4, 2:3, 3:2, 4:1} : {0:1, 1:2, 2:3, 3:4, 4:5};
        this.toAlphabet = this.thisPlayersColorIsWhite ? {0:"a", 1:"b", 2:"c", 3:"d", 4:"e"} : {0:"e", 1:"d", 2:"c", 3:"b", 4:"a"};
        this.toCoord2 = this.thisPlayersColorIsWhite ? {5:0, 4:1, 3:2, 2:3, 1:4} : {1:0, 2:1, 3:2, 4:3, 5:4};
        this.toAlphabet2 = this.thisPlayersColorIsWhite ? {"a":0, "b":1, "c":2, "d":3, "e":4} : {"e":0, "d":1, "c":2, "b":3, "a":4};
    }

    getBoard() {
        return this.chessBoard;
    }

    setBoard(newBoard) {
        this.chessBoard = newBoard;
    }

    movePiece(pieceId, to, isMyMove) {
        const to2D = isMyMove ? {105:0, 195:1, 285:2, 375:3, 465:4} : {105:4, 195:3, 285:2, 375:1, 465:0};

        const currentBoard = this.getBoard();
        const pieceCoordinates = this.findPiece(currentBoard, pieceId);

        if (!pieceCoordinates) {
            return "Piece not found.";
        }

        const [x, y] = pieceCoordinates;
        const [to_x, to_y] = [to2D[to[0]], to2D[to[1]]];
        const originalPiece = currentBoard[y][x].getPiece();

        if (y === to_y && x === to_x) {
            return "Moved to the same position.";
        }

        const isPromotion = this.isPawnPromotion(to, pieceId[1]);
        const moveAttempt = this.chess.move({
            from: this.toChessMove([x, y], to2D),
            to: this.toChessMove(to, to2D),
            piece: pieceId[1],
            promotion: isPromotion ? 'q' : undefined
        });

        if (!moveAttempt) {
            return "Invalid move";
        }

        if (moveAttempt.flags === 'e') {
            const [x, y] = [this.toAlphabet2[moveAttempt.to[0]], parseInt(moveAttempt.to[1], 10) - (moveAttempt.color === 'w' ? 1 : -1)];
            currentBoard[this.toCoord2[y]][x].setPiece(null);
        }

        // No castling in 5x5 chessboard
        // No castling logic needed

        if (isPromotion) {
            currentBoard[to_y][to_x].setPiece(
                new ChessPiece('queen', false, pieceId[0] === 'w' ? 'white' : 'black', pieceId[0] === 'w' ? 'wq' + this.nQueens : 'bq' + this.nQueens)
            );
            this.nQueens++;
        } else {
            currentBoard[to_y][to_x].setPiece(originalPiece);
        }

        if (moveAttempt.captured) {
            currentBoard[y][x].setPiece(null);
        }

        const checkMate = this.chess.in_checkmate();
        if (checkMate) {
            return `${this.chess.turn()} has been checkmated`;
        }

        const check = this.chess.in_check();
        if (check) {
            return `${this.chess.turn()} is in check`;
        }

        this.setBoard(currentBoard);
    }

    isPawnPromotion(to, piece) {
        return piece === 'p' && (to[1] === 105 || to[1] === 465); // Adjusted for 5x5
    }

    toChessMove(finalPosition, to2D) {
        if (finalPosition[0] > 100) {
            return this.toAlphabet[to2D[finalPosition[0]]] + this.toCoord[to2D[finalPosition[1]]];
        }
        return this.toAlphabet[finalPosition[0]] + this.toCoord[finalPosition[1]];
    }

    findPiece(board, pieceId) {
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                if (board[i][j].getPieceIdOnThisSquare() === pieceId) {
                    return [j, i];
                }
            }
        }
        return null;
    }

    makeStartingBoard() {
        const backRank = ["rook", "knight", "bishop", "queen", "king"];
        const startingChessBoard = Array.from({ length: 5 }, (_, i) => Array(5).fill(null).map((_, j) => {
            const coordinatesOnCanvas = [((j + 1) * 90 + 15), ((i + 1) * 90 + 15)];
            return new Square(j, i, null, coordinatesOnCanvas);
        }));

        const whiteBackRankId = ["wr1", "wn1", "wb1", "wq1", "wk1"];
        const blackBackRankId = ["br1", "bn1", "bb1", "bq1", "bk1"];

        for (let j = 0; j < 5; j++) {
            const isWhiteRow = j === 0 || j === 1;
            const pieceColor = isWhiteRow ? "white" : "black";
            const backRankIds = isWhiteRow ? whiteBackRankId : blackBackRankId;

            if (j < 2) {
                // Top rows for white pieces
                startingChessBoard[j].forEach((_, i) => {
                    startingChessBoard[j][i].setPiece(new ChessPiece("pawn", false, pieceColor, `${pieceColor === 'white' ? 'wp' : 'bp'}${i}`));
                });
                startingChessBoard[j + 3].forEach((_, i) => {
                    startingChessBoard[j + 3][i].setPiece(new ChessPiece(backRank[i], false, pieceColor, backRankIds[i]));
                });
            } else {
                // Bottom rows for black pieces
                startingChessBoard[j].forEach((_, i) => {
                    startingChessBoard[j][i].setPiece(new ChessPiece("pawn", false, pieceColor, `${pieceColor === 'black' ? 'wp' : 'bp'}${i}`));
                });
                startingChessBoard[j - 3].forEach((_, i) => {
                    startingChessBoard[j - 3][i].setPiece(new ChessPiece(backRank[i], false, pieceColor, backRankIds[i]));
                });
            }
        }

        return startingChessBoard;
    }
}

export default Game;
