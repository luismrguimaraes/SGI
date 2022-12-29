import { Piece } from "./Piece.js"
import { Tile } from "./Tile.js"
import { MyKeyframeAnimation } from "../animations/MyKeyframeAnimation.js"

/**
 * Board
 * @constructor
 */
export class Board {
    /**
     * 
     * @param {*} tile_textures tile_textures[0] -> white piece; tile_textures[1] -> black piece
     * @param {*} inverted inits tiles in an inverted order
     */
    constructor (scene, id, width, height, x1, x2, y1, y2, tile_textures, inverted = false){
        this.scene = scene
        this.id = id
        this.width = width // number of x tiles
        this.height = height // number of y tiles
        this.tile_textures = tile_textures
        this.inverted = inverted
        this.tiles = this.initTiles(x1, x2, y1, y2)
        this.pieces = this.initPieces()

        this.x1 = x1
        this.x2 = x2
        this.y1 = y1
        this.y2 = y2

        // Animations
        this.invalidPickAnimation = null
    }

    initTiles(x1, x2, y1, y2){
        var tile_width = Math.abs(x2 - x1)/this.width
        var tile_height = Math.abs(y2 - y1)/this.height
        var tiles = []

        console.log(this.id, this.inverted)

        for (let i = 0; i < this.height; i++){
            tiles.push([])
            let color_mod = (i+1)%2
            for (let j = 0; j < this.width; j++){
                let color = (j + color_mod) % 2
                if (!this.inverted){
                    var tile_x1 = parseFloat(x1 + j*tile_width)
                    var tile_x2 = parseFloat(x1 + (j+1)*tile_width)
                }else{
                    var tile_x1 = parseFloat(x2 - j*tile_width)
                    var tile_x2 = parseFloat(x2 - (j+1)*tile_width)
                }
                if (!this.inverted){
                    var tile_y1 = parseFloat(y1 + i*tile_height)
                    var tile_y2 = parseFloat(y1 + (i+1)*tile_height)
                }else{
                    var tile_y1 = parseFloat(y2 - i*tile_height)
                    var tile_y2 = parseFloat(y2 - (i+1)*tile_height)
                }

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

    /**
     * 
     * @param {*} a First mat4
     * @param {*} b Second mat4
     * @param {*} decimalPlaces Number of decimal places to convert to
     */
    mat4_equals (a, b, decimalPlaces = 3){
        if (a.length !== 16 || b.length !== 16 ) {
            return false
        }
        var length = a.length
        for (let i = 0; i < length; i++){
            if (a[i].toFixed(decimalPlaces) != b[i].toFixed(decimalPlaces)){
                return false
            }
        }
        return true
    }

    /**
     * 
     * @param {*} a First mat4
     * @param {*} b Second mat4
     * @param {*} decimalPlaces Number of decimal places to convert to
     * @returns 
     */
    collisionComparison(a, b, decimalPlaces = 3){
        if (a.length !== 16 || b.length !== 16 ) {
            return false
        }
        if (a[12].toFixed(decimalPlaces) !== b[12].toFixed(decimalPlaces)
        ||  a[13].toFixed(decimalPlaces) !== b[13].toFixed(decimalPlaces)){
            return false
        }
        return true
    }

    display(){
        if (this.invalidPickAnimation !== null)
            this.invalidPickAnimation.apply()

        for (let i = 0; i < this.height; i++){
            for (let j = 0; j < this.width; j++){
                this.tiles[i][j].display()
            }
        }

        for (let i = 0; i < this.pieces.length; i++){
            this.pieces[i].display()
        }
        // Check for collisions
        
        var piece_i = null
        var piece_j = null
        for(let i = 0; i < this.pieces.length; i++){
            piece_i = this.pieces[i]
            for (let j = 0; j < this.pieces.length; j++){
                if (j === i) continue
                piece_j = this.pieces[j]
                mat4.create()
                //console.log(piece_i.displayMatrix, piece_j. displayMatrix)
                if (this.collisionComparison(piece_j.displayMatrix, piece_i.displayMatrix, 1)){
                    // Check which piece is not moving and animate it
                    // to move to its auxiliar board
                    let pieceToAnimate = null
                    let pieceThatMayHaveCaptured = null
                    if (piece_j.moveAnimation === null && piece_i.moveAnimation !== null){
                        pieceToAnimate = piece_j
                        pieceThatMayHaveCaptured = piece_i
                    }
                    else if ((piece_i.moveAnimation === null && piece_j.moveAnimation !== null)) {
                        pieceToAnimate = piece_i
                        pieceThatMayHaveCaptured = piece_j
                    }
                    if (pieceToAnimate && pieceToAnimate.captureAnimation === null){
                        pieceToAnimate.set_hasCollided(true, pieceThatMayHaveCaptured)
                        pieceToAnimate.triggerCaptureAnimation()
                        pieceThatMayHaveCaptured.set_hasCollided(true, pieceToAnimate)
                    }
                }
            }
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

    triggerInvalidPickAnimation(){
        var startTime = (Date.now() - this.scene.startTime)/1000
        this.invalidPickAnimation = new MyKeyframeAnimation([ 
            [[0,0,0], 0, 0, 0, [1,1,1]], 
            [[(Math.abs(this.x1) + Math.abs(this.x2))/50, (Math.abs(this.y1) + Math.abs(this.y2))/50,0], 0, 0, 0, [1,1,1]],
            [[- (Math.abs(this.x1) + Math.abs(this.x2))/50, - (Math.abs(this.y1) + Math.abs(this.y2))/50,0], 0, 0, 0, [1,1,1]],
            [[0,0,0], 0, 0, 0, [1,1,1]],
            ], 
            [startTime, startTime + 0.1, startTime + 0.2, startTime + 0.4], this.scene)        
    }

    computeAnimations(ellapsedTime){
        for (let i = 0; i < this.pieces.length; i++){
            this.pieces[i].computeAnimation(ellapsedTime)
        }
        this.computeAnimation(ellapsedTime)
    }

    computeAnimation(ellapsedTime){
        if (this.invalidPickAnimation !== null){
            var res = this.invalidPickAnimation.update(ellapsedTime)
            if (res === "animation over"){
                this.invalidPickAnimation = null
                console.log("Invalid Pick animation over")
                // push piece to auxiliar board ??
            }
        }
    }
}