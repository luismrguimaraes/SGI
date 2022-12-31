import { CGFinterface, CGFapplication, dat } from '../lib/CGF.js';

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
            // TEST - pop from white auxiliar board and add to Tile (0,0)
            if (!this.scene.graph.boards[0].getPieceAt(0, 0)){
                var poppedPiece = this.scene.graph.boards[1].pop()
                if (poppedPiece) this.scene.graph.boards[0].addPiece(poppedPiece, 0, 0)
                console.log(poppedPiece)
            }else{
                console.log("mainboard 0 0 occupied")
            }
        }
        if(event.code == "Escape"){
			// Simulate end turn
			this.scene.game.endTurn();

            if (this.scene.pickedPiece !== null){
                // "Unpick"
                this.scene.pickedPiece.setPicked(false)
                this.scene.pickedPiece = null

                //this.game.setLockMoveToCaptureOnly(false);
                
                // update pickables
                for (let i = 0; i < 8; i++){
                    for (let j = 0; j < 8; j++){
                        this.scene.graph.boards[0].getTile(j, i).setPickable(false)
                    }
                }
            }
        }
        if (event.code == "KeyM"){
            console.log("M pressed")
            this.scene.graph.components_graph.increment_materialIndex()
        }
        if (event.code == "ArrowRight"){
            console.log("Right arrow pressed")
            this.camera_next()
        }         
        if (event.code == "ArrowLeft"){
            console.log("Left arrow pressed")
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
    
    camera_next(){
        if (this.camera_index +1 < this.scene.graph.cameras.length)
            this.camera_index++
        else return

        this.scene.camera = this.scene.graph.cameras[this.camera_index]
        if (!(this.scene.camera.id === "Game_camera_p0" || this.scene.camera.id === "Game_camera_p1"))
            this.setActiveCamera(this.scene.camera)
        this.activeCameraName = this.activeCamera.id

        this.scene.updateProjectionMatrix()
        this.scene.loadIdentity()

        this.scene.applyViewMatrix()
        

        console.log(this.activeCameraName)

    }
    camera_previous(){
        if (this.camera_index -1 >= 0)
            this.camera_index--
        else return

        this.scene.camera = this.scene.graph.cameras[this.camera_index]
        if (!(this.scene.camera.id === "Game_camera_p0" || this.scene.camera.id === "Game_camera_p1"))
            this.setActiveCamera(this.scene.camera)
        this.activeCameraName = this.activeCamera.id

        this.scene.updateProjectionMatrix()
        this.scene.loadIdentity()

        this.scene.applyViewMatrix()
    }
    
    camera_method(value){
        for (var i = 0; i < this.scene.graph.cameras.length; ++i)
            if (this.scene.graph.cameras[i].id == value){
                console.log(value)
                this.scene.camera = this.scene.graph.cameras[i]
                if (!(this.scene.camera.id === "Game_camera_p0" || this.scene.camera.id === "Game_camera_p1"))
                    this.setActiveCamera(this.scene.camera)
                this.activeCameraName = this.activeCamera.id

                this.scene.updateProjectionMatrix()
                this.scene.loadIdentity()

                this.scene.applyViewMatrix()
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
        this.scene.updateProjectionMatrix()
        this.scene.loadIdentity()

        this.scene.applyViewMatrix()
        if (!(this.scene.camera.id === "Game_camera_p0" || this.scene.camera.id === "Game_camera_p1"))
            this.setActiveCamera(this.scene.camera)
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