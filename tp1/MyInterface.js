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
        if (event.code == "KeyM"){
            this.scene.graph.components_graph.increment_materialIndex()
            console.log("M pressed")
        }
        if (event.code == "ArrowRight"){
            this.camera_next()
            console.log("Right arrow pressed")
        }         
        if (event.code == "ArrowLeft"){
            this.camera_previous()
            console.log("Left arrow pressed")
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
        else this.camera_index = 0

        this.scene.camera = this.scene.graph.cameras[this.camera_index]
        this.scene.updateProjectionMatrix()
        this.scene.loadIdentity()

        this.scene.applyViewMatrix()
        
        this.setActiveCamera(this.scene.camera)
    }
    camera_previous(){
        if (this.camera_index -1 >= 0)
            this.camera_index--
        else this.camera_index = this.scene.graph.cameras.length -1

        this.scene.camera = this.scene.graph.cameras[this.camera_index]
        this.scene.updateProjectionMatrix()
        this.scene.loadIdentity()

        this.scene.applyViewMatrix()
        this.setActiveCamera(this.scene.camera)
    }
    
    camera_method(){
        console.log("yolo")
    }
    create_views(){
        // Creates folder in Interface        
        console.log(this.scene.graph.cameras[0])
        var folder = this.scene.interface.gui.addFolder("Views");
        for(let i = 0; i < this.scene.graph.cameras.length; i++)
            folder.add(this.scene.graph.cameras[i], "near")
            .name(this.scene.graph.cameras[i].id)
            .onChange(this.camera_method.bind(this.scene))
        
        // Changes camera to the first one in the cameras array
        this.scene.camera = this.scene.graph.cameras[this.camera_index]
        this.scene.updateProjectionMatrix()
        this.scene.loadIdentity()

        this.scene.applyViewMatrix()
        this.setActiveCamera(this.scene.camera)
    }    
}