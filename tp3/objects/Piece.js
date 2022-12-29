import { MyRectangle} from "../primitives/MyRectangle.js"
import { CGFappearance, CGFobject } from '../../lib/CGF.js';
import { MySphere } from "../primitives/MySphere.js";
import { MyKeyframeAnimation } from "../animations/MyKeyframeAnimation.js";

/**
 * Piece
 * @constructor
 */
export class Piece{
    /**
     * 
     * @param {*} referenceTile (optional) Provides the piece size information
     */
    constructor (scene, board, color, id, tile, referenceTile = tile){
        this.scene = scene
        this.board = board
        this.color= color
        this.id = id
        this.tile = tile
        this.sphere = new MySphere(this.scene, Math.min(Math.abs(referenceTile.x2 - referenceTile.x1), Math.abs(referenceTile.y2 - referenceTile.y1))/3, 25, 25)
        this.sphere.parent = this
        this.displayCenterX = this.tile.x1 + (this.tile.x2 - this.tile.x1)/2
        this.displayCenterY = this.tile.y1 + (this.tile.y2 - this.tile.y1)/2

        this.isPickable = false
        this.isPicked = false
        this.isKing = false
        this.fusedPiece = null
        this.hasMovedThisTurn = false
        this.hasCapturedThisTurn = false

        // animations
        this.pickAnimation = null
        this.moveAnimation = null
        this.moveDestX = null // move destination X
        this.moveDestY = null // move destination Y
    }

    setPickable(value){
        this.isPickable = value
    }

    setPicked(value){
        this.isPicked = value
    }

    set_isKing(value, fusingPiece = null){
        if (value && fusingPiece === null)
            console.warn("Warning: fusingPiece is null")
        this.isKing = value
        this.fusedPiece = fusingPiece
    }

    set_hasMovedThisTurn(value){
        this.hasMovedThisTurn = value
    }

    set_hasCapturedThisTurn(value){
        this.hasCapturedThisTurn = value
    }

    getBoardPosition(){
        if (this.board.id !== 'mainboard'){ 
            return null
        }
        return `${this.tile.board_x} ${this.tile.board_y}`
    }

    /**
     * Updates this.tile
     * Sets the old tile as free and the new one as occuppied
     * Updates display centers
     * @param {*} newTile 
     */
    changeTile(newTile){
        if (this.tile !== null)
            this.tile.isFree = true
        if (newTile){
            this.tile = newTile
            this.tile.isFree = false
            this.displayCenterX = this.tile.x1 + (this.tile.x2 - this.tile.x1)/2
            this.displayCenterY = this.tile.y1 + (this.tile.y2 - this.tile.y1)/2
        }
        else{
            this.tile = null
            this.displayCenterX = null
            this.displayCenterY = null
        }
        
    }

    move(x, y){
        this.scene.game.makeAllTilesUnpickable()
        this.scene.game.makeAllPiecesUnpickable()
        this.setPicked(false);

        if (this.board.getTile(x, y).isFree){
            if (this.getBoardPosition() !== null){
                this.moveDestX = x
                this.moveDestY = y
                this.triggerMoveAnimation()
            }
            else {
                console.warn(this.id + " not in mainboard")
                return null
            }
        }
        else {
            console.warn("Tile " + this.tile.id + " occupied")
            return null
        }
    }

    triggerMoveAnimation(){
        var startTime = (Date.now() - this.scene.startTime)/1000
        var destTile = this.board.getTile(this.moveDestX, this.moveDestY)
        var new_displayCenterX = destTile.x1 + (destTile.x2 - destTile.x1)/2
        var new_displayCenterY = destTile.y1 + (destTile.y2 - destTile.y1)/2
        // Translation parameters to get to destination
        var tx = new_displayCenterX - this.displayCenterX
        var ty = new_displayCenterY - this.displayCenterY
        var dist = Math.abs(tx) + Math.abs(ty)

        this.moveAnimation = new MyKeyframeAnimation([ 
            [[0, 0, 0], 0, 0,0, [1,1,1]],  
            [[1.045*tx, 1.045*ty, 0], 0, 0, 0, [1,1,1]],
            [[0.99*tx, 0.99*ty, 0], 0, 0, 0, [1,1,1]],
            [[tx, ty, 0], 0, 0, 0, [1,1,1]],
            ], 
            [startTime, startTime + 0.6*dist, startTime + 0.6*dist + 0.1, startTime + 0.6*dist + 0.2], this.scene)
    }
    moveAnimationOnEnd(){
        // Store original position
        var originalBoardPosition = this.getBoardPosition();

        // Update this.tile
        this.changeTile(this.board.getTile(this.moveDestX, this.moveDestY))

        // Notify this.scene.game
        var newBoardPosition = this.getBoardPosition();
        this.scene.game.set_lastMovedPiece(this);
        this.scene.game.pieceHasBeenMoved(originalBoardPosition, newBoardPosition);
        
        //TEST
        for (let i = 0; i < this.board.pieces.length; i++)
            this.board.pieces[i].setPickable(true)
    }

