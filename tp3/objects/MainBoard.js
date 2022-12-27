import { Piece } from "./Piece.js"
import { Tile } from "./Tile.js"
import { Board } from "./Board.js"

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
                pieces.push(new Piece(this.scene, this, 0, 'piece ' + `${pieces.length}`, this.tiles[i][j]))
                this.tiles[i][j].set_isFree(false)
            }
        }
        for (let i = 7; i > 4; i-=1){
            for (let j = (i%2); j < 8; j+=2){
                pieces.push(new Piece(this.scene, this, 1, 'piece ' + `${pieces.length}`, this.tiles[i][j]))
                this.tiles[i][j].set_isFree(false)
            }
        }

        //TEST
        pieces[4].setPickable(true)
        pieces[4].set_isKing(true, "piece 2")
        pieces[15].setPickable(true)
        pieces[13].setPickable(true)
        pieces[15].set_isKing(true)

        return pieces
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
                this.pieces[i].setPickable(true)
            }
        }

        // update pickables
        for (let i = 0; i < 8; i++){
            for (let j = 0; j < 8; j++){
                if (this.getTile(j, i).isFree){
                    this.getTile(j, i).setPickable(true)
                } else this.getTile(j, i).setPickable(false)
            }
        }
    }

    movePiece(piece_id, x, y){
        for (let i = 0; i < this.pieces.length; i++){
            if (this.pieces[i].id === piece_id){
                this.pieces[i].move(x, y)
            }
        }

        // update pickables
        for (let i = 0; i < 8; i++){
            for (let j = 0; j < 8; j++){
                this.getTile(j, i).setPickable(false)
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