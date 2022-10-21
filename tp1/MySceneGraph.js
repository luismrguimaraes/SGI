import { CGFcamera, CGFcameraOrtho, CGFappearance, CGFtexture, CGFXMLreader } from '../lib/CGF.js';
import { MyRectangle } from './primitives/MyRectangle.js';
import { MyTriangle } from './primitives/MyTriangle.js';
import { MyCylinder } from './primitives/MyCylinder.js';
import { MyTorus } from './primitives/MyTorus.js';
import { MySphere } from './primitives/MySphere.js';

var DEGREE_TO_RAD = Math.PI / 180;

// Order of the groups in the XML document.
var SCENE_INDEX = 0;
var VIEWS_INDEX = 1;
var AMBIENT_INDEX = 2;
var LIGHTS_INDEX = 3;
var TEXTURES_INDEX = 4;
var MATERIALS_INDEX = 5;
var TRANSFORMATIONS_INDEX = 6;
var PRIMITIVES_INDEX = 7;
var COMPONENTS_INDEX = 8;

/* ToDo:
    Change logic of material and texture objects to ids, and get 
    a single this.appearance for the graph, that is constantly
    changing
*/

class ComponentsGraph {
    constructor(scene) {
        this.children = {}; // stores parent-child relationships via ID
        this.nodes = {}; // ID: object
        this.dependencies = [] //nodes that are expected to be added

        this.scene = scene
        this.material_ids_stack = []
        this.materialIDs = []
        for (let m in this.scene.graph.materials) {
            this.materialIDs.push(m)
        }
        this.m_presses_count = 0  // this is expected to only increase and eventually overflow

        this.texture_id_s_t_stack = []
        this.textureID_s_t = ["none", 1, 1]

        // set default material
        if (this.scene.graph.defaultCameraId == null)
            this.appearance = this.scene.graph.materials[this.materialIDs[0]]
        else this.appearance = this.scene.graph.materials[this.defaultCameraId]
    }
    addChild(parentID, childID) {
        if (
            this.children[childID] != null &&
            this.children[childID].includes(parentID)
        ) {
            return "Definition results in infinite loop";
        }
        if (!(parentID in this.nodes)) {
            return "Parent is not a Node";
        }
        if (this.children[parentID] == null) {
            this.children[parentID] = [];
        }
        this.children[parentID].push(childID);
    }
    addNode(nodeID, node) {
        if (!(nodeID in this.nodes)){
            this.nodes[nodeID] = node;
            //console.log("Node " + nodeID + " added.");
        } 
        //else console.log('node already exists');
        return nodeID;
    }

    addDependency(nodeID){
        this.dependencies.push(nodeID);
    }

    integrityCheck(idRoot, primitives){
        if (this.children[idRoot] == null && !(idRoot in primitives))
            return "Invalid root " + idRoot;
        
        // Check dependencies
        for (var nodeID of this.dependencies){
            if (!(nodeID in this.nodes)){
                return nodeID + " missing";
            }
        }
        // Check if all leaves are primitives
        for (var nodeID in this.nodes){
            if (this.children[nodeID] == null && !(nodeID in primitives))
                return nodeID + " is an invalid leaf";
        }
        return true;
    }

    increment_materialIndex(){
        if (this.m_presses_count == 2**52)
            this.m_presses_count = 0
        else
            this.m_presses_count++
        console.log("m_presses_count: " + this.m_presses_count)

    }

    print(startingNodeID) {
        this._printGraphAux(startingNodeID);
    }
    _printGraphAux(currentNode) {
        console.log(currentNode);
        if (this.children[currentNode] == null) return;
        for (var child of this.children[currentNode]) {
            console.log(currentNode + ' -> ' + child);
            this._printGraphAux(child);
        }
    }

    pushMaterial(){
        this.material_ids_stack.push(this.materialIDs)
    }
    popMaterial(){
        this.materialIDs = this.material_ids_stack.pop()
        var materialIndex = this.m_presses_count % this.materialIDs.length
        var materialID = this.materialIDs[materialIndex]
        this.appearance = this.scene.graph.materials[materialID]
    }

    pushTexture(){
        this.texture_id_s_t_stack.push(this.textureID_s_t)
    }
    popTexture(){
        this.textureID_s_t = this.texture_id_s_t_stack.pop()
        if (this.textureID_s_t[0] == "none")
            this.appearance.setTexture(null)
        else{
            this.textureID_s_t[1]
            this.textureID_s_t[2]
            var next_texture = this.scene.graph.textures[this.textureID_s_t[0]]
            this.appearance.setTexture(next_texture)
        }
    }
     

    display(currentNode){
        //console.log(currentNode);
        if (this.children[currentNode] == null){
            // Primitive
            this.nodes[currentNode].updateTexCoords(this.textureID_s_t[1], this.textureID_s_t[2])
            this.nodes[currentNode].display();
            return;
        }
        else{
            // Not Primitive
            this.pushMaterial();
            var materialIndex = this.m_presses_count % this.nodes[currentNode]["MaterialIDs"].length
            if (this.nodes[currentNode]["MaterialIDs"][materialIndex] != "inherit"){
                this.materialIDs = this.nodes[currentNode]["MaterialIDs"]
                var materialID = this.materialIDs[materialIndex]
                
                this.appearance = this.scene.graph.materials[materialID]

                if (this.appearance == null){
                    console.log(materialID)
                    console.log(material_index + " " + this.materialIDs.length)
                    console.log(this.appearance)
                }
            }


            this.pushTexture();
            if (this.nodes[currentNode]["TextureID_s_t"][0] != "inherit"){
                this.textureID_s_t = this.nodes[currentNode]["TextureID_s_t"]
                if (this.textureID_s_t[0] == "none"){
                    // clears texture
                    this.appearance.setTexture(null)
                }else
                    this.appearance.setTexture(this.scene.graph.textures[this.textureID_s_t[0]])
            }
            this.appearance.setTextureWrap("Repeat", "Repeat")
            this.appearance.apply()

            this.scene.pushMatrix();
            this.scene.multMatrix(this.nodes[currentNode]["Tm"]);

            for (var child of this.children[currentNode]) {
                this.display(child);
            }
            this.popMaterial();
            this.popTexture();
            this.appearance.apply();
            this.scene.popMatrix();
        } 
    }
}

