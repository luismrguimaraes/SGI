import { MyRectangle} from "./MyRectangle.js"
import { CGFappearance, CGFobject } from '../../lib/CGF.js';

/**
 * Tile
 * @constructor
 */
export class Tile{
    constructor (scene, board, color, id, x1, x2, y1, y2){
        this.scene = scene
        this.board = board
        this.color= color
        this.id = id
        this.rectangle = new MyRectangle(scene, id, x1, x2, y1, y2)
    }

    display(){
        var appearance = new CGFappearance(this.scene)
        if (this.color === 0)
            appearance.setDiffuse(1,1,1)
        else appearance.setDiffuse(0,0,0)
        appearance.apply()
        this.rectangle.display()
    }

    /**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the rectangle
	 */
	updateTexCoords(s, t) {		
		this.rectangle.updateTexCoords(s, t)
	}
}