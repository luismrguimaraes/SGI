import { CGFobject } from '../../lib/CGF.js';
/**
 * MyTriangle
 * @constructor
 * @param scene - Reference to MyScene object
 * 
 */
export class MyTriangle extends CGFobject {
	constructor(scene, id, x1, y1, z1, x2, y2, z2, x3, y3, z3) {
		super(scene);
		this.x1 = x1;
		this.y1 = y1;
		this.z1 = z1;
		this.x2 = x2;
		this.y2 = y2;
		this.z2 = z2;
		this.x3 = x3;
		this.y3 = y3;
		this.z3 = z3;

		this.initBuffers();
	}
	
	initBuffers() {
		this.vertices = [
			this.x1, this.y1, this.z1,	//0
			this.x2, this.y2, this.z2,	//1
			this.x3, this.y3, this.z3,	//2
		];

		//Counter-clockwise reference of vertices
		this.indices = [
			0, 1, 2,
		];

		/*
			TODO
		*/
		this.normals = [
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
		];
		
		/*
		Texture coords (s,t)
		+----------> s
        |
        |
		|
		v
        t
        */
		/*
			TODO
		*/
		this.texCoords = [
			0, 1,
			1, 1,
			0, 0,
		]
		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}

	/**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the rectangle
	 * @param {Array} coords - Array of texture coordinates
	 */
	updateTexCoords(s, t) {
		var distanceA = Math.sqrt(Math.pow(this.x2 - this.x3], 2) + Math.pow(this.y2 - this.y3, 2) + Math.pow(this.z2 - this.z3, 2));
		var distanceB = Math.sqrt(Math.pow(this.x1 - this.x3, 2) + Math.pow(this.y1 - this.y3, 2) + Math.pow(this.z1 - this.z3, 2));
		var distanceC = Math.sqrt(Math.pow(this.x2 - this.x1, 2) + Math.pow(this.y2 - this.y1, 2) + Math.pow(this.z2 - this.z1, 2));
		
		var beta = Math.acos((Math.pow(distanceA, 2) - Math.pow(distanceB, 2) + Math.pow(distanceC, 2)) / (2 * distanceA * distanceC));
		var distanceD = distanceA * Math.sin(beta);
	
		this.texCoords = [
			0, distanceD / t,
			distanceC / s, distanceD / t,
			((distanceC - distanceA * Math.cos(beta)) / s), ((distanceD - distanceA * Math.sin(beta)) / t)
		];
	
		this.updateTexCoordsGLBuffers();
	}
}