/**
 * MySceneGraph class, representing the scene graph.
 */
export class MySceneGraph {
    /**
     * @constructor
     */
    constructor(filename, scene) {
        this.loadedOk = null;

        // Establish bidirectional references between scene and graph.
        this.scene = scene;
        scene.graph = this;

        this.nodes = [];

        this.idRoot = null;                    // The id of the root element.

        this.axisCoords = [];
        this.axisCoords['x'] = [1, 0, 0];
        this.axisCoords['y'] = [0, 1, 0];
        this.axisCoords['z'] = [0, 0, 1];

        this.cameras = []

        // File reading 
        this.reader = new CGFXMLreader();

        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */
        this.reader.open('scenes/' + filename, this);
    }

    /*
     * Callback to be executed after successful reading
     */
    onXMLReady() {
        this.log("XML Loading finished.");
        var rootElement = this.reader.xmlDoc.documentElement;

        // Here should go the calls for different functions to parse the various blocks
        var error = this.parseXMLFile(rootElement);

        if (error != null) {
            this.onXMLError(error);
            return;
        }

        this.loadedOk = true;

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        this.scene.onGraphLoaded();
    }

    /**
     * Parses the XML file, processing each block.
     * @param {XML root element} rootElement
     */
    parseXMLFile(rootElement) {
        if (rootElement.nodeName != "sxs")
            return "root tag <sxs> missing";

        var nodes = rootElement.children;

        // Reads the names of the nodes to an auxiliary buffer.
        var nodeNames = [];

        for (var i = 0; i < nodes.length; i++) {
            nodeNames.push(nodes[i].nodeName);
        }

        var error;

        // Processes each node, verifying errors.

        // <scene>
        var index;
        if ((index = nodeNames.indexOf("scene")) == -1)
            return "tag <scene> missing";
        else {
            if (index != SCENE_INDEX)
                this.onXMLMinorError("tag <scene> out of order " + index);

            //Parse scene block
            if ((error = this.parseScene(nodes[index])) != null)
                return error;
        }

        // <views>
        if ((index = nodeNames.indexOf("views")) == -1)
            return "tag <views> missing";
        else {
            if (index != VIEWS_INDEX)
                this.onXMLMinorError("tag <views> out of order");

            //Parse views block
            if ((error = this.parseView(nodes[index])) != null)
                return error;
        }

        // <ambient>
        if ((index = nodeNames.indexOf("ambient")) == -1)
            return "tag <ambient> missing";
        else {
            if (index != AMBIENT_INDEX)
                this.onXMLMinorError("tag <ambient> out of order");

            //Parse ambient block
            if ((error = this.parseAmbient(nodes[index])) != null)
                return error;
        }

        // <lights>
        if ((index = nodeNames.indexOf("lights")) == -1)
            return "tag <lights> missing";
        else {
            if (index != LIGHTS_INDEX)
                this.onXMLMinorError("tag <lights> out of order");

            //Parse lights block
            if ((error = this.parseLights(nodes[index])) != null)
                return error;
        }
        // <textures>
        if ((index = nodeNames.indexOf("textures")) == -1)
            return "tag <textures> missing";
        else {
            if (index != TEXTURES_INDEX)
                this.onXMLMinorError("tag <textures> out of order");

            //Parse textures block
            if ((error = this.parseTextures(nodes[index])) != null)
                return error;
        }

        // <materials>
        if ((index = nodeNames.indexOf("materials")) == -1)
            return "tag <materials> missing";
        else {
            if (index != MATERIALS_INDEX)
                this.onXMLMinorError("tag <materials> out of order");

            //Parse materials block
            if ((error = this.parseMaterials(nodes[index])) != null)
                return error;
        }

        // <transformations>
        if ((index = nodeNames.indexOf("transformations")) == -1)
            return "tag <transformations> missing";
        else {
            if (index != TRANSFORMATIONS_INDEX)
                this.onXMLMinorError("tag <transformations> out of order");

            //Parse transformations block
            if ((error = this.parseTransformations(nodes[index])) != null)
                return error;
        }

        // <primitives>
        if ((index = nodeNames.indexOf("primitives")) == -1)
            return "tag <primitives> missing";
        else {
            if (index != PRIMITIVES_INDEX)
                this.onXMLMinorError("tag <primitives> out of order");

            //Parse primitives block
            if ((error = this.parsePrimitives(nodes[index])) != null)
                return error;
        }

        // <components>
        if ((index = nodeNames.indexOf("components")) == -1)
            return "tag <components> missing";
        else {
            if (index != COMPONENTS_INDEX)
                this.onXMLMinorError("tag <components> out of order");

            //Parse components block
            if ((error = this.parseComponents(nodes[index])) != null)
                return error;
        }
        this.log("all parsed");
    }

    /**
     * Parses the <scene> block. 
     * @param {scene block element} sceneNode
     */
    parseScene(sceneNode) {

        // Get root of the scene.
        var root = this.reader.getString(sceneNode, 'root')
        if (root == null)
            return "no root defined for scene";

        this.idRoot = root;

        // Get axis length        
        var axis_length = this.reader.getFloat(sceneNode, 'axis_length');
        if (axis_length == null)
            this.onXMLMinorError("no axis_length defined for scene; assuming 'length = 1'");

        this.referenceLength = axis_length || 1;

        this.log("Parsed scene");

        return null;
    }

