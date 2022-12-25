import { MyRectangle} from "../primitives/MyRectangle.js"
import { CGFappearance, CGFobject } from '../../lib/CGF.js';
import { MySphere } from "../primitives/MySphere.js";
import { MyKeyframeAnimation } from "../animations/MyKeyframeAnimation.js";

/**
 * Piece
 * @constructor
 */
export class Piece{
    constructor (scene, board, color, id, tile){
        this.scene = scene
        this.board = board
        this.color= color
        this.id = id
        this.tile = tile
        this.sphere = new MySphere(this.scene, Math.min(Math.abs(tile.x2 - tile.x1), Math.abs(tile.y2 - tile.y1))/3, 25, 25)
        this.sphere.parent = this

        this.isPickable = false
        this.isPicked = false
        this.isKing = false
        this.hasMovedThisTurn = false

        // animations
        this.pickAnimation = null
    }

    setPickable(value){
        this.isPickable = value
    }

    setPicked(value){
        this.isPicked = value
    }

    set_isKing(value){
        this.isKing = value
    }

    set_hasMovedThisTurn(value){
        this.hasMovedThisTurn = value
    }

    getBoardPosition(){
        if (this.board.id !== 'mainboard') 
            return "not in mainboard"
        return `${this.tile.board_x} ${this.tile.board_y}`
    }

    move(x, y){
        if (this.board.get(x, y).isFree){
            this.tile.isFree = true
            this.tile = this.board.get(x, y)
            this.tile.isFree = false
        }
        else {
            console.log("Tile occupied")
            return "Tile " + x + ", " + y + " occupied"
        }
    }

    triggerPickAnimation(){
        var startTime = (Date.now() - this.scene.startTime)/1000
        this.pickAnimation = new MyKeyframeAnimation([ 
            [[0,0,0], 0, 0, 0, [1,1,1]], 
            [[0,0,0], 0, 0.2, 0.5, [1,1,1]],
            [[0,0,0], 0, 0, -0.4, [1,1,1]],
            [[0,0,0], 0, 0, 0, [1,1,1]] ], 
            [startTime, startTime + 0.1, startTime + 0.2, startTime + 0.5], this.scene)
    }

    computeAnimation(ellapsedTime){
        if (this.pickAnimation !== null){
            var res = this.pickAnimation.update(ellapsedTime)
            if (res === "animation over"){
                this.pickAnimation = null
                console.log("pick animation over")
            }
        }
    }

    displayPiece(appearance){
        if (this.pickAnimation !== null){
            this.scene.scale(1,1,1/0.3)
            this.pickAnimation.apply()
            this.scene.scale(1,1,0.3)
        }
        if (this.isKing){
            appearance.apply()
            this.sphere.display()
            this.scene.translate(0, 0, this.sphere.radius*5/3)
            
            appearance.setSpecular(1,1,1, 1)
            appearance.apply()
            this.sphere.display()
        }
        appearance.apply()
        this.sphere.display()
    }

    display(){
        let new_center_x = this.tile.x1 + (this.tile.x2 - this.tile.x1)/2 
        let new_center_y = this.tile.y1 + (this.tile.y2 - this.tile.y1)/2 
        this.scene.pushMatrix()
        this.scene.translate(new_center_x, new_center_y, 0)
        this.scene.scale(1,1,0.3)
        this.scene.translate(0, 0, 1)

        var appearance = new CGFappearance(this.scene)
        if (this.isPicked){
            // Picked pieces are not registered for picking
            if (this.color === 0){
                appearance.setEmission(0,0,0.25, 1)
                appearance.setDiffuse(0.45,0.45,0.45, 1)
                appearance.setSpecular(1,1,1, 1)
            }
            else {
                appearance.setEmission(0,0,0.15, 1)
                appearance.setDiffuse(0.1,0.1,0.1, 1)
                appearance.setSpecular(1,1,1, 1)
            }

            this.scene.translate(0, 0, Math.abs(this.tile.x2 - this.tile.x1) + Math.abs(this.tile.y2 - this.tile.y1))
            this.displayPiece(appearance)

        }else if (this.isPickable){
            if (this.color === 0){
                appearance.setEmission(0,0.25,0, 1)
                appearance.setDiffuse(0.45,0.45,0.45, 1)
                appearance.setSpecular(0.3,0.3,0.3, 1)
            }
            else {
                appearance.setEmission(0,0.15,0, 1)
                appearance.setDiffuse(0.1,0.1,0.1, 1)
                appearance.setSpecular(0.7,0.7,0.7, 1)

            }

            this.scene.registerForPick(this.scene.pickId++, this.sphere)
            this.displayPiece(appearance)
            this.scene.clearPickRegistration()

        }else{
            //Not Picked or Pickable
            if (this.color === 0){
                appearance.setDiffuse(0.6,0.6,0.6, 1)
                appearance.setSpecular(0.7,0.7,0.7, 1)
            }
            else{
                appearance.setDiffuse(0.1,0.1,0.1, 1)
                appearance.setSpecular(0.7,0.7,0.7, 1)
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