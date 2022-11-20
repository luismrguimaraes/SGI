import { CGFobject } from '../../lib/CGF.js';
/**
 * MySemiSphere
 * @constructor
 */
export class MySemiSphere extends CGFobject {
	constructor(scene, stacks, slices) {
		super(scene);
		this.stacks = stacks;
		this.slices = slices;
		
		this.initBuffers();
	}
	
	initBuffers() {
		this.vertices = [];
		this.indices = [];
		this.normals = [];
		this.texCoords = [];
		
		var theta = 2 * Math.PI / this.slices;
		var phi = (Math.PI / 2) / this.stacks;

		for (var j = 0; j <= this.stacks; j++) {
			for (var i = 0; i <= this.slices; i++) {
				this.vertices.push(Math.cos(theta * i) * Math.cos(phi * j), Math.sin(theta * i) * Math.cos(phi * j), Math.sin(phi * j));
				this.normals.push(Math.cos(theta * i) * Math.cos(phi * j), Math.sin(theta * i) * Math.cos(phi * j), Math.sin(phi * j));
				this.texCoords.push(i * 1 / this.slices, j * 1 / this.stacks);
			}
		}


		for (var i = 0; i < this.stacks; i++) {
			for (var j = 0; j < this.slices; j++) {
				this.indices.push(i * (this.slices + 1) + j, i * (this.slices + 1) + 1 + j, (i + 1) * (this.slices + 1) + j);
				this.indices.push(i * (this.slices + 1) + 1 + j, (i + 1) * (this.slices + 1) + 1 + j, (i + 1) * (this.slices + 1) + j);
			}
		}
		
		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();	
	}
}