    /**
     * Parses the <views> block.
     * @param {view block element} viewsNode
     */
    parseView(viewsNode) {
        var children = viewsNode.children;
    
        if (children.length < 1)
            return "At least one view is required"

        this.defaultCameraId = this.reader.getString(viewsNode, 'default');    

        var views_ids = []

        // for every view
        for (let i = 0; i<children.length; ++i){
            var nodeName = children[i].nodeName
            if (nodeName == "perspective")
            {
                var id = this.reader.getString(children[i], 'id');
                var near = this.reader.getFloat(children[i], 'near');
                var far = this.reader.getFloat(children[i], 'far');
                var angle = this.reader.getFloat(children[i], 'angle');

                if (!(id != null && near != null && !isNaN(near) && far != null && !isNaN(far) && angle != null && !isNaN(angle)))
                    return "Invalid parameters in views"

                if (views_ids.includes(id))
                    return "id " + id + " has conflics in Views"
                views_ids.push(id)
                var grandChildren = children[i].children
                var from = -1
                var to = -1

                for (let j = 0; j<grandChildren.length; ++j){
                    if (grandChildren[j].nodeName != "from" && grandChildren[j].nodeName != "to")
                        return "Invalid child in perspective " + id

                    var x = this.reader.getFloat(grandChildren[j], 'x');
                    var y = this.reader.getFloat(grandChildren[j], 'y');
                    var z = this.reader.getFloat(grandChildren[j], 'z');
                    if (!(x != null && !isNaN(x) && y != null && !isNaN(y) && z != null && !isNaN(z)))
                        return "Invalid parameters in children of perspective " + id

                    if (grandChildren[j].nodeName == "from"){
                        from = vec3.fromValues(x,y,z)

                    }else if (grandChildren[j].nodeName == "to"){                        
                        to = vec3.fromValues(x,y,z)
                    }
                }

                if (from == -1 || to == -1)
                    return "Invalid children in perspective " + id;

                var new_camera = new CGFcamera(angle, near, far, from, to)
                new_camera.id = id
                this.cameras.push(new_camera)
            }
            else if (nodeName == "ortho")
            {
                var id = this.reader.getString(children[i], 'id');
                var near = this.reader.getFloat(children[i], 'near');
                var far = this.reader.getFloat(children[i], 'far');
                var left = this.reader.getFloat(children[i], 'left');
                var right = this.reader.getFloat(children[i], 'right');
                var top = this.reader.getFloat(children[i], 'top');
                var bottom = this.reader.getFloat(children[i], 'bottom');

                if (!(id != null && near != null && !isNaN(near) && far != null && !isNaN(far) && angle != null && !isNaN(angle)
                      && left != null && !isNaN(left) && right != null && !isNaN(right) && top != null && !isNaN(top) && bottom != null && !isNaN(bottom)))
                    return "Invalid parameters in views"

                if (views_ids.includes(id))
                    return "id " + id + " has conflics in Views"
                views_ids.push(id)
                var grandChildren = children[i].children
                var from = -1
                var to = -1
                var up = vec3.fromValues(0,1,0)

                for (let j = 0; j<grandChildren.length; ++j){
                    if (grandChildren[j].nodeName != "from" && grandChildren[j].nodeName != "to" && grandChildren[j].nodeName != "up")
                        return "Invalid child in view" + id

                    var x = this.reader.getFloat(grandChildren[j], 'x');
                    var y = this.reader.getFloat(grandChildren[j], 'y');
                    var z = this.reader.getFloat(grandChildren[j], 'z');
                    if (!(x != null && !isNaN(x) && y != null && !isNaN(y) && z != null && !isNaN(z)))
                        return "Invalid parameters in children of perspective " + id

                    if (grandChildren[j].nodeName == "from"){
                        from = vec3.fromValues(x,y,z)
                    }else if (grandChildren[j].nodeName == "to"){
                        to = vec3.fromValues(x,y,z)
                    }else if (grandChildren[j].nodeName == "up"){
                        up = vec3.fromValues(x,y,z)
                    }
                }

                if (from == -1 || to == -1)
                    return "Invalid children in orthogonal " + id;

                var new_camera = new CGFcameraOrtho(left, right, bottom, top, near, far, from, to, up)
                new_camera.id = id
                this.cameras.push(new_camera)
                
            }
        }

        this.scene.interface.create_views()
        

        return null;
    }

    /**
     * Parses the <ambient> node.
     * @param {ambient block element} ambientsNode
     */
    parseAmbient(ambientsNode) {

        var children = ambientsNode.children;

        this.ambient = [];
        this.background = [];

        var nodeNames = [];

        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        var ambientIndex = nodeNames.indexOf("ambient");
        var backgroundIndex = nodeNames.indexOf("background");

        var color = this.parseColor(children[ambientIndex], "ambient");
        if (!Array.isArray(color))
            return color;
        else
            this.ambient = color;

        color = this.parseColor(children[backgroundIndex], "background");
        if (!Array.isArray(color))
            return color;
        else
            this.background = color;

        this.log("Parsed ambient");

        return null;
    }

