import { Piece } from "./Piece.js"
import { Tile } from "./Tile.js"
import { Board } from "./Board.js"
import { Game } from "./Game.js"

/**
 * MainBoard
 * @constructor
 */
export class MainBoard extends Board{
    constructor (scene, id, x1, x2, y1, y2, tile_textures){
        super(scene, id, 8, 8, x1, x2, y1, y2, tile_textures)

    }

    initPieces(){
        var pieces = []
        for (let i = 0; i < 3; i+=1){
            for (let j = (i%2); j < 8; j+=2){
                let newPiece = new Piece(this.scene, this, 0, 'piece ' + `${pieces.length}`, this.tiles[i][j])
                pieces.push(newPiece)
                this.tiles[i][j].set_isFree(false, newPiece)
            }
        }
        for (let i = 7; i > 4; i-=1){
            for (let j = (i%2); j < 8; j+=2){
                let newPiece = new Piece(this.scene, this, 1, 'piece ' + `${pieces.length}`, this.tiles[i][j])
                pieces.push(newPiece)
                this.tiles[i][j].set_isFree(false, newPiece)
            }
        }

        //TEST
        /**for (let i = 0; i < pieces.length; i++)
            pieces[i].setPickable(true)
        pieces[9].set_isKing(true)**/

        this.pieces = pieces

        // TEST
        //var piece_19 = this.getPiece("piece 19")
        //this.removePiece("piece 19")
        //this.pieces[20].set_isKing(true, piece_19)
    }

    pickPiece(piece_id){
        for (let i = 0; i < this.pieces.length; i++){
            if (this.pieces[i].id === piece_id){
                this.pieces[i].setPicked(true)
                this.pieces[i].triggerPickAnimation()
                //this.pieces[i].setPickable(false)
            }
            else{ 
                this.pieces[i].setPicked(false)
                //this.pieces[i].setPickable(true)
            }
        }
    }

    movePiece(piece_id, x, y){
        for (let i = 0; i < this.pieces.length; i++){
            if (this.pieces[i].id === piece_id){
                this.pieces[i].move(x, y)
            }
        }
    }

    addPiece(piece, x, y){
        var tile = this.getTile(x, y)
        if (!tile.isFree)
            return console.warn(tile.id + " occupied, " + piece.id + " not added")

        this.pieces.push(piece)
        piece.board = this
        piece.move(x, y)
    }
    
}