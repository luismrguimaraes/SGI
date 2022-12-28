import { CGFappearance, CGFobject } from '../../lib/CGF.js';

/**
 * Game
 * @constructor
 */
export class Game{
    constructor (scene){
        this.scene = scene
		this.lastMovedPiece = null;
    }


	set_lastMovedPiece(value){
        this.lastMovedPiece = value
    }
	
	// -------------------------- AFTER MOVEMENT LOGIC --------------------------
	
	/**
	* @method pieceHasBeenMoved
	* Main function to be run whenever a piece is moved
	* First it will check if the piece has to be promoted to a king, and if it is, then the piece is promoted to king
	* Then it will check if the piece captured anything on its move
	*/
	pieceHasBeenMoved(lastMovedPiece) {
		var shouldThePieceBeKing = checkIfPieceShouldBeKing(lastMovedPiece);
		
		if (shouldThePieceBeKing) {
			setPieceAsKing(lastMovedPiece);
		}
	}
	
	/**
	* @method checkIfPieceShouldBeKing
	* Checks if the piece has reached the end of the oposite direction of the board
	*/
	checkIfPieceShouldBeKing(lastMovedPiece) {
		var pieceColor = lastMovedPiece.color;
		var boardPosition = lastMovedPiece.getBoardPosition();
		
		var piecePositionValues = pieceBoardPosition.split(" ");
		
		var pieceXPosition = piecePositionValues[0];
		var pieceYPosition = piecePositionValues[1];
		 
		if (pieceColor == 0 && pieceYPosition == 7) {
			// Check if white piece has reached upper tiles
			return true;
		}
		else if (pieceColor == 1 && pieceYPosition == 0) {
			// Check if black piece has reached bottom tiles
			return true;
		}
		else {
			// In case of none of the above conditions are met
			return false;
		}
	}
	 
	/**
	* @method setPieceAsKing
	* Makes the piece a king, checking if there is an available fusing piece
	* If there is not a fusing piece available in the auxiliary board, then null is passed to set_IsKing function
	*/
	setPieceAsKing(pickedPiece) {
		var pieceColor = pickedPiece.color;
		var fusingPiece = null;
		
		// Check if piece is white or black, then tries to get the piece in the aux board of that color, will return null if it does not exist
		if (pieceColor == 0) {
			fusingPiece = this.boards[1].pop();
		}
		else if (pieceColor == 1) {
			fusingPiece = this.boards[2].pop();
		}
		
		pieckedPiece.set_isKing(true, fusingPiece);
	 }	
	
	
	// -------------------------- BEFORE MOVEMENT LOGIC --------------------------
    
	/**
	* @method pieceHasBeenPicked
	* Main function to be run whenever a piece is picked
	* First it will make all tiles unpickable
	* Then it will get the available tiles where the piece is allowed to move and make them pickable
	*/
	pieceHasBeenPicked(pickedPiece) {
		makeAllTilesUnpickable();
		makeAvailableTilesForPickedPiecePickable(pickedPiece);
	}
	
	/**
	* @method makeAllTilesUnpickable
	* Makes every tile in the this.mainboard unpickable
	*/
	makeAllTilesUnpickable() {	 
		for(var i = 0; i < 8; i++) {
			for(var j = 0; j < 8; j++) {
				var tile = getTile(i, j)
				tile.setPickable(false);
			}
		}
	}
	
	/**
	* @method makeAvailableTilesForPickedPiecePickable
	* Get the tiles where the piece is allowed to move and makes them pickable
	*/
	makeAvailableTilesForPickedPiecePickable(pickedPiece) {
		var availableTiles = [];
		availableTiles = checkAvailableMoves(pickedPiece);
		
		for (const tile of availableTiles) {
			tile.setPickable(true);
		}
	}
	 
