import { PieceColor, PieceType } from '../../types'
import {
  BoardState,
  BoardPiece,
  Square,
  Piece,
  SquareCoords,
} from '../../types/chess'
import { PIECE_SQUARE_MAP } from '../../constants'

export class ChessBoard {
  private board: BoardState

  constructor(board: BoardState) {
    this.board = board
  }

  getState(): BoardState {
    return this.board
  }

  at(square: Square): BoardPiece | null {
    for (const piece of Object.values(this.board)) {
      if (piece.square === square && !piece.isCaptured) {
        return piece
      }
    }
    return null
  }

  pieceIdAt(square: Square): string | null {
    for (const [pieceId, piece] of Object.entries(this.board)) {
      if (piece.square === square && !piece.isCaptured) {
        return pieceId
      }
    }
    return null
  }

  byId(pieceId: string): BoardPiece | undefined {
    return this.board[pieceId]
  }

  squareOf(pieceId: string): Square | null {
    const piece = this.board[pieceId]
    if (!piece || piece.isCaptured) return null
    return piece.square
  }

  coords(square: string): SquareCoords | null {
    if (square.length !== 2) return null

    const fileStr = square[0].toLowerCase()
    const rank = parseInt(square[1])

    if (fileStr < 'a' || fileStr > 'h' || rank < 1 || rank > 8) return null

    return {
      file: fileStr.charCodeAt(0) - 'a'.charCodeAt(0) + 1,
      rank,
    }
  }

  activePieces(color?: PieceColor): Array<[string, BoardPiece]> {
    return Object.entries(this.board).filter(
      ([_, piece]) =>
        !piece.isCaptured && (color === undefined || piece.color === color)
    )
  }

  capturedPieces(color?: PieceColor): string[] {
    return Object.entries(this.board)
      .filter(
        ([_, piece]) =>
          piece.isCaptured && (color === undefined || piece.color === color)
      )
      .map(([pieceId]) => pieceId)
  }

  isEmpty(square: Square): boolean {
    return this.at(square) === null
  }

  isOccupiedBy(square: Square, color: PieceColor): boolean {
    const piece = this.at(square)
    return piece !== null && piece.color === color
  }

  pieceInfo(pieceId: string): Piece | null {
    const pieceMap: Record<string, PieceType> = {
      p: 'pawn',
      b: 'bishop',
      n: 'knight',
      k: 'king',
      q: 'queen',
      r: 'rook',
    }

    const colorMap: Record<string, PieceColor> = {
      w: 'white',
      b: 'black',
    }

    const piece = pieceMap[pieceId[0]]
    const color = colorMap[pieceId[1]]

    if (piece && color) {
      return { type: piece, color }
    }

    return null
  }

  /**
   * Convert board to Map format (for compatibility with existing functions)
   * @returns Map of squares to Piece objects
   */
  toMap(): Map<Square, Piece | null> {
    const boardMap = new Map<Square, Piece | null>()

    // Initialize all squares to null
    for (let file = 0; file < 8; file++) {
      for (let rank = 1; rank <= 8; rank++) {
        const square = String.fromCharCode(97 + file) + (rank + 1)
        boardMap.set(square, null)
      }
    }

    // Set pieces
    Object.values(this.board).forEach(piece => {
      if (!piece.isCaptured) {
        boardMap.set(piece.square, {
          type: piece.piece,
          color: piece.color,
        })
      }
    })

    return boardMap
  }

  /**
   * Create initial board state
   * @returns BoardState with all pieces in starting positions
   */
  static createInitial(): BoardState {
    const board: BoardState = {}

    Object.entries(PIECE_SQUARE_MAP).forEach(([pieceId, square]) => {
      const pieceMap: Record<string, PieceType> = {
        p: 'pawn',
        b: 'bishop',
        n: 'knight',
        k: 'king',
        q: 'queen',
        r: 'rook',
      }

      const colorMap: Record<string, PieceColor> = {
        w: 'white',
        b: 'black',
      }

      const piece = pieceMap[pieceId[0]]
      const color = colorMap[pieceId[1]]

      if (piece && color) {
        board[pieceId] = {
          square: square as Square,
          piece,
          color,
          isCaptured: false,
        }
      }
    })

    return board
  }
}
