import { CGFobject } from '../../lib/CGF.js';
import { MyTriangle } from './MyTriangle.js';

/**
 * MyCrown
 * @constructor
 */
export class MyRectangleContour extends CGFobject{
    /**
     * 
     * @param {*} scene 
     * @param {*} id 
     * @param {*} width Contour width
     * @param {*} x1 
     * @param {*} x2 
     * @param {*} y1 
     * @param {*} y2 
     */
	constructor(scene, id, width, x1, x2, y1, y2){
		super(scene);
        this.id = id
        this.width = width
        this.x1 = x1
        this.x2 = x2
        this.y1 = y1
        this.y2 = y2
		this.initBuffers();
	}
	
	initBuffers() {
        this.triangles = []

        /*
    Bigger rectangle vertices:
        v4 (x1, y2) - - - - - v3 (x2, y2)
                    |  - - -  |
                    | |     | |
                    | |     | |
                    |  - - -  |
        v1 (x1, y1) - - - - - v2 (x2, y1)

    Smaller rectangle vertices:
     vv4 (x1 + width,          vv3 (x2 - width,
          y2 + width)   - - -       y2 - width)
                       |     |
     vv1 (x1 + width,  |     | vv2 (x2 - width,
          y1 + width)   - - -       y1 + width)

        */
        // Bigger rectangle vertices
        var v1 = [this.x1, this.y1, 0]
        var v2 = [this.x2, this.y1, 0]
        var v3 = [this.x2, this.y2, 0]
        var v4 = [this.x1, this.y2, 0]
        // Smaller rectangle vertices
        var vv1 = [this.x1 + this.width, this.y1 + this.width, 0]
        var vv2 = [this.x2 - this.width, this.y1 + this.width, 0]
        var vv3 = [this.x2 - this.width, this.y2 - this.width, 0]
        var vv4 = [this.x1 + this.width, this.y2 - this.width, 0]

        // Right Trapezium
        this.triangles.push(
            new MyTriangle(this.scene, this.id + " triangle " + this.triangles.length,
                v2[0], v2[1], v2[2],
                v3[0], v3[1], v3[2],
                vv3[0], vv3[1], vv3[2]
            ),
            new MyTriangle(this.scene, this.id + " triangle " + this.triangles.length,
                vv3[0], vv3[1], vv3[2],
                vv2[0], vv2[1], vv2[2],
                v2[0], v2[1], v2[2]
            )
        )
        // Top Trapezium
        this.triangles.push(
            new MyTriangle(this.scene, this.id + " triangle " + this.triangles.length,
                v3[0], v3[1], v3[2],
                v4[0], v4[1], v4[2],
                vv4[0], vv4[1], vv4[2]
            ),
            new MyTriangle(this.scene, this.id + " triangle " + this.triangles.length,
                vv4[0], vv4[1], vv4[2],
                vv3[0], vv3[1], vv3[2],
                v3[0], v3[1], v3[2]
            )
        )
        // Left Trapezium
        this.triangles.push(
            new MyTriangle(this.scene, this.id + " triangle " + this.triangles.length,
                v4[0], v4[1], v4[2],
                v1[0], v1[1], v1[2],
                vv1[0], vv1[1], vv1[2]
            ),
            new MyTriangle(this.scene, this.id + " triangle " + this.triangles.length,
                vv1[0], vv1[1], vv1[2],
                vv4[0], vv4[1], vv4[2],
                v4[0], v4[1], v4[2]
            )
        )
        // Bottom Trapezium
        this.triangles.push(
            new MyTriangle(this.scene, this.id + " triangle " + this.triangles.length,
                v1[0], v1[1], v1[2],
                v2[0], v2[1], v2[2],
                vv2[0], vv2[1], vv2[2]
            ),
            new MyTriangle(this.scene, this.id + " triangle " + this.triangles.length,
                vv2[0], vv2[1], vv2[2],
                vv1[0], vv1[1], vv1[2],
                v1[0], v1[1], v1[2]
            )
        )
    }

    display(){
        for (let i = 0; i < this.triangles.length; i++){
            this.triangles[i].display()
        }
    }
	
	updateTexCoords(s, t) {
        for (let i = 0; i < this.triangles.length; i++){
            this.triangles[i].updateTexCoords(s, t)
        }
		this.updateTexCoordsGLBuffers();
	}
}
