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

    initTiles(x1, x2, y1, y2){
        var tile_width = Math.abs(x2 - x1)/8
        var tile_height = Math.abs(y2 - y1)/8
        var tiles = []

        for (let i = 0; i < 8; i++){
            tiles.push([])
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
                tiles[i].push(new Tile(this.scene, this, color, 
                    this.id + ` ${j} ${i}`, tile_x1, tile_x2, tile_y1, tile_y2, 
                    j, i, texture))    
            }
        }

        return tiles
    }

    initPieces(){
        var pieces = []
        for (let i = 0; i < 3; i+=1){
            for (let j = ((i+1)%2); j < 8; j+=2){
                pieces.push(new Piece(this.scene, this, 1, 'piece ' + `${pieces.length}`, this.tiles[i][j]))
                this.tiles[i][j].set_isFree(false)
            }
        }
        for (let i = 7; i > 4; i-=1){
            for (let j = ((i+1)%2); j < 8; j+=2){
                pieces.push(new Piece(this.scene, this, 0, 'piece ' + `${pieces.length}`, this.tiles[i][j]))
                this.tiles[i][j].set_isFree(false)
            }
        }

        //TEST
        pieces[2].setPickable(true)
        pieces[15].setPickable(true)
        pieces[13].setPickable(true)
        pieces[4].set_isKing(true)
        pieces[15].set_isKing(true)

        return pieces
    }

    pick(piece_id){
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

    move(piece_id, x, y){
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
    
}