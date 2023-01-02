import { CGFappearance, CGFscene } from '../lib/CGF.js';
import { CGFaxis,CGFcamera } from '../lib/CGF.js';
import { MyKeyframeAnimation } from './animations/MyKeyframeAnimation.js';
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
		
        // Don't initialize Game yet
		this.game = null
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
        
        // Apply Camera animation
        if (this.interface.cameraAnimation !== null){
            this.interface.cameraAnimation.apply()
        }
        if (this.camera.id === "Game_camera_p0" || this.camera.id === "Game_camera_p1")
            this.translate(-70,0,-70)

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
            // components
            this.graph.components_graph.computeAnimations(time - this.startTime)

            // boards
            this.graph.boards[0].computeAnimations(time - this.startTime)
            this.graph.boards[1].computeAnimations(time - this.startTime)
            this.graph.boards[2].computeAnimations(time - this.startTime)

            // interface (for camera)
            this.interface.computeAnimation(time - this.startTime)
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

                        if (obj.id)
                            var split_id = obj.id.split(' ')
                        else{
                            // Not Piece or Tile
                            // If component is "checkers" (the board), Start the game.
                            if(obj["ID"] === "checkers"){
                                console.log("Starting Game")
                                // Add initialization of Game instance, players, and starts new game
                                this.game = new Game(this);
                                // Init MainBoard pieces
                                this.graph.boards[0].initPieces()
								// Init players
								this.player1 = new Player(this, 0);
								this.player2 = new Player(this, 1);
								// Start game
								this.game.startGame();
                            }
                            continue
                        }
                        // If a piece is picked
                        if (split_id[0] === 'piece'){
                            console.log("picked piece " + split_id[1] + " at " + obj.getBoardPosition())
                            // (mainboard is at boards[0])
                            this.graph.boards[0].pickPiece(obj.id)  
                            this.pickedPiece = obj
							this.game.pieceHasBeenPicked(this.pickedPiece);
                        }
                        /* 
                            If a tile is picked, call move on the picked piece 
                            and set this.pickedPiece to null
                            this.game.pieceHasBeenMoved is either called by movePiece, after the move animation 
                            or after the capture animation, whichever executes last
                        */
                        else if (split_id[0] === 'mainboard'){
                            console.log("picked tile " + split_id[1] + ' ' + split_id[2])
                            if (this.pickedPiece !== null){
                                obj.board.movePiece(this.pickedPiece.id, obj.board_x, obj.board_y)
                                this.pickedPiece = null;
                            }
                        }
					}
                    // If game has started, warn about invalid Pick
                    else if (this.game !== null)
                    {
                        console.warn("Invalid Pick")
                        // If InGame
                        // shake the whole board (mainboard, auxiliar 0 and 1) after an invalid pick
                        if (this.graph.boards[0].invalidPickAnimation === null){
                            if (this.graph.components["checkers"]){
                                var startTime = (Date.now() - this.startTime)/1000
                                var mainboard = this.graph.boards[0]
                                this.graph.components["checkers"]["Animation"][0] = new MyKeyframeAnimation([ 
                                    [[0,0,0], 0, 0, 0, [1,1,1]], 
                                    [[(Math.abs(mainboard.x1) + Math.abs(mainboard.x2))/50, 0, (Math.abs(mainboard.y1) + Math.abs(mainboard.y2))/50], 0, 0, 0, [1,1,1]],
                                    [[- (Math.abs(mainboard.x1) + Math.abs(mainboard.x2))/50, 0, - (Math.abs(mainboard.y1) + Math.abs(mainboard.y2))/50], 0, 0, 0, [1,1,1]],
                                    [[0,0,0], 0, 0, 0, [1,1,1]],
                                    ], 
                                    [startTime, startTime + 0.1, startTime + 0.2, startTime + 0.3], this)        
                                }
                        }
                    }
				}
				this.pickResults.splice(0,this.pickResults.length);
			}		
		}
	}
}