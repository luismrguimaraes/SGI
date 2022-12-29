import { CGFappearance, CGFscene } from '../lib/CGF.js';
import { CGFaxis,CGFcamera } from '../lib/CGF.js';
import { Game } from './objects/Game.js';
import { Player } from './objects/Player.js';
import { MyRectangle } from './primitives/MyRectangle.js';



var DEGREE_TO_RAD = Math.PI / 180;
var updatePeriod = 10

/**
 * XMLscene class, representing the scene that is to be rendered.
 */
export class XMLscene extends CGFscene {
    /**
     * @constructor
     * @param {MyInterface} myinterface 
     */
    constructor(myinterface) {
        super();

        this.interface = myinterface;
		this.lightValues = {};
        this.pickedPiece = null
    }

    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
     * @param {CGFApplication} application
     */
    init(application) {
        super.init(application);

        this.sceneInited = false;

        this.initCameras();

        this.enableTextures(true);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.axis = new CGFaxis(this);
        this.setUpdatePeriod(100);

        this.setPickEnabled(true);
    }

    /**
     * Initializes the scene cameras.
     */
    initCameras() {
        this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
    }
    /**
     * Initializes the scene lights with the values read from the XML file.
     */
    initLights() {
        var i = 0;
        // Lights index.

        // Reads the lights from the scene graph.
        for (var key in this.graph.lights) {
            if (i >= 8)
                break;              // Only eight lights allowed by WebGL.

            if (this.graph.lights.hasOwnProperty(key)) {
                var light = this.graph.lights[key];

                this.lights[i].setPosition(light[2][0], light[2][1], light[2][2], light[2][3]);
                this.lights[i].setAmbient(light[3][0], light[3][1], light[3][2], light[3][3]);
                this.lights[i].setDiffuse(light[4][0], light[4][1], light[4][2], light[4][3]);
                this.lights[i].setSpecular(light[5][0], light[5][1], light[5][2], light[5][3]);
				//this.lights[i].setConstantAttenuation(light[6][0], light[6][1], light[6][2]);
				//this.lights[i].setLinearAttenuation(light[6][0], light[6][1], light[6][2]);
				//this.lights[i].setQuadraticAttenuation(light[6][0], light[6][1], light[6][2]);

                if (light[1] == "spot") {
                    this.lights[i].setSpotCutOff(light[6]);
                    this.lights[i].setSpotExponent(light[7]);
                    this.lights[i].setSpotDirection(light[8][0], light[8][1], light[8][2]);
					this.lights[i].setConstantAttenuation(light[9][0]);
					this.lights[i].setLinearAttenuation(light[9][1])
					this.lights[i].setQuadraticAttenuation(light[9][2]);
                }
				else {
					this.lights[i].setConstantAttenuation(light[6][0]);
					this.lights[i].setLinearAttenuation(light[6][1])
					this.lights[i].setQuadraticAttenuation(light[6][2]);
				}

                this.lights[i].setVisible(false);
                if (light[0])
                    this.lights[i].enable();
                else
                    this.lights[i].disable();

                this.lights[i].update();
                i++;
            }
        }
    }

    setDefaultAppearance() {
        this.setAmbient(0.2, 0.4, 0.8, 1.0);
        this.setDiffuse(0.2, 0.4, 0.8, 1.0);
        this.setSpecular(0.2, 0.4, 0.8, 1.0);
        this.setShininess(10.0);
    }
    /** Handler called when the graph is finally loaded. 
     * As loading is asynchronous, this may be called already after the application has started the run loop
     */
    onGraphLoaded() {
        this.axis = new CGFaxis(this, this.graph.referenceLength);

        this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);

        this.setGlobalAmbientLight(this.graph.ambient[0], this.graph.ambient[1], this.graph.ambient[2], this.graph.ambient[3]);

        this.initLights();

        this.sceneInited = true;
		
		// Add group of lights
		this.interface.addLightsGroup(this.graph.lights);

        this.setUpdatePeriod(updatePeriod);
        this.startTime = null;
		
		// Add initialization of Game instance
		this.game = new Game(this);
    }

    /**
     * Displays the scene.
     */
    display() {
        this.logPicking();
		// this resets the picking buffer (association between objects and ids)
		this.clearPickRegistration();
        this.pickId = 1

        // ---- BEGIN Background, camera and axis setup

        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();

        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        this.pushMatrix();
        //this.axis.display();

        /*for (var i = 0; i < this.lights.length; i++) {
            this.lights[i].setVisible(true);
            this.lights[i].enable();
        }*/
		
		// Handles lights enabling/disabling according to interface information
		var i = 0;
        for (var key in this.lightValues) {
            if (this.lightValues.hasOwnProperty(key)) {
                if (this.lightValues[key]) {
                    //this.lights[i].setVisible(true);
                    this.lights[i].enable();
                }
                else {
                    //this.lights[i].setVisible(false);
                    this.lights[i].disable();
                }
                this.lights[i].update();
                i++;
            }
        }

        if (this.sceneInited) {
            // Draw axis
            this.setDefaultAppearance();

            // Displays the scene (MySceneGraph function).
            this.graph.displayScene();
        }

        this.popMatrix();
        // ---- END Background, camera and axis setup
    }

    update(time) {
        if (this.sceneInited) {
            if (this.startTime === null) this.startTime = time;
            this.graph.components_graph.computeAnimations(time - this.startTime)
            this.graph.boards[0].computeAnimations(time - this.startTime)
        }
    }

    logPicking()
	{
		if (this.pickMode == false) {
			// results can only be retrieved when picking mode is false
			if (this.pickResults != null && this.pickResults.length > 0) {
				for (var i=0; i< this.pickResults.length; i++) {
					var obj = this.pickResults[i][0];
					if (obj)
					{
						var customId = this.pickResults[i][1];

						console.log("Pick ID: " + customId);
                        var split_id = obj.parent.id.split(' ')
                        // If a piece is picked
                        if (split_id[0] === 'piece'){
                            console.log("picked piece " + split_id[1] + " at " + obj.parent.getBoardPosition())
                            // (mainboard is at boards[0])
                            this.graph.boards[0].pickPiece(obj.parent.id)  
                            this.pickedPiece = obj.parent
							this.game.pieceHasBeenPicked(this.pickedPiece);
                        }
                        // If a tile is picked, move the picked piece 
                        // and set this.pickedPiece.isPicked to false and this.pickedPiece to null
                        // movePiece calls this.game.pieceHasBeenMoved after the move and capture
                        // animations finish
                        else if (split_id[0] === 'mainboard'){
                            console.log("picked tile " + split_id[1] + ' ' + split_id[2])
                            if (this.pickedPiece !== null){
								var originalBoardPosition = this.pickedPiece.getBoardPosition();
                                obj.parent.board.movePiece(this.pickedPiece.id, obj.parent.board_x, obj.parent.board_y)
								var newBoardPosition = this.pickedPiece.getBoardPosition();
								//this.game.set_lastMovedPiece(this.pickedPiece);
                                //this.pickedPiece.setPicked(false);
                                this.pickedPiece = null;
								//this.game.pieceHasBeenMoved(originalBoardPosition, newBoardPosition);
                            }
                        }
					}
                    else
                    {
                        console.warn("Invalid Pick")
                    }
				}
				this.pickResults.splice(0,this.pickResults.length);
			}		
		}
	}
}