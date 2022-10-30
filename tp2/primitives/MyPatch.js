import { CGFobject } from '../../lib/CGF.js';
import { CGFnurbsObject, CGFnurbsSurface } from '../../lib/CGF.js';

/**
 * MyPatch
 * @constructor
 */
export class MyPatch extends CGFobject {
	constructor(scene, id, degree_u, parts_u, degree_v, parts_v, vertexes) {
		super(scene);


		/*
		for (var i = 0; i < control_points.length(); i++){
			control_points[i].push(1)

		}*/

        var nurbsSurface = new CGFnurbsSurface(degree_u, degree_v, vertexes);		
        this.obj = new CGFnurbsObject(this.scene, parts_u, parts_v, nurbsSurface );

		//this.initBuffers();
	}

	display(){
		this.obj.display();
	}
	
	/*
	initBuffers() {
		this.vertices = [
			this.x1, this.y1, 0,	//0
			this.x2, this.y1, 0,	//1
			this.x1, this.y2, 0,	//2
			this.x2, this.y2, 0		//3
		];

		this.indices = [
			0, 1, 2,
			1, 3, 2
		];

		this.normals = [
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
			0, 0, 1
		];

		this.texCoords = [
			0, 1,
			1, 1,
			0, 0,
			1, 0
		]
		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}

	updateTexCoords(coords) {
		this.texCoords = [...coords];
		this.updateTexCoordsGLBuffers();
	}*/
	
}

