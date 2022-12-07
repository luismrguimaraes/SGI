import { CGFobject } from '../../lib/CGF.js';
import { MyCircle } from './MyCircle.js';
/**
 * MyCylinder
 * @constructor
 */
export class MyCylinder extends CGFobject {
	constructor(scene, id, base, top, height, slices, stacks) {
		super(scene);
		this.base = base;
		this.top = top;
		this.height = height;
		this.slices = slices;
		this.stacks = stacks;	
		this.layer = new MyCircle(scene, this.slices);

		this.initBuffers();
	}
	
	initBuffers() {
		this.vertices = [];
		this.indices = [];
		this.normals = [];
		this.texCoords = [];
		
		var r = this.base;
		var delta_r = (this.top - this.base) / this.stacks;
		var delta_rad = 2 * Math.PI / this.slices;
		var delta_z = this.height / this.stacks;
		var m = this.height / (this.base - this.top);
		var maxheight;
		if (this.base > this.top)
			maxheight = this.top * m + this.height;
		else maxheight = this.base * m + this.height;
		var indice = 0;

		for (var i = 0; i <= this.stacks; i++) {
			for (var j = 0; j <= this.slices; j++) {
			this.vertices.push(
				r * Math.cos(j * delta_rad),
				r * Math.sin(j * delta_rad),
				i * delta_z
			);
			if (Math.abs(this.base - this.top) < 0.0001) {
				this.normals.push(
				Math.cos(j * delta_rad),
				Math.sin(j * delta_rad),
				0);
			} else if (this.base > this.top) {
				this.normals.push(
				maxheight * Math.cos(j * delta_rad) / Math.sqrt(Math.pow(this.base, 2) + Math.pow(maxheight, 2)),
				maxheight * Math.sin(j * delta_rad) / Math.sqrt(Math.pow(this.base, 2) + Math.pow(maxheight, 2)),
				this.base / Math.sqrt(Math.pow(this.base, 2) + Math.pow(maxheight, 2))
				);
			} else {
				this.normals.push(
				maxheight * Math.cos(j * delta_rad) / Math.sqrt(Math.pow(this.top, 2) + Math.pow(maxheight, 2)),
				maxheight * Math.sin(j * delta_rad) / Math.sqrt(Math.pow(this.top, 2) + Math.pow(maxheight, 2)),
				this.top / Math.sqrt(Math.pow(this.top, 2) + Math.pow(maxheight, 2))
				);
			}
			this.texCoords.push(j / this.slices, i / this.stacks);

			}
			r = (i + 1) * delta_r + this.base;
		}

		for (var i = 0; i < this.stacks; i++) {
			for (var j = 0; j < this.slices; j++) {
				this.indices.push(
					i * (this.slices + 1) + j,
					i * (this.slices + 1) + (j + 1),
					(i + 1) * (this.slices + 1) + (j + 1)
				);
				this.indices.push(
					(i + 1) * (this.slices + 1) + (j + 1),
					(i + 1) * (this.slices + 1) + j,
					i * (this.slices + 1) + j
				);
			}
		}

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();		
	}
	
	updateTexCoords(s, t) {
		this.updateTexCoordsGLBuffers();
	}
}
