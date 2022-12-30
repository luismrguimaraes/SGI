import { MyRectangle} from "../primitives/MyRectangle.js"
import { CGFappearance, CGFobject } from '../../lib/CGF.js';
import { MyRectangleContour } from "../primitives/MyRectangleContour.js";

/**
 * Tile
 * @constructor
 */
export class Tile{
    constructor (scene, board, color, id, x1, x2, y1, y2, board_x, board_y, texture){
        this.scene = scene
        this.board = board
        this.color = color
        this.id = id
        this.texture = texture
        this.rectangle = new MyRectangle(scene, id, x1, x2, y1, y2)
        let contourWidth = Math.min(Math.abs(x2 - x1), Math.abs(y2 - y1))/25
        this.contour = new MyRectangleContour(scene, this.id + " contour", contourWidth, x1, x2, y1, y2)

        this.isPickable = false
        this.isFree = true
        this.piece = null
        this.board_x = board_x
        this.board_y = board_y

        this.x1 = x1
        this.x2 = x2
        this.y1 = y1
        this.y2 = y2
    }

    setPickable(value){
        this.isPickable = value
    }

    set_isFree(value, piece = null){
        if (!value && piece === null)
            console.warn("Tile " + this.id + " set to occupied but it piece is null")
        this.isFree = value
        this.piece = piece
    }

    display(){
        // If piece on it Pickable and not Picked,
        // Display Contour
        if (this.piece && this.piece.isPickable && !this.piece.isPicked){
            this.scene.pushMatrix()
            var contourAppearance = new CGFappearance(this.scene)
            contourAppearance.setDiffuse(0.5,0.5,0.5, 1)
            contourAppearance.setSpecular(0.5,0.5,0.5, 1)
            contourAppearance.setEmission(0.3,0.3,0.3, 1)
            this.scene.translate(0, 0, 0.001)
            contourAppearance.apply()
            this.contour.display()
            this.scene.popMatrix()
        }

        // Display Tile
        this.scene.pushMatrix()
        var appearance = new CGFappearance(this.scene)
        if (this.texture != 'none') 
            appearance.setTexture(this.texture)

        if (this.piece && this.piece.isPicked){
            if (this.color === 0){
                appearance.setEmission(1,1,0, 1)
                appearance.setDiffuse(209/256, 166/256, 109/256, 1)
                appearance.setSpecular(0,0,0, 1)
            }
            else {
                appearance.setEmission(1,1,0, 1)
                appearance.setDiffuse(148/256, 82/256, 59/256,1)
                appearance.setSpecular(0,0,0, 1)
            }
            appearance.apply()

            this.rectangle.display()
        }
        else if (this.isPickable){
            if (this.color === 0){
                appearance.setEmission(0,1,0, 1)
                appearance.setDiffuse(129/256, 256/256, 29/256,1)
                appearance.setSpecular(0,0,0, 1)
            }
            else {
                appearance.setEmission(0,1,0, 1)
                appearance.setDiffuse(118/256, 162/236, 29/236,1)
                appearance.setSpecular(0,0,0, 1)
            }
            appearance.apply()

            this.scene.registerForPick(this.scene.pickId++, this)
            this.rectangle.display()
            this.scene.clearPickRegistration()
        }else{
            if (this.color === 0){
                appearance.setDiffuse(209/256, 166/256, 109/256,1)
                appearance.setSpecular(0.2,0.2,0.2, 1)
            }
            else {
                appearance.setDiffuse(148/256, 82/256, 59/256,1)
                appearance.setSpecular(0.2,0.2,0.2, 1)
            }
            appearance.apply()
            this.rectangle.display()
        }
        this.scene.popMatrix()
    }

    /**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the rectangle
	 */
	updateTexCoords(s, t) {		
		this.rectangle.updateTexCoords(s, t)
	}
}