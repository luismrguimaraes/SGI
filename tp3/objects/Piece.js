import { MyRectangle} from "../primitives/MyRectangle.js"
import { CGFappearance, CGFobject } from '../../lib/CGF.js';
import { MySphere } from "../primitives/MySphere.js";

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

        this.isPickable = false
        this.isPicked = false
    }

    setPickable(value){
        this.isPickable = value
    }

    setPicked(value){
        this.isPicked = value
    }

    display(){
        let new_center_x = this.tile.x1 + (this.tile.x2 - this.tile.x1)/2 
        let new_center_y = this.tile.y1 + (this.tile.y2 - this.tile.y1)/2 
        this.scene.pushMatrix()
        this.scene.translate(new_center_x, new_center_y, 0)
        this.scene.scale(1,1,0.2)
        this.scene.translate(0, 0, 1)

        if (this.isPickable){
            var appearance = new CGFappearance(this.scene)
            if (this.color === 0){
                appearance.setEmission(0,0.1,0,1)
                appearance.setDiffuse(0.8,1,0.8,1)
            }
            else {
                appearance.setDiffuse(0,0.2,0,1)
            }
            appearance.apply()

            this.scene.registerForPick(this.scene.pickId++, this.sphere)
            this.sphere.display()
            this.scene.clearPickRegistration()

        }else if (this.isPicked){
            var appearance = new CGFappearance(this.scene)
            if (this.color === 0)
                appearance.setDiffuse(1,0.6,1,1)
            else appearance.setDiffuse(0,0,0,1)
            appearance.apply()
            this.rectangle.display()
        }else{
            var appearance = new CGFappearance(this.scene)
            if (this.color === 0)
                appearance.setDiffuse(1,1,1,1)
            else appearance.setDiffuse(0,0,0,1)
            appearance.apply()

            this.sphere.display()
        }
        this.scene.popMatrix()
    }

    /**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the sphere
	 */
	updateTexCoords(s, t) {		

	}
}