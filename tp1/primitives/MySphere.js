import { CGFobject } from '../../lib/CGF.js';
/**
 * MySphere
 * @constructor
 */
export class MySphere extends CGFobject {
	constructor(scene, radius, stacks, slices) {
		super(scene);
		this.radius = radius;
		this.sphereFrontHalf = new MySemiSphere(this.scene, stacks, slices);
		this.sphereBackHalf = new MySemiSphere(this.scene, stacks, slices);
	}
	
	display() {
		this.scene.pushMatrix();
		this.scene.scale(this.radius, this.radius, this.radius);
		this.sphereFrontHalf.display();
		this.scene.popMatrix();
		
		this.scene.pushMatrix();
		this.scene.scale(this.radius, this.radius, this.radius);
		this.scene.rotate(Math.PI, 1, 0, 0);
		this.sphereBackHalf.display();
		this.scene.popMatrix();		
	}
	
	updateTexCoords(s, t) {
        this.updateTexCoordsGLBuffers();
	}
}
