import { CGFinterface, CGFapplication, dat } from '../lib/CGF.js';
import { MyKeyframeAnimation } from './animations/MyKeyframeAnimation.js';

/**
* MyInterface class, creating a GUI interface.
*/

export class MyInterface extends CGFinterface {
    /**
     * @constructor
     */
    constructor() {
        super();
        this.camera_index = 0
    }

    /**
     * Initializes the interface.
     * @param {CGFapplication} application
     */
    init(application) {
        super.init(application);
        // init GUI. For more information on the methods, check:
        //  http://workshop.chromeexperiments.com/examples/gui

        this.gui = new dat.GUI();

        // add a group of controls (and open/expand by defult)

        this.activeCameraName = ""
        this.cameraAnimation = null
        this.initKeys();

        return true;
    }

    /**
     * initKeys
     */
    initKeys() {
        this.scene.gui=this;
        this.processKeyboard=function(){};
        this.activeKeys={};
    }

    
    processKeyDown(event) {
        if(event.code == "Digit1"){
            this.changeCameraToWhites()
        }
        if(event.code == "Digit2"){
            this.changeCameraToBlacks()
        }
        if(event.code == "Escape"){
            if (this.scene.pickedPiece !== null){
                // "Unpick"
                this.scene.pickedPiece.setPicked(false)
                this.scene.pickedPiece = null
                
                this.scene.game.setLockMoveToCaptureOnly(false);

                this.scene.game.makeAllTilesUnpickable()
            }else{
                // Run end turn
                this.scene.game.setLockMoveToCaptureOnly(false);
			    this.scene.game.endTurn();
            }
        }
        if (event.code == "KeyM"){
            this.scene.graph.components_graph.increment_materialIndex()
        }
        if (event.code == "ArrowRight"){
            this.camera_next()
        }         
        if (event.code == "ArrowLeft"){
            this.camera_previous()
        }  
        this.activeKeys[event.code]=true;
    };
    
    processKeyUp(event) {
        this.activeKeys[event.code]=false;
    };
    
    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
    }
    
    changeCameraToWhites(){
        // Change Camera to Player 1 (p0) (whites)
        this.setCamera(4)
        this.cameraFrom = 4
        this.triggerCameraChangeAnimation()
    }
    changeCameraToBlacks(){
        // Change Camera to Player 2 (p1) (blacks)
        this.setCamera(3)
        this.cameraFrom = 3
        this.triggerCameraChangeAnimation()
    }

    triggerCameraChangeAnimation(){
        var startTime = (Date.now() - this.scene.startTime)/1000
		if (this.scene.game.playerTurn){
            this.cameraAnimation = new MyKeyframeAnimation([ 
                [[0, 0, 0], 0, 0, 0, [1,1,1]],
                [[0, 0, 0], 0, Math.PI, 0, [1,1,1]],
                ], 
                [startTime, startTime + 0.7], this.scene)
        }else{
            this.cameraAnimation = new MyKeyframeAnimation([ 
                [[0, 0, 0], 0, 0, 0, [1,1,1]],
                [[0, 0, 0], 0, -Math.PI, 0, [1,1,1]],
                ], 
                [startTime, startTime + 0.7], this.scene)
        }
    }
    cameraAnimationOnEnd(){
        if (this.cameraFrom === 3) this.setCamera(4)
        else if (this.cameraFrom === 4) this.setCamera(3)
        this.cameraAnimation = null
    }

    computeAnimation(ellapsedTime){
        if (this.cameraAnimation !== null){
            var res = this.cameraAnimation.update(ellapsedTime)
            if (res === "animation over"){
                // Camera animation finished
                console.log("Camera animation over")
                this.cameraAnimationOnEnd()
            }
        }
    }

    setCamera(cameraIndex){
        this.camera_index = cameraIndex
        this.scene.camera = this.scene.graph.cameras[cameraIndex]
        if (!(this.scene.camera.id === "Game_camera_p0" || this.scene.camera.id === "Game_camera_p1"))
            this.setActiveCamera(this.scene.camera)
        this.activeCameraName = this.activeCamera.id
        
        this.scene.updateProjectionMatrix()
        this.scene.loadIdentity()
        
        this.scene.applyViewMatrix()
        
        console.log("New Camera: " + this.scene.camera.id)
    }
    
    camera_next(){
        if (this.camera_index +1 < this.scene.graph.cameras.length)
            this.camera_index++
        else return

        this.setCamera(this.camera_index)
    }
    camera_previous(){
        if (this.camera_index -1 >= 0)
            this.camera_index--
        else return

        this.setCamera(this.camera_index)
    }
    
    camera_method(value){
        for (var i = 0; i < this.scene.graph.cameras.length; ++i)
            if (this.scene.graph.cameras[i].id == value){
                this.setCamera(i)
            }
    }

    create_views(){
        //var folder = this.scene.interface.gui.addFolder("Views");
        if (this.scene.graph.defaultCameraId != null)
            this.activeCameraName = this.scene.graph.defaultCameraId
        else 
            this.activeCameraName = this.scene.graph.cameras[0].id

        var itemNames = []
        for (var i = 0; i < this.scene.graph.cameras.length; ++i)
            itemNames.push(this.scene.graph.cameras[i].id)
        this.gui.add(this, "activeCameraName", itemNames)
            .name("Views:")
            .onChange((value) => {
                this.camera_method(value)
            })

        // Changes camera to the default
        for (var i = 0; i < this.scene.graph.cameras.length; ++i){
            if (this.scene.graph.cameras[i].id == this.activeCameraName){
                this.scene.camera = this.scene.graph.cameras[i]
                this.camera_index = i
                break
            }
        }
        if (!(this.scene.camera.id === "Game_camera_p0" || this.scene.camera.id === "Game_camera_p1"))
            this.setActiveCamera(this.scene.camera)

        this.scene.updateProjectionMatrix()
        this.scene.loadIdentity()

        this.scene.applyViewMatrix()
    }    
	
	addLightsGroup(lights) {
        var group = this.gui.addFolder("Lights");
		group.open();

		// Add check boxes to the group 
		for (var key in lights) {
			if (lights.hasOwnProperty(key)) {
				this.scene.lightValues[key] = lights[key][0];
				group.add(this.scene.lightValues, key);
			}	
		}
    }
}