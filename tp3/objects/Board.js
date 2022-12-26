import { Piece } from "./Piece.js"
import { Tile } from "./Tile.js"

/**
 * Board
 * @constructor
 */
export class Board {
    /**
     * 
     * @param {*} tile_textures tile_textures[0] -> white piece; tile_textures[1] -> black piece
     */
    constructor (scene, id, width, height, x1, x2, y1, y2, tile_textures){
        this.scene = scene
        this.id = id
        this.width = width
        this.height = height
        this.tile_textures = tile_textures
        this.tiles = this.initTiles(x1, x2, y1, y2)
        this.pieces = this.initPieces()
    }

    initTiles(x1, x2, y1, y2){
        var tile_width = Math.abs(x2 - x1)/this.width
        var tile_height = Math.abs(y2 - y1)/this.height
        var tiles = []

        for (let i = 0; i < this.height; i++){
            tiles.push([])
            let color_mod = i%2
            for (let j = 0; j < this.width; j++){
                let color = (j + color_mod) % 2
                let tile_x1 = parseFloat(x1 + j*tile_width)
                let tile_x2 = parseFloat(x1 + (j+1)*tile_width)
                let tile_y1 = parseFloat(y1 + i*tile_height)
                let tile_y2 = parseFloat(y1 + (i+1)*tile_height)

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
        return []
    }

    display(){
        for (let i = 0; i < this.height; i++){
            for (let j = 0; j < this.width; j++){
                this.tiles[i][j].display()
            }
        }
        for (let i = 0; i < this.pieces.length; i++){
            this.pieces[i].display()
        }
    }
    updateTexCoords(s, t) {		
		for (let i = 0; i < this.height; i++){
            for (let j = 0; j < this.width; j++){
                this.tiles[i][j].updateTexCoords(s, t)
            }
        }
        for (let i = 0; i < this.pieces.length; i++){
            this.pieces[i].updateTexCoords(s, t)
        }
	}

    /**
     * Get a piece by its position
     */
    getPieceAt(x, y){
        for (let i = 0; i < this.pieces.length; i++){
            if (this.pieces[i].getBoardPosition() === `${x} ${y}`){
                return this.pieces[i]
            }
        }
        return null
    }
    /**
     * Get a piece by its ID
     */
    getPiece(id){
        for (let i = 0; i < this.pieces.length; i++){
            if (this.pieces[i].id === id){
                return this.pieces[i]
            }
        }
        return null
    }

    /**
     * Remove a piece with its position
     */
    removePieceAt(x, y){
        var new_pieces = []
        var removedPiece = null
        for (let i = 0; i < this.pieces.length; i++){
            if (this.pieces[i].getBoardPosition() === `${x} ${y}`){
                this.getTile(x, y).set_isFree(true)
                removedPiece = this.pieces[i]
                continue
            }
            else
                new_pieces.push(this.pieces[i])
        }
        this.pieces = new_pieces
        return removedPiece
    }
    /**
     * Remove a piece with its ID
     */
    removePiece(id){
        var new_pieces = []
        var removedPiece = null
        for (let i = 0; i < this.pieces.length; i++){
            if (this.pieces[i].id === id){
                let x = this.pieces[i].getBoardPosition().split(' ')[0]
                let y = this.pieces[i].getBoardPosition().split(' ')[1]

                this.getTile(x, y).set_isFree(true)
                removedPiece = this.pieces[i]
                continue
            }
            else
                new_pieces.push(this.pieces[i])
        }
        this.pieces = new_pieces
        return removedPiece
    }
    
    getTile(x, y){
        return this.tiles[y][x]
    }

    computeAnimations(ellapsedTime){
        this.computeAnimations_rec(ellapsedTime)
    }
    computeAnimations_rec(ellapsedTime){
        for (let i = 0; i < this.pieces.length; i++){
            this.pieces[i].computeAnimation(ellapsedTime)
        }   
    }
}