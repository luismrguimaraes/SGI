import { Tile } from "./Tile.js"

/**
 * MainBoard
 * @constructor
 */
export class MainBoard {
    constructor (scene, id, x1, x2, y1, y2){
        this.scene = scene
        this.id = id
        this.board = this.initBoard(x1, x2, y1, y2)
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

                board[i].push(new Tile(this.scene, this, color, this.id + `: ${i},${j}`, tile_x1, tile_x2, tile_y1, tile_y2))
            }
        }

        return board
    }

    display(){
        for (let i = 0; i < 8; i++){
            for (let j = 0; j < 8; j++){
                this.board[i][j].display()
            }
        }
    }
    updateTexCoords(s, t) {		
		for (let i = 0; i < 8; i++){
            for (let j = 0; j < 8; j++){
                this.board[i][j].updateTexCoords(s, t)
            }
        }
	}

    set(x, y, new_value){
        this.board[y][x] = new_value
    }

    get(x, y){
        return this.board[y][x]
    }
}