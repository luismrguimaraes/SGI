import { CGFappearance, CGFobject } from '../../lib/CGF.js';

/**
 * Player
 * @constructor
 */
export class Player{
    constructor (scene, id){
        this.scene = scene;
        this.isPlayerTurn = false;
        this.id = id;
    }

    setIsPlayerTurn(value){
        this.isPlayerTurn = value;
    }
}