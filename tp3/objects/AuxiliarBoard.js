import { Piece } from "./Piece.js"
import { Tile } from "./Tile.js"
import { Board } from "./Board.js"

/**
 * AuxiliarBoard
 * @constructor
 */
export class AuxiliarBoard extends Board{
    constructor (scene, id, x1, x2, y1, y2, tile_textures, mainboard){
        super(scene, id, 12, 1, x1, x2, y1, y2, tile_textures)
        this.mainboard = mainboard
    }

    lastTile(){
        return this.tiles[0][this.pieces.length]
    }

    push(piece){
        this.pieces.board = this
        piece.changeTile(this.lastTile())
        piece.setPickable(false)
        this.pieces.push(piece)
        if (piece.isKing && piece.fusedPiece !== null){
            var new_piece = new Piece(this.scene, this, piece.color, piece.fusedPiece.id, this.lastTile(), this.mainboard.getTile(0,0))
            this.pieces.push(new_piece)
        }
        piece.set_isKing(false)
        return 0
    }
    pop(){
        if (this.pieces.length > 0){
            var poppedPiece = this.pieces.pop()
            poppedPiece.board = this.mainboard
            poppedPiece.changeTile(null)
            return poppedPiece
        }
        else return null
    }
    
}