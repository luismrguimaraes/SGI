import { CGFobject } from '../../lib/CGF.js';
/**
 * MyTorus
 * @constructor
 */
export class MyTorus extends CGFobject {
	constructor(scene, id, inner, outter, slices, loops) {
		super(scene);
		this.r=(outter-inner)/2;
		this.R=inner+this.r;
		this.slices=slices;
		this.loops=loops;
		
		this.initBuffers();
	}
	
	initBuffers() {
		this.vertices = [];
		this.indices = [];
		this.normals = [];
		this.texCoords = [];
		
		
		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();		
	}
	
	updateTexCoords(s, t) {
		this.updateTexCoordsGLBuffers();
	}
}
