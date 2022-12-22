import { MyRectangle} from "../primitives/MyRectangle.js"
import { CGFappearance, CGFobject } from '../../lib/CGF.js';

/**
 * Tile
 * @constructor
 */
export class Tile{
    constructor (scene, board, color, id, x1, x2, y1, y2, board_x, board_y){
        this.scene = scene
        this.board = board
        this.color = color
        this.id = id
        this.rectangle = new MyRectangle(scene, id, x1, x2, y1, y2)
        this.rectangle.id = id
        this.isPickable = false
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

    display(){
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

            this.scene.registerForPick(this.scene.pickId++, this.rectangle)
            this.rectangle.display()
            this.scene.clearPickRegistration()
        }else{
            var appearance = new CGFappearance(this.scene)
            if (this.color === 0)
                appearance.setDiffuse(1,1,1,1)
            else appearance.setDiffuse(0,0,0,1)
            appearance.apply()
            this.rectangle.display()
        }
    }

    /**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the rectangle
	 */
	updateTexCoords(s, t) {		
		this.rectangle.updateTexCoords(s, t)
	}
}