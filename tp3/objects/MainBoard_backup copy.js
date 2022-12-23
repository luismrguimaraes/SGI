import { Piece } from "./Piece.js"
import { Tile } from "./Tile.js"

/**
 * MainBoard
 * @constructor
 */
export class MainBoard {
    constructor (scene, id, x1, x2, y1, y2, tile_textures){
        this.scene = scene
        this.id = id
        this.tile_textures = tile_textures
        this.board = this.initBoard(x1, x2, y1, y2)
        this.pieces = this.initPieces(x1, x2, y1, y2)
    }

    initBoard(x1, x2, y1, y2){
        var width = Math.abs(x2 - x1)/8
        var height = Math.abs(y2 - y1)/8
        var board = []

        for (let i = 0; i < 8; i++){
            board.push([])
            let color_mod = i%2
            for (let j = 0; j < 8; j++){
                let color = (j + color_mod) % 2
                let tile_x1 = parseFloat(x1 + i*width)
                let tile_x2 = parseFloat(x1 + (i+1)*width)
                let tile_y1 = parseFloat(y1 + j*height)
                let tile_y2 = parseFloat(y1 + (j+1)*height)

                var texture
                if (color === 0)
                    texture = this.tile_textures[0]
                else texture = this.tile_textures[1]
                board[i].push(new Tile(this.scene, this, color, this.id + ` ${j} ${i}`, tile_x1, tile_x2, tile_y1, tile_y2, j, i, texture))    
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
                pieces.push(new Piece(this.scene, this.board, 1, this.id + ` ${i+j}`, this.board[i][j]))
            }
        }
        for (let i = 7; i > 4; i-=1){
            for (let j = ((i+1)%2); j < 8; j+=2){
                pieces.push(new Piece(this.scene, this.board, 0, this.id + ` ${i+j}`, this.board[i][j]))
            }
        }
        return pieces
    }

    display(){
        for (let i = 0; i < 8; i++){
            for (let j = 0; j < 8; j++){
                this.board[i][j].display()
            }
        }
        for (let i = 0; i < this.pieces.length; i++){
            this.pieces[i].display()
        }
    }
    updateTexCoords(s, t) {		
		for (let i = 0; i < 8; i++){
            for (let j = 0; j < 8; j++){
                this.board[i][j].updateTexCoords(s, t)
            }
        }
        for (let i = 0; i < this.pieces.length; i++){
            this.pieces[i].updateTexCoords(s, t)
        }
	}

    set(x, y, new_value){
        this.board[y][x] = new_value
    }

    get(x, y){
        return this.board[y][x]
    }
}