    triggerPickAnimation(){
        var startTime = (Date.now() - this.scene.startTime)/1000
        this.pickAnimation = new MyKeyframeAnimation([ 
            [[0,0,0], 0, 0, 0, [1,1,1]], 
            [[0,0,0], 0, 0.3, 0.5, [1,1,1]],
            [[0,0,0], 0, 0.2, -0.4, [1,1,1]],
            [[0,0,0], 0, -0.1, 0.2, [1,1,1]],
            [[0,0,0], 0, 0, 0, [1,1,1]] ], 
            [startTime, startTime + 0.1, startTime + 0.2, startTime + 0.4, startTime + 0.6], this.scene)
    }

    computeAnimation(ellapsedTime){
        if (this.pickAnimation !== null){
            var res = this.pickAnimation.update(ellapsedTime)
            if (res === "animation over"){
                this.pickAnimation = null
                console.log("Pick animation over")
            }
        }
        if (this.moveAnimation !== null){
            var res = this.moveAnimation.update(ellapsedTime)
            if (res === "animation over"){
                this.moveAnimation = null
                console.log("Move animation over")
                this.moveAnimationOnEnd()
            }
        }
    }

    /**
     * 
     * Called by display() 
     */
    displayPiece(appearance){
        if (this.moveAnimation !== null){
            this.scene.scale(1,1,1/0.3) // "revert" scale to make rotations visually relevant
            this.moveAnimation.apply()
            this.scene.scale(1,1,0.3)
        }
        if (this.pickAnimation !== null){
            this.scene.scale(1,1,1/0.3) // "revert" scale to make rotations visually relevant
            this.pickAnimation.apply()
            this.scene.scale(1,1,0.3)
        }

        // Apply picked scale
        var pickedFactor = 1.15
        if (this.isPicked)
            this.scene.scale(pickedFactor, pickedFactor, pickedFactor)

        if (this.isKing){
            appearance.apply()
            this.scene.scale(1.1, 1.1, 1.1)
            this.sphere.display()
            this.scene.translate(0, 0, this.sphere.radius*5/3)
            this.sphere.display()
            this.scene.scale(1/1.1, 1/1.1, 1/1.1)
        }else{
            appearance.apply()
            this.sphere.display()
        }

        // Remove picked scale
        if (this.isPicked)
            this.scene.scale(pickedFactor, pickedFactor, pickedFactor)
    }

    display(){
        this.scene.pushMatrix()
        this.scene.translate(this.displayCenterX, this.displayCenterY, 0)
        this.scene.scale(1,1,0.3)
        this.scene.translate(0, 0, this.sphere.radius)

        var appearance = new CGFappearance(this.scene)
        if (this.isPicked){
            // (Picked pieces are not registered for picking)
            if (this.color === 0){
                //appearance.setEmission(0,0,0.25, 1)
                if (this.isKing)
                    appearance.setDiffuse(0.65,0.65,0.4, 1)
                else appearance.setDiffuse(0.65,0.65,0.65, 1)
                appearance.setSpecular(0.2,0.2,0.2, 1)
            }
            else {
                //appearance.setEmission(0,0,0.15, 1)
                if (this.isKing)
                    appearance.setDiffuse(0.2,0.2,0.03, 1)
                else appearance.setDiffuse(0.1,0.1,0.1, 1)
                appearance.setSpecular(0.6,0.6,0.6, 1)
            }
            this.scene.translate(0, 0, (Math.abs(this.tile.x2 - this.tile.x1) + Math.abs(this.tile.y2 - this.tile.y1))/2)
            this.displayPiece(appearance)

        }else if (this.isPickable){
            if (this.color === 0){
                appearance.setEmission(0,0.2,0, 1)
                if (this.isKing)
                    appearance.setDiffuse(0.55,0.75,0.3, 1)
                else appearance.setDiffuse(0.45,0.65,0.45, 1)
                appearance.setSpecular(0.1,0.3,0.1, 1)
            }
            else {
                appearance.setEmission(0,0.2,0, 1)
                if (this.isKing)
                    appearance.setDiffuse(0.3,0.5,0.03, 1)
                else appearance.setDiffuse(0.1,0.3,0.1, 1)
                appearance.setSpecular(0.6,0.8,0.6, 1)

            }
            this.scene.registerForPick(this.scene.pickId++, this.sphere)
            this.displayPiece(appearance)
            this.scene.clearPickRegistration()

        }else{
            //Not Picked or Pickable
            if (this.color === 0){
                if (this.isKing)
                    appearance.setDiffuse(0.65,0.65,0.4, 1)
                else appearance.setDiffuse(0.65,0.65,0.65, 1)
                appearance.setSpecular(0.2,0.2,0.2, 1)
            }
            else{
                if (this.isKing)
                    appearance.setDiffuse(0.2,0.2,0.03, 1)
                else appearance.setDiffuse(0.1,0.1,0.1, 1)
                appearance.setSpecular(0.6,0.6,0.6, 1)
            }

            this.displayPiece(appearance)
        }
        this.scene.popMatrix()
    }

    /**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the sphere
	 */
	updateTexCoords(s, t) {		
        this.sphere.updateTexCoords(s, t)
	}
}