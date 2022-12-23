import { Piece } from "./Piece.js"
import { Tile } from "./Tile.js"

/**
 * Board
 * @constructor
 */
export class Board {
    constructor (scene, id, width, height, x1, x2, y1, y2, tile_textures){
        this.scene = scene
        this.id = id
        this.width = width
        this.height = height
        this.tile_textures = tile_textures
        this.board = this.initBoard(x1, x2, y1, y2)  // tiles set
        this.pieces = this.initPieces()
    }

    initBoard(x1, x2, y1, y2){
        var tile_width = Math.abs(x2 - x1)/this.width
        var tile_height = Math.abs(y2 - y1)/this.height
        var board = []

        for (let i = 0; i < this.height; i++){
            board.push([])
            let color_mod = i%2
            for (let j = 0; j < this.width; j++){
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
        return board
    }

    initPieces(){
        return []
    }

    display(){
        for (let i = 0; i < this.height; i++){
            for (let j = 0; j < this.width; j++){
                this.board[i][j].display()
            }
        }
        for (let i = 0; i < this.pieces.length; i++){
            this.pieces[i].display()
        }
    }
    updateTexCoords(s, t) {		
		for (let i = 0; i < this.height; i++){
            for (let j = 0; j < this.width; j++){
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