    /**
     * Parses the <light> node.
     * @param {lights block element} lightsNode
     */
    parseLights(lightsNode) {
        var children = lightsNode.children;

        this.lights = [];
        var numLights = 0;

        var grandChildren = [];
        var nodeNames = [];

        // Any number of lights.
        for (var i = 0; i < children.length; i++) {

            // Storing light information
            var global = [];
            var attributeNames = [];
            var attributeTypes = [];

            //Check type of light
            if (children[i].nodeName != "omni" && children[i].nodeName != "spot") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }
            else {
                attributeNames.push(...["location", "ambient", "diffuse", "specular"]);
                attributeTypes.push(...["position", "color", "color", "color"]);
            }

            // Get id of the current light.
            var lightId = this.reader.getString(children[i], 'id');
            if (lightId == null)
                return "no ID defined for light";

            // Checks for repeated IDs.
            if (this.lights[lightId] != null)
                return "ID must be unique for each light (conflict: ID = " + lightId + ")";

            // Light enable/disable
            var enableLight = true;
            var aux = this.reader.getBoolean(children[i], 'enabled');
            if (!(aux != null && !isNaN(aux) && (aux == true || aux == false))) {
                this.onXMLMinorError("unable to parse value component of the 'enable light' field for ID = " + lightId + "; assuming 'value = true'");
				aux = true;
			}

            enableLight = aux;

            //Add enabled boolean and type name to light info
            global.push(enableLight);
            global.push(children[i].nodeName);

            grandChildren = children[i].children;
            // Specifications for the current light.

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            for (var j = 0; j < attributeNames.length; j++) {
                var attributeIndex = nodeNames.indexOf(attributeNames[j]);

                if (attributeIndex != -1) {
                    if (attributeTypes[j] == "position") {
                        var aux = this.parseCoordinates4D(grandChildren[attributeIndex], "light position for ID" + lightId);
                    }
					else {
                        var aux = this.parseColor(grandChildren[attributeIndex], attributeNames[j] + " illumination for ID" + lightId);

					}
                    if (!Array.isArray(aux)) {
                        return aux;
					}

                    global.push(aux);
                }
                else
                    return "light " + attributeNames[i] + " undefined for ID = " + lightId;
            }

            // Gets the additional attributes of the spot light
            if (children[i].nodeName == "spot") {
                var angle = this.reader.getFloat(children[i], 'angle');
                if (!(angle != null && !isNaN(angle)))
                    return "unable to parse angle of the light for ID = " + lightId;

                var exponent = this.reader.getFloat(children[i], 'exponent');
                if (!(exponent != null && !isNaN(exponent)))
                    return "unable to parse exponent of the light for ID = " + lightId;

                // Retrieves the light target.
                var targetIndex = nodeNames.indexOf("target");
                var targetLight = [];
                if (targetIndex != -1) {
                    var aux = this.parseCoordinates3D(grandChildren[targetIndex], "target light for ID " + lightId);
                    if (!Array.isArray(aux))
                        return aux;

                    targetLight = aux;
                }
                else
                    return "light target undefined for ID = " + lightId;

				// Retrieves the light attenuation.
				var attenuationIndex = nodeNames.indexOf("attenuation");
                var attenuationLight = [];
                if (attenuationIndex != -1) {
                    var aux = this.parseAttenuation(grandChildren[attenuationIndex], "attenuation light for ID " + lightId);
                    if (!Array.isArray(aux))
                        return aux;

                    attenuationLight = aux;
                }
                else
                    return "light attenuation undefined for ID = " + lightId;

				global.push(...[angle, exponent, targetLight, attenuationLight])

            }

			// Gets the additional attributes of the omni light
            if (children[i].nodeName == "omni") {
                // Retrieves the light attenuation.
				var attenuationIndex = nodeNames.indexOf("attenuation");
                var attenuationLight = [];
                if (attenuationIndex != -1) {
                    var aux = this.parseAttenuation(grandChildren[attenuationIndex], "attenuation light for ID " + lightId);
                    if (!Array.isArray(aux))
                        return aux;

                    attenuationLight = aux;
                }
                else
                    return "light attenuation undefined for ID = " + lightId;

				global.push(...[attenuationLight])

            }

            this.lights[lightId] = global;
            numLights++;
        }

        if (numLights == 0)
            return "at least one light must be defined";
        else if (numLights > 8)
            this.onXMLMinorError("too many lights defined; WebGL imposes a limit of 8 lights");

