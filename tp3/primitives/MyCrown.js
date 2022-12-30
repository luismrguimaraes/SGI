import { CGFobject } from '../../lib/CGF.js';

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
        this.rectangles = []
        this.triangles = []
        
        var r = this.width/2
        var theta = 2*Math.PI/this.slices

        // Vertices
        for (var i = 0; i < this.slices; i++) {
            /*
                Vertices:
                         2
                      /     \
                      - - - - 1
                    |         |
                    |         |
                      - - - - 0
            */
			this.vertices.push(
				r * Math.cos(i * theta),
				r * Math.sin(i * theta),
				0
			);
            this.normals.push(
				r * Math.cos(i * theta),
				r * Math.sin(i * theta),
				0
			);
            this.vertices.push(
				r * Math.cos(i * theta),
				r * Math.sin(i * theta),
				this.height/2
			);
            this.vertices.push(
				r * Math.cos((i + 0.5) * theta), 
				r * Math.sin((i + 0.5) * theta),
				this.height
			);
        }

        // Indices
        for (var i = 0; i < this.slices; i++) {
            console.log(i)
            let startIndex = i*3
            this.indices.push(startIndex + 0, startIndex + 1, startIndex + 4)
            this.indices.push(startIndex + 0, startIndex + 4, startIndex + 1) // (other side)
            this.indices.push(startIndex + 1, startIndex + 3, startIndex + 4)
            this.indices.push(startIndex + 1, startIndex + 4, startIndex + 3) // (other side)
            this.indices.push(startIndex + 1, startIndex + 2, startIndex + 3)
            this.indices.push(startIndex + 1, startIndex + 3, startIndex + 2) // (other side)
        }

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();		
	}
	
	updateTexCoords(s, t) {
		this.updateTexCoordsGLBuffers();
	}
}
