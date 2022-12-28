import { CGFappearance, CGFobject } from '../../lib/CGF.js';

/**
 * Game
 * @constructor
 */
export class Game{
    constructor (scene){
        this.scene = scene
    }
    
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
	 * Makes every tile in the mainboard unpickable
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
		
		var pieceXPosition = pickedPiece.piecePositionValues[0];
		var pieceYPosition = pickedPiece.piecePositionValues[1];
		
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
					var leftTilePiece = mainboard.getPieceAt(targetedXLeftPosition, targetedYPosition)
					if (leftTilePiece == null) {
						// If the tile is free
						targetedLeftFreeTile = mainboard.getTile(targetedXLeftPosition, targetedYUpPosition);
						availableTiles.push(targetedLeftFreeTile);
					}
					else {
						//If the tile has a piece, get it (x, y) and check its color
						var pieceOnTile = mainboard.getPieceAt(targetedXLeftPosition, targetedYUpPosition);
						var pieceOnTileColor = pieceOnTile.color;
						
						// If same color, break, else see if capture is possible and if it is, add the tile to the targeted tiles and break
						if (pieceOnTileColor == pieceColor) {
							break;
						}
						else {
							targetedYUpPositionForCapture = targetedYUpPosition++;
							targetedXLeftPositionForCapture = targetedXLeftPosition--;
							if (targetedYUpPositionForCapture > -1 && targetedXLeftPositionForCapture > -1) {
								targetedLeftFreeTile = mainboard.getTile(targetedXLeftPositionForCapture, targetedYUpPositionForCapture);
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
					var leftTilePiece = mainboard.getPieceAt(targetedXRightPosition, targetedYPosition)
					if (leftTilePiece == null) {
						// If the tile is free
						targetedLeftFreeTile = mainboard.getTile(targetedXRightPosition, targetedYUpPosition);
						availableTiles.push(targetedLeftFreeTile);
					}
					else {
						//If the tile has a piece, get it (x, y) and check its color
						var pieceOnTile = mainboard.getPieceAt(targetedXRightPosition, targetedYUpPosition);
						var pieceOnTileColor = pieceOnTile.color;
						
						// If same color, break, else see if capture is possible and if it is, add the tile to the targeted tiles and break
						if (pieceOnTileColor == pieceColor) {
							break;
						}
						else {
							targetedYUpPositionForCapture = targetedYUpPosition++;
							targetedXRightPositionForCapture = targetedXRightPosition++;
							if (targetedYUpPositionForCapture > -1 && targetedXRightPositionForCapture < 8) {
								targetedLeftFreeTile = mainboard.getTile(targetedXRightPositionForCapture, targetedYUpPositionForCapture);
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
					var leftTilePiece = mainboard.getPieceAt(targetedXLeftPosition, targetedYPosition)
					if (leftTilePiece == null) {
						// If the tile is free
						targetedLeftFreeTile = mainboard.getTile(targetedXLeftPosition, targetedYDownPosition);
						availableTiles.push(targetedLeftFreeTile);
					}
					else {
						//If the tile has a piece, get it (x, y) and check its color
						var pieceOnTile = mainboard.getPieceAt(targetedXLeftPosition, targetedYDownPosition);
						var pieceOnTileColor = pieceOnTile.color;
						
						// If same color, break, else see if capture is possible and if it is, add the tile to the targeted tiles and break
						if (pieceOnTileColor == pieceColor) {
							break;
						}
						else {
							targetedYDownPositionForCapture = targetedYDownPosition--;
							targetedXLeftPositionForCapture = targetedXLeftPosition--;
							if (targetedYDownPositionForCapture > -1 && targetedXLeftPositionForCapture > -1) {
								targetedLeftFreeTile = mainboard.getTile(targetedXLeftPositionForCapture, targetedYDownPositionForCapture);
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
					var leftTilePiece = mainboard.getPieceAt(targetedXRightPosition, targetedYPosition)
					if (leftTilePiece == null) {
						// If the tile is free
						targetedLeftFreeTile = mainboard.getTile(targetedXRightPosition, targetedYDownPosition);
						availableTiles.push(targetedLeftFreeTile);
					}
					else {
						//If the tile has a piece, get it (x, y) and check its color
						var pieceOnTile = mainboard.getPieceAt(targetedXRightPosition, targetedYDownPosition);
						var pieceOnTileColor = pieceOnTile.color;
						
						// If same color, break, else see if capture is possible and if it is, add the tile to the targeted tiles and break
						if (pieceOnTileColor == pieceColor) {
							break;
						}
						else {
							targetedYDownPositionForCapture = targetedYDownPosition--;
							targetedXRightPositionForCapture = targetedXRightPosition++;
							if (targetedYDownPositionForCapture > -1 && targetedXRightPositionForCapture < 8) {
								targetedLeftFreeTile = mainboard.getTile(targetedXRightPositionForCapture, targetedYDownPositionForCapture);
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
					var leftTilePiece = mainboard.getPieceAt(targetedXLeftPosition, targetedYPosition)
					if (leftTilePiece == null) {
						// If the tile is free
						targetedLeftFreeTile = mainboard.getTile(targetedXLeftPosition, targetedYUpPosition);
						availableTiles.push(targetedLeftFreeTile);
					}
					else {
						//If the tile has a piece, get it (x, y) and check its color
						var pieceOnTile = mainboard.getPieceAt(targetedXLeftPosition, targetedYUpPosition);
						var pieceOnTileColor = pieceOnTile.color;
						
						// If same color, break, else see if capture is possible and if it is, add the tile to the targeted tiles and break
						if (pieceOnTileColor == pieceColor) {
							break;
						}
						else {
							targetedYUpPositionForCapture = targetedYUpPosition++;
							targetedXLeftPositionForCapture = targetedXLeftPosition++;
							if (targetedYUpPositionForCapture > -1 && targetedXLeftPositionForCapture < 8) {
								targetedLeftFreeTile = mainboard.getTile(targetedXLeftPositionForCapture, targetedYUpPositionForCapture);
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
					var leftTilePiece = mainboard.getPieceAt(targetedXRightPosition, targetedYPosition)
					if (leftTilePiece == null) {
						// If the tile is free
						targetedLeftFreeTile = mainboard.getTile(targetedXRightPosition, targetedYUpPosition);
						availableTiles.push(targetedLeftFreeTile);
					}
					else {
						//If the tile has a piece, get it (x, y) and check its color
						var pieceOnTile = mainboard.getPieceAt(targetedXRightPosition, targetedYUpPosition);
						var pieceOnTileColor = pieceOnTile.color;
						
						// If same color, break, else see if capture is possible and if it is, add the tile to the targeted tiles and break
						if (pieceOnTileColor == pieceColor) {
							break;
						}
						else {
							targetedYUpPositionForCapture = targetedYUpPosition++;
							targetedXRightPositionForCapture = targetedXRightPosition--;
							if (targetedYUpPositionForCapture > -1 && targetedXRightPositionForCapture > -1) {
								targetedLeftFreeTile = mainboard.getTile(targetedXRightPositionForCapture, targetedYUpPositionForCapture);
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
					var leftTilePiece = mainboard.getPieceAt(targetedXLeftPosition, targetedYPosition)
					if (leftTilePiece == null) {
						// If the tile is free
						targetedLeftFreeTile = mainboard.getTile(targetedXLeftPosition, targetedYDownPosition);
						availableTiles.push(targetedLeftFreeTile);
					}
					else {
						//If the tile has a piece, get it (x, y) and check its color
						var pieceOnTile = mainboard.getPieceAt(targetedXLeftPosition, targetedYDownPosition);
						var pieceOnTileColor = pieceOnTile.color;
						
						// If same color, break, else see if capture is possible and if it is, add the tile to the targeted tiles and break
						if (pieceOnTileColor == pieceColor) {
							break;
						}
						else {
							targetedYDownPositionForCapture = targetedYDownPosition--;
							targetedXLeftPositionForCapture = targetedXLeftPosition++;
							if (targetedYDownPositionForCapture > -1 && targetedXLeftPositionForCapture < 8) {
								targetedLeftFreeTile = mainboard.getTile(targetedXLeftPositionForCapture, targetedYDownPositionForCapture);
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
					var leftTilePiece = mainboard.getPieceAt(targetedXRightPosition, targetedYPosition)
					if (leftTilePiece == null) {
						// If the tile is free
						targetedLeftFreeTile = mainboard.getTile(targetedXRightPosition, targetedYDownPosition);
						availableTiles.push(targetedLeftFreeTile);
					}
					else {
						//If the tile has a piece, get it (x, y) and check its color
						var pieceOnTile = mainboard.getPieceAt(targetedXRightPosition, targetedYDownPosition);
						var pieceOnTileColor = pieceOnTile.color;
						
						// If same color, break, else see if capture is possible and if it is, add the tile to the targeted tiles and break
						if (pieceOnTileColor == pieceColor) {
							break;
						}
						else {
							targetedYDownPositionForCapture = targetedYDownPosition--;
							targetedXRightPositionForCapture = targetedXRightPosition--;
							if (targetedYDownPositionForCapture > -1 && targetedXRightPositionForCapture > -1) {
								targetedLeftFreeTile = mainboard.getTile(targetedXRightPositionForCapture, targetedYDownPositionForCapture);
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
				leftTilePiece = mainboard.getPieceAt(targetedXLeftPosition, targetedYUpPosition);
			}
			
			if (targetedYUpPosition < 8 && targetedXRightPosition < 8) {
				canGoRight = true;
				rightTilePiece = mainboard.getPieceAt(targetedXRightPosition, targetedYUpPosition);
			}
			
			
			if (leftTilePiece == null && canGoLeft) {
				var targetedLeftFreeTile = mainboard.getTile(targetedXLeftPosition, targetedYUpPosition);
				availableTiles.push(targetedLeftFreeTile);
			}
			else if (leftTilePieceColor != pieceColor && canGoLeft && targetedYUpPosition < 8 && targetedXLeftPositionForCapture > -1) {
				var targetedLeftFreeTile = mainboard.getTile(targetedXLeftPositionForCapture, targetedYUpPosition);
				availableTiles.push(targetedLeftFreeTile);
			}
			
			if(rightTilePiece == null && canGoRight) {
				var targetedRightFreeTile = mainboard.getTile(targetedXRightPosition, targetedYUpPosition);
				availableTiles.push(targetedRightFreeTile);
			}
			else if (leftTilePieceColor != pieceColor && canGoLeft && targetedYUpPosition < 8 && targetedXRightPositionForCapture < 8) {
				var targetedRightFreeTile = mainboard.getTile(targetedXRightPositionForCapture, targetedYUpPosition);
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
				leftTilePiece = mainboard.getPieceAt(targetedXLeftPosition, targetedYDownPosition);
			}
			
			if (targetedYDownPosition > -1 && targetedXRightPosition > -1) {
				canGoRight = true;
				rightTilePiece = mainboard.getPieceAt(targetedXRightPosition, targetedYDownPosition);
			}
			
			
			if (leftTilePiece == null && canGoLeft) {
				var targetedLeftFreeTile = mainboard.getTile(targetedXLeftPosition, targetedYDownPosition);
				availableTiles.push(targetedLeftFreeTile);
			}
			else if (leftTilePieceColor != pieceColor && canGoLeft && targetedYDownPosition > -1 && targetedXLeftPositionForCapture < 8) {
				var targetedLeftFreeTile = mainboard.getTile(targetedXLeftPositionForCapture, targetedYDownPosition);
				availableTiles.push(targetedLeftFreeTile);
			}
			
			if(rightTilePiece == null && canGoRight) {
				var targetedRightFreeTile = mainboard.getTile(targetedXRightPosition, targetedYDownPosition);
				availableTiles.push(targetedRightFreeTile);
			}
			else if (leftTilePieceColor != pieceColor && canGoLeft && targetedYDownPosition > -1 && targetedXRightPositionForCapture > -1) {
				var targetedRightFreeTile = mainboard.getTile(targetedXRightPositionForCapture, targetedYDownPosition);
				availableTiles.push(targetedRightFreeTile);
			}
		}
		return availableTiles;
	}
	
}