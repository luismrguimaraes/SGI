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

    initBoard(x1, x2, y1, y2){
        var tile_width = Math.abs(x2 - x1)/8
        var tile_height = Math.abs(y2 - y1)/8
        var board = []

        for (let i = 0; i < 8; i++){
            board.push([])
            let color_mod = i%2
            for (let j = 0; j < 8; j++){
                let color = (j + color_mod) % 2
                let tile_x1 = parseFloat(x1 + i*tile_width)
                let tile_x2 = parseFloat(x1 + (i+1)*tile_width)
                let tile_y1 = parseFloat(y1 + j*tile_height)
                let tile_y2 = parseFloat(y1 + (j+1)*tile_height)

                var texture
                if (color === 0)
                    texture = this.tile_textures[0]
                else texture = this.tile_textures[1]
                board[i].push(new Tile(this.scene, this, color, 
                    this.id + ` ${j} ${i}`, tile_x1, tile_x2, tile_y1, tile_y2, 
                    j, i, texture))    
            }
        }

        //TEST
        board[5][3].setPickable(true)

        return board
    }

    initPieces(){
        var pieces = []
        for (let i = 0; i < 3; i+=1){
            for (let j = ((i+1)%2); j < 8; j+=2){
                pieces.push(new Piece(this.scene, this.board, 1, 'piece ' + `${pieces.length}`, this.board[i][j]))
            }
        }
        for (let i = 7; i > 4; i-=1){
            for (let j = ((i+1)%2); j < 8; j+=2){
                pieces.push(new Piece(this.scene, this.board, 0, 'piece ' + `${pieces.length}`, this.board[i][j]))
            }
        }

        //TEST
        pieces[2].setPickable(true)
        pieces[4].setPickable(true)

        return pieces
    }

    pick(id){
        for (let i = 0; i < this.pieces.length; i++){
            console.log(this.pieces[i].id, id)
            if (this.pieces[i].id === id){
                this.pieces[i].setPicked(true)
                this.pieces[i].setPickable(false)
            }
            else{ 
                this.pieces[i].setPicked(false)
                this.pieces[i].setPickable(true)
            }
        }
    }
}