        this.log("Parsed lights");
        return null;
    }

    /**
     * Parses the <textures> block. 
     * @param {textures block element} texturesNode
     */
    parseTextures(texturesNode) {

        //For each texture in textures block, check ID and file URL
        var children = texturesNode.children;

        this.textures = [];

        // Any number of materials.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "texture") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current texture.
            var textureID = this.reader.getString(children[i], 'id');
            if (textureID == null)
                return "no ID defined for material";

            // Checks for repeated IDs.
            if (this.textures[textureID] != null)
                return "ID must be unique for each material (conflict: ID = " + textureID + ")";
            
            // Get url of the current texture
            var textureUrl = this.reader.getString(children[i], 'file');
            if (textureUrl == null)
                return "no file defined for texture";
            
            var texture = new CGFtexture(this.scene, textureUrl)

            this.textures[textureID] = texture
        }
        
        this.log("Parsed textures");
        
        return null;
    }

    /**
     * Parses the <materials> node.
     * @param {materials block element} materialsNode
     */
    parseMaterials(materialsNode) {
        var children = materialsNode.children;

        this.materials = [];

        var grandChildren = [];
        var nodeNames = [];

        // Any number of materials.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "material") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current material.
            var materialID = this.reader.getString(children[i], 'id');
            if (materialID == null)
                return "no ID defined for material";

            // Checks for repeated IDs.
            if (this.materials[materialID] != null)
                return "ID must be unique for each material (conflict: ID = " + materialID + ")";

            //Continue here
            var s = this.reader.getFloat(children[i], 'shininess');
            if (!(s != null && !isNaN(s)))
                return "unable to parse shininess of the material for ID = " + materialID;
            
            grandChildren = children[i].children
            var appearance = new CGFappearance(this.scene)

            for (var j = 0; j < grandChildren.length; j++){
                switch (grandChildren[j].nodeName) {
                    case 'emission':
                        var r = this.reader.getFloat(grandChildren[j], 'r');
                        if (!(r != null && !isNaN(r)))
                            return "unable to parse red of the material for ID = " + materialID;

                        var g = this.reader.getFloat(grandChildren[j], 'g');
                        if (!(g != null && !isNaN(g)))
                            return "unable to parse green of the material for ID = " + materialID;

                        var b = this.reader.getFloat(grandChildren[j], 'b');
                        if (!(b != null && !isNaN(b)))
                            return "unable to parse blue of the material for ID = " + materialID;

                        var a = this.reader.getFloat(grandChildren[j], 'a');
                        if (!(a != null && !isNaN(a)))
                            return "unable to parse alpha of the material for ID = " + materialID;
                        
                        appearance.setEmission(r,g,b,a)
                        break;

                    case 'ambient':
                        var r = this.reader.getFloat(grandChildren[j], 'r');
                        if (!(r != null && !isNaN(r)))
                            return "unable to parse red of the material for ID = " + materialID;

                        var g = this.reader.getFloat(grandChildren[j], 'g');
                        if (!(g != null && !isNaN(g)))
                            return "unable to parse green of the material for ID = " + materialID;

                        var b = this.reader.getFloat(grandChildren[j], 'b');
                        if (!(b != null && !isNaN(b)))
                            return "unable to parse blue of the material for ID = " + materialID;
                            
                        var a = this.reader.getFloat(grandChildren[j], 'a');
                        if (!(a != null && !isNaN(a)))
                            return "unable to parse alpha of the material for ID = " + materialID;
                        appearance.setAmbient(r,g,b,a)
                        break;

                    case 'diffuse':
                        var r = this.reader.getFloat(grandChildren[j], 'r');
                        if (!(r != null && !isNaN(r)))
                            return "unable to parse red of the material for ID = " + materialID;

                        var g = this.reader.getFloat(grandChildren[j], 'g');
                        if (!(g != null && !isNaN(g)))
                            return "unable to parse green of the material for ID = " + materialID;

                        var b = this.reader.getFloat(grandChildren[j], 'b');
                        if (!(b != null && !isNaN(b)))
                            return "unable to parse blue of the material for ID = " + materialID;
                            
                        var a = this.reader.getFloat(grandChildren[j], 'a');
                        if (!(a != null && !isNaN(a)))
                            return "unable to parse alpha of the material for ID = " + materialID;
                        appearance.setDiffuse(r,g,b,a)                        
                        break;

                    case 'specular':
                        var r = this.reader.getFloat(grandChildren[j], 'r');
                        if (!(r != null && !isNaN(r)))
                            return "unable to parse red of the material for ID = " + materialID;

                        var g = this.reader.getFloat(grandChildren[j], 'g');
                        if (!(g != null && !isNaN(g)))
                            return "unable to parse green of the material for ID = " + materialID;

                        var b = this.reader.getFloat(grandChildren[j], 'b');
                        if (!(b != null && !isNaN(b)))
                            return "unable to parse blue of the material for ID = " + materialID;
                            
                        var a = this.reader.getFloat(grandChildren[j], 'a');
                        if (!(a != null && !isNaN(a)))
                            return "unable to parse alpha of the material for ID = " + materialID;
                        appearance.setSpecular(r,g,b,a)
                        break;
                    
                    default:
                        return "unable to parse material component of the material for ID = " + materialID;
                }
            }
            this.materials[materialID] = appearance
        }

        this.log("Parsed materials");
        return null;
    }

    /**
     * Parses the <transformations> block.
     * @param {transformations block element} transformationsNode
     */
    parseTransformations(transformationsNode) {
        var children = transformationsNode.children;

        this.transformations = [];

        var grandChildren = [];

        // Any number of transformations.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "transformation") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current transformation.
            var transformationID = this.reader.getString(children[i], 'id');
            if (transformationID == null)
                return "no ID defined for transformation";

            // Checks for repeated IDs.
            if (this.transformations[transformationID] != null)
                return "ID must be unique for each transformation (conflict: ID = " + transformationID + ")";

            grandChildren = children[i].children;
            // Specifications for the current transformation.

            var transfMatrix = mat4.create();

            for (var j = 0; j < grandChildren.length; j++) {
                switch (grandChildren[j].nodeName) {
                    case 'translate':
                        var coordinates = this.parseCoordinates3D(grandChildren[j], "translate transformation for ID " + transformationID);
                        if (!Array.isArray(coordinates))
                            return coordinates;

                        mat4.translate(transfMatrix, transfMatrix, coordinates);
                        break;
                    case 'scale':
                        var coordinates = this.parseCoordinates3D(grandChildren[j], "scale transformation for ID " + transformationID);
                        if (!Array.isArray(coordinates))
                            return coordinates;

                        mat4.scale(transfMatrix, transfMatrix, coordinates);
                        break;
                    case 'rotate':
                        // axis
                        var axisString = this.reader.getString(grandChildren[j], 'axis');
                        if (!(axisString != null))
                            return "unable to parse axis of the rotation for ID " + transformationID;
                        var axis = [0,0,0];
                        switch(axisString){
                            case 'x':
                                axis = [1,0,0];
                                break;
                            case 'y':
                                axis = [0,1,0];
                                break;
                            case 'z':
                                axis = [0,0,1];
                                break;
                        }
                        // angle
                        var angle = this.reader.getFloat(grandChildren[j], "angle") * Math.PI/180.0;
                        if (!(angle != null && !isNaN(angle)))
                            return "unable to parse angle of the rotation for ID " + transformationID;
                            
                        mat4.rotate(transfMatrix, transfMatrix, angle, axis);
                        //this.onXMLMinorError("To do: Parse rotate transformations.");
                        break;
                }
            }
            this.transformations[transformationID] = transfMatrix;
        }

        this.log("Parsed transformations");
        return null;
    }

    /**
     * Parses the <primitives> block.
     * @param {primitives block element} primitivesNode
     */
    parsePrimitives(primitivesNode) {
        var children = primitivesNode.children;

        this.primitives = [];

        var grandChildren = [];

        // Any number of primitives.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "primitive") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current primitive.
            var primitiveId = this.reader.getString(children[i], 'id');
            if (primitiveId == null)
                return "no ID defined for texture";

            // Checks for repeated IDs.
            if (this.primitives[primitiveId] != null)
                return "ID must be unique for each primitive (conflict: ID = " + primitiveId + ")";

            grandChildren = children[i].children;

            // Validate the primitive type
            if (grandChildren.length != 1 ||
                (grandChildren[0].nodeName != 'rectangle' && grandChildren[0].nodeName != 'triangle' &&
                    grandChildren[0].nodeName != 'cylinder' && grandChildren[0].nodeName != 'sphere' &&
                    grandChildren[0].nodeName != 'torus')) {
                return "There must be exactly 1 primitive type (rectangle, triangle, cylinder, sphere or torus)"
            }

            // Specifications for the current primitive.
            var primitiveType = grandChildren[0].nodeName;

            // Retrieves the primitive coordinates.
            if (primitiveType == 'rectangle') {
                // x1
                var x1 = this.reader.getFloat(grandChildren[0], 'x1');
                if (!(x1 != null && !isNaN(x1)))
                    return "unable to parse x1 of the primitive coordinates for ID = " + primitiveId;

                // y1
                var y1 = this.reader.getFloat(grandChildren[0], 'y1');
                if (!(y1 != null && !isNaN(y1)))
                    return "unable to parse y1 of the primitive coordinates for ID = " + primitiveId;

                // x2
                var x2 = this.reader.getFloat(grandChildren[0], 'x2');
                if (!(x2 != null && !isNaN(x2) && x2 > x1))
                    return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;

                // y2
                var y2 = this.reader.getFloat(grandChildren[0], 'y2');
                if (!(y2 != null && !isNaN(y2) && y2 > y1))
                    return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;

                var rect = new MyRectangle(this.scene, primitiveId, x1, x2, y1, y2);

                this.primitives[primitiveId] = rect;
            }
            else if(primitiveType == 'triangle'){
                // x1
                var x1 = this.reader.getFloat(grandChildren[0], 'x1');
                if (!(x1 != null && !isNaN(x1)))
                    return "unable to parse x1 of the primitive coordinates for ID = " + primitiveId;

                // y1
                var y1 = this.reader.getFloat(grandChildren[0], 'y1');
                if (!(y1 != null && !isNaN(y1)))
                    return "unable to parse y1 of the primitive coordinates for ID = " + primitiveId;

                // z1
                var z1 = this.reader.getFloat(grandChildren[0], 'z1');
                if (!(z1 != null && !isNaN(z1)))
                    return "unable to parse z1 of the primitive coordinates for ID = " + primitiveId;

                // x2
                var x2 = this.reader.getFloat(grandChildren[0], 'x2');
                if (!(x2 != null && !isNaN(x2)))
                    return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;

                // y2
                var y2 = this.reader.getFloat(grandChildren[0], 'y2');
                if (!(y2 != null && !isNaN(y2)))
                    return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;

                // z2
                var z2 = this.reader.getFloat(grandChildren[0], 'z2');
                if (!(z2 != null && !isNaN(z2)))
                    return "unable to parse z2 of the primitive coordinates for ID = " + primitiveId;
                
                // x3
                var x3 = this.reader.getFloat(grandChildren[0], 'x3');
                if (!(x3 != null && !isNaN(x3)))
                    return "unable to parse x3 of the primitive coordinates for ID = " + primitiveId;

                // y3
                var y3 = this.reader.getFloat(grandChildren[0], 'y3');
                if (!(y3 != null && !isNaN(y3)))
                    return "unable to parse y3 of the primitive coordinates for ID = " + primitiveId;

                // z3
                var z3 = this.reader.getFloat(grandChildren[0], 'z3');
                if (!(z3 != null && !isNaN(z3)))
                    return "unable to parse z3 of the primitive coordinates for ID = " + primitiveId;

                var triangle = new MyTriangle(this.scene, primitiveId, x1, y1, z1, x2, y2, z2, x3, y3, z3);

                this.primitives[primitiveId] = triangle;
			}
            else if(primitiveType == 'cylinder'){
                // base
                var base = this.reader.getFloat(grandChildren[0], 'base');
                if (!(base != null && !isNaN(base)))
                    return "unable to parse base of the primitive coordinates for ID = " + primitiveId;

                // top
                var top = this.reader.getFloat(grandChildren[0], 'top');
                if (!(top != null && !isNaN(top)))
                    return "unable to parse top of the primitive coordinates for ID = " + primitiveId;
				
				// height
                var height = this.reader.getFloat(grandChildren[0], 'height');
                if (!(height != null && !isNaN(height)))
                    return "unable to parse height of the primitive coordinates for ID = " + primitiveId;

                // slices
                var slices = this.reader.getFloat(grandChildren[0], 'slices');
                if (!(slices != null && !isNaN(slices)))
                    return "unable to parse slices of the primitive coordinates for ID = " + primitiveId;

                // stacks
                var stacks = this.reader.getFloat(grandChildren[0], 'stacks');
                if (!(stacks != null && !isNaN(stacks)))
                    return "unable to parse stacks of the primitive coordinates for ID = " + primitiveId;

                var cylinder = new MyCylinder(this.scene, primitiveId, base, top, height, slices, stacks);

                this.primitives[primitiveId] = cylinder;
            }
			else if(primitiveType == 'torus'){
                // inner
                var inner = this.reader.getFloat(grandChildren[0], 'inner');
                if (!(inner != null && !isNaN(inner)))
                    return "unable to parse inner of the primitive coordinates for ID = " + primitiveId;

                // outer
                var outer = this.reader.getFloat(grandChildren[0], 'outer');
                if (!(outer != null && !isNaN(outer)))
                    return "unable to parse outer of the primitive coordinates for ID = " + primitiveId;

                // slices
                var slices = this.reader.getFloat(grandChildren[0], 'slices');
                if (!(slices != null && !isNaN(slices)))
                    return "unable to parse slices of the primitive coordinates for ID = " + primitiveId;

                // loops
                var loops = this.reader.getFloat(grandChildren[0], 'loops');
                if (!(loops != null && !isNaN(loops)))
                    return "unable to parse loops of the primitive coordinates for ID = " + primitiveId;

                var torus = new MyTorus(this.scene, primitiveId, inner, outer, slices, loops);

                this.primitives[primitiveId] = torus;
            }
            else if(primitiveType == "sphere"){
                // radius
                var radius = this.reader.getFloat(grandChildren[0], 'radius');
                if (!(radius != null && !isNaN(radius)))
                    return "unable to parse radius of the primitive coordinates for ID = " + primitiveId;
                // slices
                var slices = this.reader.getFloat(grandChildren[0], 'slices');
                if (!(slices != null && !isNaN(slices)))
                    return "unable to parse slices of the primitive coordinates for ID = " + primitiveId;
                // stacks
                var stacks = this.reader.getFloat(grandChildren[0], 'stacks');
                if (!(stacks != null && !isNaN(stacks)))
                    return "unable to parse stacks of the primitive coordinates for ID = " + primitiveId;

                var sphere = new MySphere(this.scene, radius, stacks, slices)

                this.primitives[primitiveId] = sphere;
            }
            else {
                console.warn("To do: Parse other primitives.");
            }
        }

        this.log("Parsed primitives");
        return null;
    }

    /**
   * Parses the <components> block.
   * @param {components block element} componentsNode
   */
    parseComponents(componentsNode) {
        var children = componentsNode.children;

        this.components = [];

        var grandChildren = [];
        var grandgrandChildren = [];
        var nodeNames = [];

        this.components_graph = new ComponentsGraph(this.scene);

        // Any number of components.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "component") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current component.
            var componentID = this.reader.getString(children[i], 'id');
            if (componentID == null)
                return "no ID defined for componentID";

            // Checks for repeated IDs.
            if (this.components[componentID] != null)
                return "ID must be unique for each component (conflict: ID = " + componentID + ")";

            grandChildren = children[i].children;
            var componentObject = {}

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            var transformationIndex = nodeNames.indexOf("transformation");
            var materialsIndex = nodeNames.indexOf("materials");
            var textureIndex = nodeNames.indexOf("texture");
            var childrenIndex = nodeNames.indexOf("children");

            // Transformations
            var transfMatrix = mat4.create();
            if(transformationIndex >= 0 && grandChildren[transformationIndex] != null){
                grandgrandChildren[transformationIndex] = grandChildren[transformationIndex].children;
                for (var child of grandgrandChildren[transformationIndex]){
                    switch (child.nodeName) {
                        case 'transformationref':
                            var ID = this.reader.getString(child, 'id');
                            if (this.transformations[ID] == null) 
                                return "Invalid transformationref with ID " + ID;
                            mat4.multiply(transfMatrix, transfMatrix, this.transformations[ID]);
                            break;
                        case 'translate':
                            var coordinates = this.parseCoordinates3D(child, "translate transformation for component " + componentID);
                            if (!Array.isArray(coordinates))
                                return coordinates;
    
                            mat4.translate(transfMatrix, transfMatrix, coordinates);
                            break;
                        case 'scale':
                            var coordinates = this.parseCoordinates3D(child, "scale transformation for component " + componentID);
                            if (!Array.isArray(coordinates))
                                return coordinates;
    
                            mat4.scale(transfMatrix, transfMatrix, coordinates);
                            
                            break;
                        case 'rotate':
                            // axis
                            var axisString = this.reader.getString(child, 'axis');
                            if (!(axisString != null))
                                return "unable to parse axis of the rotation for component " + componentID;
                            var axis = [0,0,0];
                            switch(axisString){
                                case 'x':
                                    axis = [1,0,0];
                                    break;      
                                case 'y':
                                    axis = [0,1,0];
                                    break;
                                case 'z':
                                    axis = [0,0,1];
                                    break;
                            }
                            // angle
                            var angle = this.reader.getFloat(child, "angle") * Math.PI/180.0;
                            if (!(angle != null && !isNaN(angle)))
                                return "unable to parse angle of the rotation for component " + componentID;

                            mat4.rotate(transfMatrix, transfMatrix, angle, axis);
                        
                            break;
                    }
                }
            }
            componentObject["Tm"] = transfMatrix;

            // Materials
            if(materialsIndex >= 0 && grandChildren[materialsIndex] != null){
                componentObject["MaterialIDs"] = []
                grandgrandChildren[materialsIndex] = grandChildren[materialsIndex].children;
                for (var child of grandgrandChildren[materialsIndex]){
                    if (child.nodeName != "material")
                        return "Invalid node name"
                    
                    var ID = this.reader.getString(child, 'id');
                    
                    if (ID == "inherit")
                        componentObject["MaterialIDs"].push("inherit")
                    else if (this.materials[ID] == null)
                        return "Invalid material with ID " + ID;
                    else componentObject["MaterialIDs"].push(ID);
                    
                }
            }
            // Texture            
            if(textureIndex >= 0 && grandChildren[textureIndex] != null){
                var child = grandChildren[textureIndex]
                // I don't think this conditional actually makes sense/is relevant
                if (child.nodeName != "texture")
                    return "Invalid node name"
                
                var ID = this.reader.getString(child, 'id');
                
                if (ID == "inherit")
                    componentObject["TextureID_s_t"] = ["inherit", 1, 1]
                else if (ID == "none")
                    componentObject["TextureID_s_t"] = ["none", 1, 1]
                else if (this.textures[ID] == null)
                    return "Invalid texture with ID " + ID;
                else{
                    var s, t = 1
                    s = this.reader.getFloat(child, 'length_s')
                    if (!(s != null && !isNaN(s))){
                        console.log("length_s is null in texture " + ID + " of component " + componentID)
                        s = 1
                    }
                    t = this.reader.getFloat(child, 'length_t')
                    if (!(t != null && !isNaN(t))){                    
                        console.log("length_t is null in texture " + ID + " of component " + componentID)
                        t = 1
                    }
                    componentObject["TextureID_s_t"] = [ID, s, t]
                }

                                
            }
            
            // Add to ComponentsGraph
            this.components_graph.addNode(componentID, componentObject);

            // Children            
            if(childrenIndex >= 0 && grandChildren[childrenIndex] != null){
                grandgrandChildren[childrenIndex] = grandChildren[childrenIndex].children;
                for (var child of grandgrandChildren[childrenIndex]){
                    switch (child.nodeName) {
                        case 'componentref':
                            var childID = this.reader.getString(child, 'id');
                            if (childID in this.primitives)
                                return "componentref " + childID + " in component " + componentID + " refers to a primitive";
                            if (!(childID in this.components))
                                this.components_graph.addDependency(childID);
                            this.components_graph.addChild(componentID, childID);
                            break;
                        case 'primitiveref':
                            var primitiveID = this.reader.getString(child, 'id');
                            if (!(primitiveID in this.primitives))
                                return "unable to parse primitiveref " + primitiveID + " of " + componentID;
                            this.components_graph.addNode(primitiveID, this.primitives[primitiveID]);
                            this.components_graph.addChild(componentID, primitiveID);
                            break;
                    }
                }
            }

            // Add to this.components
            this.components[componentID] = componentObject;
        }

        var integrityCheck_result = this.components_graph.integrityCheck(this.idRoot, this.primitives);
        if (integrityCheck_result != true) //check if dependencies have been satisfied
            return integrityCheck_result;
    }


    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates3D(node, messageError) {
        var position = [];

        // x
        var x = this.reader.getFloat(node, 'x');
        if (!(x != null && !isNaN(x)))
            return "unable to parse x-coordinate of the " + messageError;

        // y
        var y = this.reader.getFloat(node, 'y');
        if (!(y != null && !isNaN(y)))
            return "unable to parse y-coordinate of the " + messageError;

        // z
        var z = this.reader.getFloat(node, 'z');
        if (!(z != null && !isNaN(z)))
            return "unable to parse z-coordinate of the " + messageError;

        position.push(...[x, y, z]);

        return position;
    }

	/**
     * Parse the attenuation from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseAttenuation(node, messageError) {
        var attenuation = [];

        // constant
        var constant = this.reader.getFloat(node, 'constant');
        if (!(constant != null && !isNaN(constant)))
            return "unable to parse constant of the " + messageError;

        // linear
        var linear = this.reader.getFloat(node, 'linear');
        if (!(linear != null && !isNaN(linear)))
            return "unable to parse linear of the " + messageError;

        // quadratic
        var quadratic = this.reader.getFloat(node, 'quadratic');
        if (!(quadratic != null && !isNaN(quadratic)))
            return "unable to parse quadratic-coordinate of the " + messageError;

        attenuation.push(...[constant, linear, quadratic]);

        return attenuation;
    }

    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates4D(node, messageError) {
        var position = [];

        //Get x, y, z
        position = this.parseCoordinates3D(node, messageError);

        if (!Array.isArray(position))
            return position;


        // w
        var w = this.reader.getFloat(node, 'w');
        if (!(w != null && !isNaN(w)))
            return "unable to parse w-coordinate of the " + messageError;

        position.push(w);

        return position;
    }

    /**
     * Parse the color components from a node
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseColor(node, messageError) {
        var color = [];

        // R
        var r = this.reader.getFloat(node, 'r');
        if (!(r != null && !isNaN(r) && r >= 0 && r <= 1))
            return "unable to parse R component of the " + messageError;

        // G
        var g = this.reader.getFloat(node, 'g');
        if (!(g != null && !isNaN(g) && g >= 0 && g <= 1))
            return "unable to parse G component of the " + messageError;

        // B
        var b = this.reader.getFloat(node, 'b');
        if (!(b != null && !isNaN(b) && b >= 0 && b <= 1))
            return "unable to parse B component of the " + messageError;

        // A
        var a = this.reader.getFloat(node, 'a');
        if (!(a != null && !isNaN(a) && a >= 0 && a <= 1))
            return "unable to parse A component of the " + messageError;

        color.push(...[r, g, b, a]);

        return color;
    }

    /*
     * Callback to be executed on any read error, showing an error on the console.
     * @param {string} message
     */
    onXMLError(message) {
        console.error("XML Loading Error: " + message);
        this.loadedOk = false;
    }

    /**
     * Callback to be executed on any minor error, showing a warning on the console.
     * @param {string} message
     */
    onXMLMinorError(message) {
        console.warn("Warning: " + message);
    }

    /**
     * Callback to be executed on any message.
     * @param {string} message
     */
    log(message) {
        console.log("   " + message);
    }


    

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {
        //To do: Create display loop for transversing the scene graph

        this.components_graph.display(this.idRoot);


        //To test the parsing/creation of the primitives, call the display function directly
		//this.primitives['demoCylinder'].display();
    }
}