	/**
	 * @method checkAvailableMoves
	 * Checks the available moves for a picked piece
	 */
	checkAvailableMoves(pickedPiece) {		
		var pieceColor = pickedPiece.color;
		var pieceBoardPosition = pickedPiece.getBoardPosition();
		
		var piecePositionValues = pieceBoardPosition.split(" ");
		
		var pieceXPosition = piecePositionValues[0];
		var pieceYPosition = piecePositionValues[1];
		
		var pieceIsKing = pieckedPiece.isKing;
		
		console.log("Piece color is " + pieceColor);
		
		var availableTiles = [];
		
		// King check
		if (pieceIsKing) {
			// King piece check for whites
			// Left and right is oriented from the white's player view perspective
			if (pieceColor == 0) {
				var targetedYUpPosition = pieceYPosition + 1;
				var targetedYDownPosition = pieceYPosition - 1;
				var targetedXLeftPosition = pieceXPosition - 1;
				var targetedXRightPosition = pieceXPosition + 1;
				
				var leftTilePiece = null;
				var rightTilePiece = null;
				var targetedLeftFreeTile = null;
				var targetedRightFreeTile = null;
				
				var targetedYUpPositionForCapture = null;
				var targetedYDownPositionForCapture = null;
				var targetedXLeftPositionForCapture = null;
				var targetedXRightPositionForCapture = null;
				
				// Check up-left (northeast) diagonal
				while (targetedYUpPosition < 8 && targetedXLeftPosition > -1) {
					var leftTilePiece = this.this.mainboard.getPieceAt(targetedXLeftPosition, targetedYPosition)
					if (leftTilePiece == null) {
						// If the tile is free
						targetedLeftFreeTile = this.this.mainboard.getTile(targetedXLeftPosition, targetedYUpPosition);
						availableTiles.push(targetedLeftFreeTile);
					}
					else {
						//If the tile has a piece, get it (x, y) and check its color
						var pieceOnTile = this.mainboard.getPieceAt(targetedXLeftPosition, targetedYUpPosition);
						var pieceOnTileColor = pieceOnTile.color;
						
						// If same color, break, else see if capture is possible and if it is, add the tile to the targeted tiles and break
						if (pieceOnTileColor == pieceColor) {
							break;
						}
						else {
							targetedYUpPositionForCapture = targetedYUpPosition++;
							targetedXLeftPositionForCapture = targetedXLeftPosition--;
							if (targetedYUpPositionForCapture > -1 && targetedXLeftPositionForCapture > -1) {
								targetedLeftFreeTile = this.mainboard.getTile(targetedXLeftPositionForCapture, targetedYUpPositionForCapture);
							}
							else {
								break;
							}
						}
					}
					targetedYUpPosition++;
					targetedXLeftPosition--;
				}
				
				// Check up-right (northwest) diagonal
				while (targetedYUpPosition < 8 && targetedXRightPosition < 8) {
					var leftTilePiece = this.mainboard.getPieceAt(targetedXRightPosition, targetedYPosition)
					if (leftTilePiece == null) {
						// If the tile is free
						targetedLeftFreeTile = this.mainboard.getTile(targetedXRightPosition, targetedYUpPosition);
						availableTiles.push(targetedLeftFreeTile);
					}
					else {
						//If the tile has a piece, get it (x, y) and check its color
						var pieceOnTile = this.mainboard.getPieceAt(targetedXRightPosition, targetedYUpPosition);
						var pieceOnTileColor = pieceOnTile.color;
						
						// If same color, break, else see if capture is possible and if it is, add the tile to the targeted tiles and break
						if (pieceOnTileColor == pieceColor) {
							break;
						}
						else {
							targetedYUpPositionForCapture = targetedYUpPosition++;
							targetedXRightPositionForCapture = targetedXRightPosition++;
							if (targetedYUpPositionForCapture > -1 && targetedXRightPositionForCapture < 8) {
								targetedLeftFreeTile = this.mainboard.getTile(targetedXRightPositionForCapture, targetedYUpPositionForCapture);
							}
							else {
								break;
							}
						}
					}
					targetedYUpPosition++;
					targetedXRightPosition++;
				}
				
				// Check down-left (southeast) diagonal
				while (targetedYDownPosition > -1 && targetedXLeftPosition > -1) {
					var leftTilePiece = this.mainboard.getPieceAt(targetedXLeftPosition, targetedYPosition)
					if (leftTilePiece == null) {
						// If the tile is free
						targetedLeftFreeTile = this.mainboard.getTile(targetedXLeftPosition, targetedYDownPosition);
						availableTiles.push(targetedLeftFreeTile);
					}
					else {
						//If the tile has a piece, get it (x, y) and check its color
						var pieceOnTile = this.mainboard.getPieceAt(targetedXLeftPosition, targetedYDownPosition);
						var pieceOnTileColor = pieceOnTile.color;
						
						// If same color, break, else see if capture is possible and if it is, add the tile to the targeted tiles and break
						if (pieceOnTileColor == pieceColor) {
							break;
						}
						else {
							targetedYDownPositionForCapture = targetedYDownPosition--;
							targetedXLeftPositionForCapture = targetedXLeftPosition--;
							if (targetedYDownPositionForCapture > -1 && targetedXLeftPositionForCapture > -1) {
								targetedLeftFreeTile = this.mainboard.getTile(targetedXLeftPositionForCapture, targetedYDownPositionForCapture);
							}
							else {
								break;
							}
						}
					}
					targetedYDownPosition--;
					targetedXLeftPosition--;
				}
				
				// Check down-right (southwest) diagonal
				while (targetedYDownPosition > -1 && targetedXRightPosition < 8) {
					var leftTilePiece = this.mainboard.getPieceAt(targetedXRightPosition, targetedYPosition)
					if (leftTilePiece == null) {
						// If the tile is free
						targetedLeftFreeTile = this.mainboard.getTile(targetedXRightPosition, targetedYDownPosition);
						availableTiles.push(targetedLeftFreeTile);
					}
					else {
						//If the tile has a piece, get it (x, y) and check its color
						var pieceOnTile = this.mainboard.getPieceAt(targetedXRightPosition, targetedYDownPosition);
						var pieceOnTileColor = pieceOnTile.color;
						
						// If same color, break, else see if capture is possible and if it is, add the tile to the targeted tiles and break
						if (pieceOnTileColor == pieceColor) {
							break;
						}
						else {
							targetedYDownPositionForCapture = targetedYDownPosition--;
							targetedXRightPositionForCapture = targetedXRightPosition++;
							if (targetedYDownPositionForCapture > -1 && targetedXRightPositionForCapture < 8) {
								targetedLeftFreeTile = this.mainboard.getTile(targetedXRightPositionForCapture, targetedYDownPositionForCapture);
							}
							else {
								break;
							}
						}
					}
					targetedYDownPosition--;
					targetedXRightPosition++;
				}				
			}
			
			// King piece check for blacks
			// Left and right is oriented from the black's player view perspective
			if (pieceColor == 1) {
				var targetedYUpPosition = pieceYPosition + 1;
				var targetedYDownPosition = pieceYPosition - 1;
				var targetedXLeftPosition = pieceXPosition + 1;
				var targetedXRightPosition = pieceXPosition - 1;
				
				var leftTilePiece = null;
				var rightTilePiece = null;
				var targetedLeftFreeTile = null;
				var targetedRightFreeTile = null;
				
				var targetedYUpPositionForCapture = null;
				var targetedYDownPositionForCapture = null;
				var targetedXLeftPositionForCapture = null;
				var targetedXRightPositionForCapture = null;
				
				// Check up-left (northeast) diagonal
				while (targetedYUpPosition < 8 && targetedXLeftPosition < 8) {
					var leftTilePiece = this.mainboard.getPieceAt(targetedXLeftPosition, targetedYPosition)
					if (leftTilePiece == null) {
						// If the tile is free
						targetedLeftFreeTile = this.mainboard.getTile(targetedXLeftPosition, targetedYUpPosition);
						availableTiles.push(targetedLeftFreeTile);
					}
					else {
						//If the tile has a piece, get it (x, y) and check its color
						var pieceOnTile = this.mainboard.getPieceAt(targetedXLeftPosition, targetedYUpPosition);
						var pieceOnTileColor = pieceOnTile.color;
						
						// If same color, break, else see if capture is possible and if it is, add the tile to the targeted tiles and break
						if (pieceOnTileColor == pieceColor) {
							break;
						}
						else {
							targetedYUpPositionForCapture = targetedYUpPosition++;
							targetedXLeftPositionForCapture = targetedXLeftPosition++;
							if (targetedYUpPositionForCapture > -1 && targetedXLeftPositionForCapture < 8) {
								targetedLeftFreeTile = this.mainboard.getTile(targetedXLeftPositionForCapture, targetedYUpPositionForCapture);
							}
							else {
								break;
							}
						}
					}
					targetedYUpPosition++;
					targetedXLeftPosition++;
				}
				
				// Check up-right (northwest) diagonal
				while (targetedYUpPosition < 8 && targetedXRightPosition > -1) {
					var leftTilePiece = this.mainboard.getPieceAt(targetedXRightPosition, targetedYPosition)
					if (leftTilePiece == null) {
						// If the tile is free
						targetedLeftFreeTile = this.mainboard.getTile(targetedXRightPosition, targetedYUpPosition);
						availableTiles.push(targetedLeftFreeTile);
					}
					else {
						//If the tile has a piece, get it (x, y) and check its color
						var pieceOnTile = this.mainboard.getPieceAt(targetedXRightPosition, targetedYUpPosition);
						var pieceOnTileColor = pieceOnTile.color;
						
						// If same color, break, else see if capture is possible and if it is, add the tile to the targeted tiles and break
						if (pieceOnTileColor == pieceColor) {
							break;
						}
						else {
							targetedYUpPositionForCapture = targetedYUpPosition++;
							targetedXRightPositionForCapture = targetedXRightPosition--;
							if (targetedYUpPositionForCapture > -1 && targetedXRightPositionForCapture > -1) {
								targetedLeftFreeTile = this.mainboard.getTile(targetedXRightPositionForCapture, targetedYUpPositionForCapture);
							}
							else {
								break;
							}
						}
					}
					targetedYUpPosition++;
					targetedXRightPosition--;
				}
				
				// Check down-left (southeast) diagonal
				while (targetedYDownPosition > -1 && targetedXLeftPosition < 8) {
					var leftTilePiece = this.mainboard.getPieceAt(targetedXLeftPosition, targetedYPosition)
					if (leftTilePiece == null) {
						// If the tile is free
						targetedLeftFreeTile = this.mainboard.getTile(targetedXLeftPosition, targetedYDownPosition);
						availableTiles.push(targetedLeftFreeTile);
					}
					else {
						//If the tile has a piece, get it (x, y) and check its color
						var pieceOnTile = this.mainboard.getPieceAt(targetedXLeftPosition, targetedYDownPosition);
						var pieceOnTileColor = pieceOnTile.color;
						
						// If same color, break, else see if capture is possible and if it is, add the tile to the targeted tiles and break
						if (pieceOnTileColor == pieceColor) {
							break;
						}
						else {
							targetedYDownPositionForCapture = targetedYDownPosition--;
							targetedXLeftPositionForCapture = targetedXLeftPosition++;
							if (targetedYDownPositionForCapture > -1 && targetedXLeftPositionForCapture < 8) {
								targetedLeftFreeTile = this.mainboard.getTile(targetedXLeftPositionForCapture, targetedYDownPositionForCapture);
							}
							else {
								break;
							}
						}
					}
					targetedYDownPosition--;
					targetedXLeftPosition++;
				}
				
				// Check down-right (southwest) diagonal
				while (targetedYDownPosition < 8 && targetedXRightPosition > -1) {
					var leftTilePiece = this.mainboard.getPieceAt(targetedXRightPosition, targetedYPosition)
					if (leftTilePiece == null) {
						// If the tile is free
						targetedLeftFreeTile = this.mainboard.getTile(targetedXRightPosition, targetedYDownPosition);
						availableTiles.push(targetedLeftFreeTile);
					}
					else {
						//If the tile has a piece, get it (x, y) and check its color
						var pieceOnTile = this.mainboard.getPieceAt(targetedXRightPosition, targetedYDownPosition);
						var pieceOnTileColor = pieceOnTile.color;
						
						// If same color, break, else see if capture is possible and if it is, add the tile to the targeted tiles and break
						if (pieceOnTileColor == pieceColor) {
							break;
						}
						else {
							targetedYDownPositionForCapture = targetedYDownPosition--;
							targetedXRightPositionForCapture = targetedXRightPosition--;
							if (targetedYDownPositionForCapture > -1 && targetedXRightPositionForCapture > -1) {
								targetedLeftFreeTile = this.mainboard.getTile(targetedXRightPositionForCapture, targetedYDownPositionForCapture);
							}
							else {
								break;
							}
						}
					}
					targetedYDownPosition--;
					targetedXRightPosition--;
				}			
			}
		}
		
		// Normal piece check for whites
		// Left and right is oriented from the white's player view perspective
		if (pieceColor == 0 && !pieceIsKing) {
			var targetedYUpPosition = pieceYPosition + 1;
			var targetedXLeftPosition = pieceXPosition - 1;
			var targetedXRightPosition = pieceXPosition + 1;
			var targetedXLeftPositionForCapture = pieceXPosition - 2;
			var targetedXRightPositionForCapture = pieceXPosition + 2;
			var canGoLeft = false;
			var canGoRight = false;
			var leftTilePiece = null;
			var rightTilePiece = null;
			
			if (targetedYUpPosition < 8 && targetedXLeftPosition > -1) {
				canGoLeft = true;
				leftTilePiece = this.mainboard.getPieceAt(targetedXLeftPosition, targetedYUpPosition);
			}
			
			if (targetedYUpPosition < 8 && targetedXRightPosition < 8) {
				canGoRight = true;
				rightTilePiece = this.mainboard.getPieceAt(targetedXRightPosition, targetedYUpPosition);
			}
			
			
			if (leftTilePiece == null && canGoLeft) {
				var targetedLeftFreeTile = this.mainboard.getTile(targetedXLeftPosition, targetedYUpPosition);
				availableTiles.push(targetedLeftFreeTile);
			}
			else if (leftTilePieceColor != pieceColor && canGoLeft && targetedYUpPosition < 8 && targetedXLeftPositionForCapture > -1) {
				var targetedLeftFreeTile = this.mainboard.getTile(targetedXLeftPositionForCapture, targetedYUpPosition);
				availableTiles.push(targetedLeftFreeTile);
			}
			
			if(rightTilePiece == null && canGoRight) {
				var targetedRightFreeTile = this.mainboard.getTile(targetedXRightPosition, targetedYUpPosition);
				availableTiles.push(targetedRightFreeTile);
			}
			else if (leftTilePieceColor != pieceColor && canGoLeft && targetedYUpPosition < 8 && targetedXRightPositionForCapture < 8) {
				var targetedRightFreeTile = this.mainboard.getTile(targetedXRightPositionForCapture, targetedYUpPosition);
				availableTiles.push(targetedRightFreeTile);
			}
		}
		
		// Normal piece check for blacks
		// Left and right is oriented from the black's player view perspective
		if (pieceColor == 1 && !pieceIsKing) {
			var targetedYDownPosition = pieceYPosition - 1;
			var targetedXLeftPosition = pieceXPosition + 1;
			var targetedXRightPosition = pieceXPosition - 1;
			var targetedXLeftPositionForCapture = pieceXPosition + 2;
			var targetedXRightPositionForCapture = pieceXPosition - 2;
			var canGoLeft = false;
			var canGoRight = false;
			var leftTilePiece = null;
			var rightTilePiece = null;
			
			if (targetedYDownPosition > -1 && targetedXLeftPosition < 8) {
				canGoLeft = true;
				leftTilePiece = this.mainboard.getPieceAt(targetedXLeftPosition, targetedYDownPosition);
			}
			
			if (targetedYDownPosition > -1 && targetedXRightPosition > -1) {
				canGoRight = true;
				rightTilePiece = this.mainboard.getPieceAt(targetedXRightPosition, targetedYDownPosition);
			}
			
			
			if (leftTilePiece == null && canGoLeft) {
				var targetedLeftFreeTile = this.mainboard.getTile(targetedXLeftPosition, targetedYDownPosition);
				availableTiles.push(targetedLeftFreeTile);
			}
			else if (leftTilePieceColor != pieceColor && canGoLeft && targetedYDownPosition > -1 && targetedXLeftPositionForCapture < 8) {
				var targetedLeftFreeTile = this.mainboard.getTile(targetedXLeftPositionForCapture, targetedYDownPosition);
				availableTiles.push(targetedLeftFreeTile);
			}
			
			if(rightTilePiece == null && canGoRight) {
				var targetedRightFreeTile = this.mainboard.getTile(targetedXRightPosition, targetedYDownPosition);
				availableTiles.push(targetedRightFreeTile);
			}
			else if (leftTilePieceColor != pieceColor && canGoLeft && targetedYDownPosition > -1 && targetedXRightPositionForCapture > -1) {
				var targetedRightFreeTile = this.mainboard.getTile(targetedXRightPositionForCapture, targetedYDownPosition);
				availableTiles.push(targetedRightFreeTile);
			}
		}
		return availableTiles;
	}
	
}