import { CGFobject } from '../../lib/CGF.js';
import { MyTriangle } from './MyTriangle.js';

/**
 * MyCrown
 * @constructor
 */
export class MyCrown extends CGFobject{
    /**
     * Crown is drawn in XY plane from `z == 0` to `z == height`
     * @param {*} scene 
     * @param {*} id 
     * @param {*} height 
     * @param {*} slices 
     */
	constructor(scene, id, width, height, slices = 5) {
		super(scene);
        this.width = width
		this.height = height;
        // minimum slices is 3
        if (slices < 3) 
            this.slices = 3
        else this.slices = slices

		this.initBuffers();
	}
	
	initBuffers() {
        this.triangles = []

        var r = this.width/2
        var theta = 2*Math.PI/this.slices

        // Vertices
        for (var i = 0; i < this.slices; i++) {
            /*
                One triangle and one rectangle:
                         v2
                         /\
                       /    \
                   v3 -------- v1
                     |        |
                     |        |
                   v4 -------- v0
            */
            var v0 = [
                r * Math.cos(i * theta),
                r * Math.sin(i * theta),
                0
            ]
            var v1 = [
                r * Math.cos(i * theta),
                r * Math.sin(i * theta),
                this.height/1.8
            ]
            var v2 = [
                r*1.1 * Math.cos((i+0.5) * theta),
                r*1.1 * Math.sin((i+0.5) * theta),
                this.height
            ]
            var v3 = [
                r * Math.cos((i+1) * theta),
                r * Math.sin((i+1) * theta),
                this.height/1.8
            ]
            var v4 = [
                r * Math.cos((i+1) * theta),
                r * Math.sin((i+1) * theta),
                0
            ]
            
            // Triangle
            this.triangles.push(
                new MyTriangle(this.scene, this.id + " triangle " + i, 
                    // v1
                    v1[0], v1[1], v1[2],
                    // v2
                    v2[0], v2[1], v2[2],
                    // v3
                    v3[0], v3[1], v3[2]
                ),
                new MyTriangle(this.scene, this.id + " triangle " + i, 
                    // v1
                    v1[0], v1[1], v1[2],
                    // v3
                    v3[0], v3[1], v3[2],
                    // v2
                    v2[0], v2[1], v2[2]
                )
            )
            
            // Rectangles Part 1
            this.triangles.push(
                new MyTriangle(this.scene, this.id + " triangle " + i, 
                    // v0
                    v0[0], v0[1], v0[2],
                    // v1
                    v1[0], v1[1], v1[2],
                    // v4
                    v4[0], v4[1], v4[2]
                ),
                new MyTriangle(this.scene, this.id + " triangle " + i, 
                    // v0
                    v0[0], v0[1], v0[2],
                    // v4
                    v4[0], v4[1], v4[2],
                    // v1
                    v1[0], v1[1], v1[2]
                )
            )
            // Rectangles Part 2
            this.triangles.push(
                new MyTriangle(this.scene, this.id + " triangle " + i, 
                    // v1
                    v1[0], v1[1], v1[2],
                    // v3
                    v3[0], v3[1], v3[2],
                    // v4
                    v4[0], v4[1], v4[2]
                ),
                new MyTriangle(this.scene, this.id + " triangle " + i, 
                    // v1
                    v1[0], v1[1], v1[2],
                    // v4
                    v4[0], v4[1], v4[2],
                    // v3
                    v3[0], v3[1], v3[2]
                )
            )
	    }
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
