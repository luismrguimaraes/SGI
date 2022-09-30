import { CGFobject } from '../../lib/CGF.js';
/**
 * MyTorus
 * @constructor
 */
export class MyTorus extends CGFobject {
	constructor(scene, id, inner, outer, slices, loops) {
		super(scene);
		this.smallRadius = (outer - inner)/2;
		this.bigRadius = inner + this.smallRadius;
		this.slices = slices;
		this.loops = loops;
		
		this.initBuffers();
	}
	
	initBuffers() {
		this.vertices = [];
		this.indices = [];
		this.normals = [];
		this.texCoords = [];
		
		var angleCircle = (2 * Math.PI) / this.slices;
		var angleBetweenCircles = (2 * Math.PI) / this.loops;
		var auxS = 1 / this.loops;
		var auxT = 1 / this.slices;

		for(var i=0;i<=this.loops;i++) {
			for(var j=0;j<=this.slices;j++) {
				var theta = i * angleBetweenCircles;
				var phi = j * angleCircle;
			
				var x = (this.bigRadius + this.smallRadius * Math.cos(theta)) * Math.cos(phi);
				var y = (this.bigRadius + this.smallRadius * Math.cos(theta)) * Math.sin(phi);
				var z = this.smallRadius * Math.sin(theta);
			
				var s = 1- i * auxS;
				var t = 1 - j * auxT;
			
				this.vertices.push(x,y,z);
				this.normals.push(x,y,z);
			
				this.texCoords.push(s,t);
			
			}
		}
		
		for(var i=0;i<this.loops;i++) {
			for(var j=0;j<this.slices;j++) {
				var mainCircleIndices = i * (this.slices + 1) + j;
				var secondaryCircleIndices = mainCircleIndices + this.slices;
			
				this.indices.push(mainCircleIndices, secondaryCircleIndices + 2, secondaryCircleIndices + 1);
				this.indices.push(mainCircleIndices, mainCircleIndices + 1, secondaryCircleIndices + 2);
			}
		}
		
		this.initialTexCoords=this.texCoords;
		
		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();		
	}
	
	updateTexCoords(s, t) {
		this.updateTexCoordsGLBuffers();
	}
}
