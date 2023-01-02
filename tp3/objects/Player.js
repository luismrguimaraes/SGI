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
	
	addPieceAlivePiece(piece){
        this.alivePieces.push(piece)
    }
	
	removePieceAlivePiece(piece){
		var index = this.alivePieces.indexOf(piece);
        var x = this.alivePieces.splice(index, 1);
		console.log(this.alivePieces);
    }
}