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
		this.alivePieces = [];
    }

    setIsPlayerTurn(value){
        this.isPlayerTurn = value;
    }
	
	addPieceAlivePieces(piece){
        this.alivePieces.push(piece)
    }
	
	removePieceAlivePieces(piece){
		var index = this.alivePieces.findIndex(piece);
        this.alivePieces.slice(piece, 1);
    }
}