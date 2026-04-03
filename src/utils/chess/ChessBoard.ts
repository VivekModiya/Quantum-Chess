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
  // O(1) square → pieceId index, built once in constructor
  private squareIndex: Map<Square, string>
  // Cached toMap() result — computed lazily, reused on repeated calls
  private cachedMap: Map<Square, Piece | null> | null = null

  constructor(board: BoardState) {
    this.board = board
    this.squareIndex = new Map()
    for (const [pieceId, piece] of Object.entries(board)) {
      this.squareIndex.set(piece.square, pieceId)
    }
  }

  getState(): BoardState {
    return this.board
  }

  at(square: Square): BoardPiece | null {
    const pieceId = this.squareIndex.get(square)
    if (!pieceId) return null
    return this.board[pieceId] ?? null
  }

  pieceIdAt(square: Square): string | null {
    return this.squareIndex.get(square) ?? null
  }

  byId(pieceId: string): BoardPiece | undefined {
    return this.board[pieceId]
  }

  squareOf(pieceId: string): Square | null {
    const piece = this.board[pieceId]
    if (!piece) return null
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

  activePieces(capturedPieceIds: string[]): Array<[string, BoardPiece]> {
    return Object.entries(this.board).filter(
      ([pieceId]) => !capturedPieceIds.includes(pieceId)
    )
  }

  isEmpty(square: Square): boolean {
    return this.at(square) === null
  }

  isOccupiedBy(square: Square, color: PieceColor): boolean {
    const piece = this.at(square)
    return piece !== null && piece.color === color
  }

  toMap(): Map<Square, Piece | null> {
    if (this.cachedMap) return this.cachedMap

    const boardMap = new Map<Square, Piece | null>()

    // Initialize all squares to null
    for (let file = 0; file < 8; file++) {
      for (let rank = 1; rank <= 8; rank++) {
        const square = (String.fromCharCode(97 + file) + rank) as Square
        boardMap.set(square, null)
      }
    }

    // Set pieces
    Object.values(this.board).forEach(piece => {
      boardMap.set(piece.square, {
        type: piece.piece,
        color: piece.color,
      })
    })

    this.cachedMap = boardMap
    return boardMap
  }

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
        }
      }
    })

    return board
  }
}
