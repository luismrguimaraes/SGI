import { CGFappearance, CGFobject } from '../../lib/CGF.js';

/**
 * Game
 * @constructor
 */
export class Game{
    constructor (scene){
        this.scene = scene
		this.mainboard = scene.graph.boards[0];
		this.boards = scene.graph.boards;
		this.lastMovedPiece = null;
    }


	set_lastMovedPiece(value){
        this.lastMovedPiece = value
    }
	
	// -------------------------- COMMON LOGIC --------------------------
	
	/**
	* @method makeAllTilesUnpickable
	* Makes every tile in the this.mainboard unpickable
	*/
	makeAllTilesUnpickable() {	 
		for(var i = 0; i < 8; i++) {
			for(var j = 0; j < 8; j++) {
				var tile = this.mainboard.getTile(i, j)
				tile.setPickable(false);
			}
		}
	}
	
	/**
	* @method makeAllPiecesUnpickable
	* Makes every piece in the this.mainboard unpickable
	*/
	makeAllPiecesUnpickable() {	 
		for(var i = 0; i < this.mainboard.pieces.length; i++) {
			this.mainboard.pieces[i].setPickable(false)
		}
	}


	
	// -------------------------- AFTER MOVEMENT LOGIC --------------------------
	
	/**
	* @method pieceHasBeenMoved
	* Main function to be run whenever a piece is moved
    * First it will make all tiles unpickable
	* Then it will check if the piece has to be promoted to a king, and if it is, then the piece is promoted to king
	* Then it will check if the piece captured anything on its move, if so checks if another adjacent piece can be captured
	* Then it will change player
	*/
	pieceHasBeenMoved(originalBoardPosition, newBoardPosition) {
		this.makeAllTilesUnpickable();
		var shouldThePieceBeKing = this.checkIfPieceShouldBeKing(this.lastMovedPiece);
		
		if (shouldThePieceBeKing) {
			this.setPieceAsKing(this.lastMovedPiece);
		}
		this.checkIfCaptureAvailable(originalBoardPosition, newBoardPosition);
	}
	
	/**
	* @method checkIfPieceShouldBeKing
	* Checks if the piece has reached the end of the oposite direction of the board
	*/
	checkIfPieceShouldBeKing(lastMovedPiece) {
		var pieceColor = lastMovedPiece.color;
		var pieceBoardPosition = lastMovedPiece.getBoardPosition();
		
		var piecePositionValues = pieceBoardPosition.split(" ");
		
		var pieceXPosition = parseInt(piecePositionValues[0]);
		var pieceYPosition = parseInt(piecePositionValues[1]);
		 
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
		
		pickedPiece.set_isKing(true, fusingPiece);
	 }

	/**
	* @method checkIfCaptureAvailable
	* Checks if a piece was captured during the move
	*/
	checkIfCaptureAvailable(originalBoardPosition, newBoardPosition) {	 
		var originalPositionValues = originalBoardPosition.split(" ");
		
		var pieceOriginalXPosition = parseInt(originalPositionValues[0]);
		var pieceOriginalYPosition = parseInt(originalPositionValues[1]);

		var newPositionValues = newBoardPosition.split(" ");
		
		var pieceNewXPosition = parseInt(newPositionValues[0]);
		var pieceNewYPosition = parseInt(newPositionValues[1]);

		var xDifference = pieceNewXPosition - pieceOriginalXPosition;
		var yDifference = pieceNewYPosition - pieceOriginalYPosition;
		
		console.log("xDifference " + xDifference);
		console.log("yDifference " + yDifference);

		// For up-left
		if (xDifference < -1 && yDifference > 1) {
			var capturedPieceXPosition = pieceNewXPosition + 1;
			var capturedPieceYPosition = pieceNewYPosition - 1;

			this.capturePiece(capturedPieceXPosition, capturedPieceYPosition);
			this.checkIfAnotherCaptureMovementIsPossible(newBoardPosition);
		}
		// For up-right
		else if (xDifference > 1 && yDifference > 1) {
			var capturedPieceXPosition = pieceNewXPosition - 1;
			var capturedPieceYPosition = pieceNewYPosition - 1;

			this.capturePiece(capturedPieceXPosition, capturedPieceYPosition);
			this.checkIfAnotherCaptureMovementIsPossible(newBoardPosition);
		}
		// For down-left
		else if (xDifference < -1 && yDifference < -1) {
			var capturedPieceXPosition = pieceNewXPosition + 1;
			var capturedPieceYPosition = pieceNewYPosition + 1;

			this.capturePiece(capturedPieceXPosition, capturedPieceYPosition);
			this.checkIfAnotherCaptureMovementIsPossible(newBoardPosition);
		}
		// For down-right
		else if (xDifference > 1 && yDifference < -1) {
			var capturedPieceXPosition = pieceNewXPosition - 1;
			var capturedPieceYPosition = pieceNewYPosition + 1;

			this.capturePiece(capturedPieceXPosition, capturedPieceYPosition);
			this.checkIfAnotherCaptureMovementIsPossible(newBoardPosition);
		}	
	}

	/**
	* @method capturePiece
	* Captures the piece standing in x and y position on the board
	*/
	capturePiece(capturedPieceXPosition, capturedPieceYPosition) {
		var capturedPiece = this.mainboard.getPieceAt(capturedPieceXPosition, capturedPieceYPosition);
		console.log("capturedPiece ", capturedPiece);
		var capturedPieceColor = capturedPiece.color;
		
		console.log("capturedPieceXPosition " + capturedPieceXPosition);
		console.log("capturedPieceYPosition " + capturedPieceYPosition);

		if (capturedPieceColor == 0) {
			this.mainboard.removePieceAt(capturedPieceXPosition, capturedPieceYPosition);
			this.boards[1].push(capturedPiece);
		}
		else if (capturedPieceColor == 1) {
			console.log("Captured black");
			this.mainboard.removePieceAt(capturedPieceXPosition, capturedPieceYPosition);
			this.boards[2].push(capturedPiece);
		}
	}

	/**
	* @method checkIfAnotherCaptureMovementIsPossible
	* Checks if it is possible to capture another piece
	*/
	checkIfAnotherCaptureMovementIsPossible(newBoardPosition) {
		// TO DO
	}
	
	
	// -------------------------- BEFORE MOVEMENT LOGIC --------------------------
    
	/**
	* @method pieceHasBeenPicked
	* Main function to be run whenever a piece is picked
	* First it will make all tiles unpickable
	* Then it will get the available tiles where the piece is allowed to move and make them pickable
	*/
	pieceHasBeenPicked(pickedPiece) {
		this.makeAllTilesUnpickable();
		this.makeAvailableTilesForPickedPiecePickable(pickedPiece);
	}
	
	/**
	* @method makeAvailableTilesForPickedPiecePickable
	* Get the tiles where the piece is allowed to move and makes them pickable
	*/
	makeAvailableTilesForPickedPiecePickable(pickedPiece) {
		var availableTiles = [];
		availableTiles = this.checkAvailableMoves(pickedPiece);
		
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
		var leftTilePieceColor = pieceColor;
		var rightTilePieceColor = pieceColor;
		var pieceBoardPosition = pickedPiece.getBoardPosition();
		
		var piecePositionValues = pieceBoardPosition.split(" ");
		
		var pieceXPosition = parseInt(piecePositionValues[0]);
		var pieceYPosition = parseInt(piecePositionValues[1]);
		
		var pieceIsKing = pickedPiece.isKing;
		
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

				console.log(targetedYUpPosition + "YUp");
				console.log(targetedYDownPosition + "YDown");
				console.log(targetedXLeftPosition + "XLeft");
				console.log(targetedXRightPosition + "XRight");
				
				// Check up-left (northeast) diagonal
				while (targetedYUpPosition < 8 && targetedXLeftPosition > -1) {
					console.log("Im up-left");
					var leftTilePiece = this.mainboard.getPieceAt(targetedXLeftPosition, targetedYUpPosition);
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
							console.log("OLA?");
							targetedYUpPositionForCapture = targetedYUpPosition + 1;
							targetedXLeftPositionForCapture = targetedXLeftPosition - 1;
							if (targetedYUpPositionForCapture < 8 && targetedXLeftPositionForCapture > -1) {
								console.log("up " + targetedYUpPositionForCapture);
								console.log("left " + targetedXLeftPositionForCapture);
								leftTilePiece = this.mainboard.getPieceAt(targetedXLeftPositionForCapture, targetedYUpPositionForCapture);
								if (leftTilePiece == null) {
									// If the tile is free
									targetedLeftFreeTile = this.mainboard.getTile(targetedXLeftPositionForCapture, targetedYUpPositionForCapture);
									availableTiles.push(targetedLeftFreeTile);
								}
								break;
							}
							else {
								break;
							}
						}
					}
					targetedYUpPosition++;
					targetedXLeftPosition--;
				}

				// Reset targeted positions
				targetedYUpPosition = pieceYPosition + 1;					
				targetedYDownPosition = pieceYPosition - 1;
				targetedXLeftPosition = pieceXPosition - 1;
				targetedXRightPosition = pieceXPosition + 1;
				
				// Check up-right (northwest) diagonal
				while (targetedYUpPosition < 8 && targetedXRightPosition < 8) {
					console.log("Im up-right");
					var rightTilePiece = this.mainboard.getPieceAt(targetedXRightPosition, targetedYUpPosition)
					if (rightTilePiece == null) {
						// If the tile is free
						targetedRightFreeTile = this.mainboard.getTile(targetedXRightPosition, targetedYUpPosition);
						availableTiles.push(targetedRightFreeTile);
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
							targetedYUpPositionForCapture = targetedYUpPosition + 1;
							targetedXRightPositionForCapture = targetedXRightPosition + 1;
							if (targetedYUpPositionForCapture < 8 && targetedXRightPositionForCapture < 8) {
								rightTilePiece = this.mainboard.getPieceAt(targetedXRightPositionForCapture, targetedYUpPositionForCapture);
								if (rightTilePiece == null) {
									// If the tile is free
									targetedRightFreeTile = this.mainboard.getTile(targetedXRightPositionForCapture, targetedYUpPositionForCapture);
									availableTiles.push(targetedRightFreeTile);
								}
								break;
							}
							else {
								break;
							}
						}
					}
					targetedYUpPosition++;
					targetedXRightPosition++;
				}

				// Reset targeted positions
				targetedYUpPosition = pieceYPosition + 1;					
				targetedYDownPosition = pieceYPosition - 1;
				targetedXLeftPosition = pieceXPosition - 1;
				targetedXRightPosition = pieceXPosition + 1;
				
				// Check down-left (southeast) diagonal
				while (targetedYDownPosition > -1 && targetedXLeftPosition > -1) {
					console.log("Im down-left");
					var leftTilePiece = this.mainboard.getPieceAt(targetedXLeftPosition, targetedYDownPosition)
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
							targetedYDownPositionForCapture = targetedYDownPosition - 1;
							targetedXLeftPositionForCapture = targetedXLeftPosition - 1;
							if (targetedYDownPositionForCapture > -1 && targetedXLeftPositionForCapture > -1) {
								leftTilePiece = this.mainboard.getPieceAt(targetedXLeftPositionForCapture, targetedYDownPositionForCapture);
								if (leftTilePiece == null) {
									// If the tile is free
									targetedLeftFreeTile = this.mainboard.getTile(targetedXLeftPositionForCapture, targetedYDownPositionForCapture);
									availableTiles.push(targetedLeftFreeTile);
								}
								break;
							}
							else {
								break;
							}
						}
					}
					targetedYDownPosition--;
					targetedXLeftPosition--;
				}

				// Reset targeted positions
				targetedYUpPosition = pieceYPosition + 1;					
				targetedYDownPosition = pieceYPosition - 1;
				targetedXLeftPosition = pieceXPosition - 1;
				targetedXRightPosition = pieceXPosition + 1;
				
				// Check down-right (southwest) diagonal
				while (targetedYDownPosition > -1 && targetedXRightPosition < 8) {
					console.log("Im down-right");
					var rightTilePiece = this.mainboard.getPieceAt(targetedXRightPosition, targetedYDownPosition)
					if (rightTilePiece == null) {
						// If the tile is free
						console.log("X" + targetedXRightPosition);
						console.log("Y" + targetedYDownPosition);
						targetedRightFreeTile = this.mainboard.getTile(targetedXRightPosition, targetedYDownPosition);
						availableTiles.push(targetedRightFreeTile);
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
							targetedYDownPositionForCapture = targetedYDownPosition - 1;
							targetedXRightPositionForCapture = targetedXRightPosition + 1;
							if (targetedYDownPositionForCapture > -1 && targetedXRightPositionForCapture < 8) {
								rightTilePiece = this.mainboard.getPieceAt(targetedXRightPositionForCapture, targetedYDownPositionForCapture);
								if (rightTilePiece == null) {
									// If the tile is free
									targetedRightFreeTile = this.mainboard.getTile(targetedXRightPositionForCapture, targetedYDownPositionForCapture);
									availableTiles.push(targetedRightFreeTile);
								}
								break;
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

				console.log(targetedYUpPosition + "YUp");
				console.log(targetedYDownPosition + "YDown");
				console.log(targetedXLeftPosition + "XLeft");
				console.log(targetedXRightPosition + "XRight");
				
				// Check up-left (northeast) diagonal
				while (targetedYUpPosition < 8 && targetedXLeftPosition < 8) {
					console.log("Im up-left");
					var leftTilePiece = this.mainboard.getPieceAt(targetedXLeftPosition, targetedYUpPosition)
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
							targetedYUpPositionForCapture = targetedYUpPosition + 1;
							targetedXLeftPositionForCapture = targetedXLeftPosition + 1;
							if (targetedYUpPositionForCapture < 8 && targetedXLeftPositionForCapture < 8) {
								leftTilePiece = this.mainboard.getPieceAt(targetedXLeftPositionForCapture, targetedYUpPositionForCapture);
								if (leftTilePiece == null) {
									// If the tile is free
									targetedLeftFreeTile = this.mainboard.getTile(targetedXLeftPositionForCapture, targetedYUpPositionForCapture);
									availableTiles.push(targetedLeftFreeTile);
								}
								break;
							}
							else {
								break;
							}
						}
					}
					targetedYUpPosition++;
					targetedXLeftPosition++;
				}

				// Reset targeted positions
				targetedYUpPosition = pieceYPosition + 1;					
				targetedYDownPosition = pieceYPosition - 1;
				targetedXLeftPosition = pieceXPosition + 1;
				targetedXRightPosition = pieceXPosition - 1;
				
				// Check up-right (northwest) diagonal
				while (targetedYUpPosition < 8 && targetedXRightPosition > -1) {
					console.log("Im up-right");
					var rightTilePiece = this.mainboard.getPieceAt(targetedXRightPosition, targetedYUpPosition)
					if (rightTilePiece == null) {
						// If the tile is free
						targetedRightFreeTile = this.mainboard.getTile(targetedXRightPosition, targetedYUpPosition);
						availableTiles.push(targetedRightFreeTile);
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
							targetedYUpPositionForCapture = targetedYUpPosition + 1;
							targetedXRightPositionForCapture = targetedXRightPosition - 1;
							if (targetedYUpPositionForCapture < 8 && targetedXRightPositionForCapture > -1) {
								rightTilePiece = this.mainboard.getPieceAt(targetedXRightPositionForCapture, targetedYUpPositionForCapture);
								if (rightTilePiece == null) {
									// If the tile is free
									targetedRightFreeTile = this.mainboard.getTile(targetedXRightPositionForCapture, targetedYUpPositionForCapture);
									availableTiles.push(targetedRightFreeTile);
								}
								break;
							}
							else {
								break;
							}
						}
					}
					targetedYUpPosition++;
					targetedXRightPosition--;
				}

				// Reset targeted positions
				targetedYUpPosition = pieceYPosition + 1;					
				targetedYDownPosition = pieceYPosition - 1;
				targetedXLeftPosition = pieceXPosition + 1;
				targetedXRightPosition = pieceXPosition - 1;
				
				// Check down-left (southeast) diagonal
				while (targetedYDownPosition > -1 && targetedXLeftPosition < 8) {
					console.log("Im down-left");
					var leftTilePiece = this.mainboard.getPieceAt(targetedXLeftPosition, targetedYDownPosition);
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
							targetedYDownPositionForCapture = targetedYDownPosition - 1;
							targetedXLeftPositionForCapture = targetedXLeftPosition + 1;
							if (targetedYDownPositionForCapture > -1 && targetedXLeftPositionForCapture < 8) {
								leftTilePiece = this.mainboard.getPieceAt(targetedXLeftPositionForCapture, targetedYDownPositionForCapture);
								if (leftTilePiece == null) {
									// If the tile is free
									targetedLeftFreeTile = this.mainboard.getTile(targetedXLeftPositionForCapture, targetedYDownPositionForCapture);
									availableTiles.push(targetedLeftFreeTile);
								}
								break;
							}
							else {
								break;
							}
						}
					}
					targetedYDownPosition--;
					targetedXLeftPosition++;
				}

				// Reset targeted positions
				targetedYUpPosition = pieceYPosition + 1;					
				targetedYDownPosition = pieceYPosition - 1;
				targetedXLeftPosition = pieceXPosition + 1;
				targetedXRightPosition = pieceXPosition - 1;
				
				// Check down-right (southwest) diagonal
				while (targetedYDownPosition > -1 && targetedXRightPosition > -1) {
					console.log("Im down-right");
					var rightTilePiece = this.mainboard.getPieceAt(targetedXRightPosition, targetedYDownPosition)
					if (rightTilePiece == null) {
						// If the tile is free
						targetedRightFreeTile = this.mainboard.getTile(targetedXRightPosition, targetedYDownPosition);
						availableTiles.push(targetedRightFreeTile);
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
							targetedYDownPositionForCapture = targetedYDownPosition - 1;
							targetedXRightPositionForCapture = targetedXRightPosition - 1;
							if (targetedYDownPositionForCapture > -1 && targetedXRightPositionForCapture > -1) {
								rightTilePiece = this.mainboard.getPieceAt(targetedXRightPositionForCapture, targetedYDownPositionForCapture);
								if (rightTilePiece == null) {
									// If the tile is free
									targetedRightFreeTile = this.mainboard.getTile(targetedXRightPositionForCapture, targetedYDownPositionForCapture);
									availableTiles.push(targetedRightFreeTile);
								}
								break;
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
			var targetedYUpPositionForCapture = pieceYPosition + 2;
			var targetedXLeftPositionForCapture = pieceXPosition - 2;
			var targetedXRightPositionForCapture = pieceXPosition + 2;
			var canGoLeft = false;
			var canGoRight = false;
			var leftTilePiece = null;
			var rightTilePiece = null;
			
			if (targetedYUpPosition < 8 && targetedXLeftPosition > -1) {
				canGoLeft = true;
				leftTilePiece = this.mainboard.getPieceAt(targetedXLeftPosition, targetedYUpPosition);
				console.log(targetedYUpPosition);
				console.log(targetedXLeftPosition);
			}
			
			if (targetedYUpPosition < 8 && targetedXRightPosition < 8) {
				canGoRight = true;
				rightTilePiece = this.mainboard.getPieceAt(targetedXRightPosition, targetedYUpPosition);
				console.log(targetedYUpPosition);
				console.log(targetedXRightPosition);
			}

			if (leftTilePiece != null) {
				leftTilePieceColor = leftTilePiece.color;
				console.log("There is a piece! Its color is: " + leftTilePieceColor);
				console.log("canGoLeft: " + canGoLeft);
				console.log("targetedYUpPositionForCapture: " + targetedYUpPositionForCapture);
				console.log("targetedXLeftPositionForCapture: " + targetedXLeftPositionForCapture);
			}	
			
			if (leftTilePiece == null && canGoLeft) {
				var targetedLeftFreeTile = this.mainboard.getTile(targetedXLeftPosition, targetedYUpPosition);
				availableTiles.push(targetedLeftFreeTile);
			}

			else if (leftTilePieceColor != pieceColor && canGoLeft && targetedYUpPositionForCapture < 8 && targetedXLeftPositionForCapture > -1) {
				console.log("I'm inside left mate");
				leftTilePiece = this.mainboard.getPieceAt(targetedXLeftPositionForCapture, targetedYUpPositionForCapture);
				if (leftTilePiece == null) {
					// If the tile is free
					targetedLeftFreeTile = this.mainboard.getTile(targetedXLeftPositionForCapture, targetedYUpPositionForCapture);
					availableTiles.push(targetedLeftFreeTile);
				}
			}

			if (rightTilePiece != null) {
				rightTilePieceColor = rightTilePiece.color;
				console.log("There is a piece! Its color is: " + rightTilePieceColor);
				console.log("canGoRight: " + canGoRight);
				console.log("targetedYUpPositionForCapture: " + targetedYUpPositionForCapture);
				console.log("targetedXRightPositionForCapture: " + targetedXRightPositionForCapture);
			}
			
			if(rightTilePiece == null && canGoRight) {
				var targetedRightFreeTile = this.mainboard.getTile(targetedXRightPosition, targetedYUpPosition);
				availableTiles.push(targetedRightFreeTile);
			}

			else if (rightTilePieceColor != pieceColor && canGoRight && targetedYUpPositionForCapture < 8 && targetedXRightPositionForCapture < 8) {
				console.log("I'm inside right mate");
				rightTilePiece = this.mainboard.getPieceAt(targetedXRightPositionForCapture, targetedYUpPositionForCapture);
				if (rightTilePiece == null) {
					// If the tile is free
					targetedRightFreeTile = this.mainboard.getTile(targetedXRightPositionForCapture, targetedYUpPositionForCapture);
					availableTiles.push(targetedRightFreeTile);
				}
			}
		}
		
		// Normal piece check for blacks
		// Left and right is oriented from the black's player view perspective
		if (pieceColor == 1 && !pieceIsKing) {
			var targetedYDownPosition = pieceYPosition - 1;
			var targetedXLeftPosition = pieceXPosition + 1;
			var targetedXRightPosition = pieceXPosition - 1;
			var targetedYDownPositionForCapture = pieceYPosition - 2;
			var targetedXLeftPositionForCapture = pieceXPosition + 2;
			var targetedXRightPositionForCapture = pieceXPosition - 2;
			var canGoLeft = false;
			var canGoRight = false;
			var leftTilePiece = null;
			var rightTilePiece = null;
			
			if (targetedYDownPosition > -1 && targetedXLeftPosition < 8) {
				canGoLeft = true;
				leftTilePiece = this.mainboard.getPieceAt(targetedXLeftPosition, targetedYDownPosition);
				console.log(targetedYDownPosition);
				console.log(targetedXLeftPosition);
			}
			
			if (targetedYDownPosition > -1 && targetedXRightPosition > -1) {
				canGoRight = true;
				rightTilePiece = this.mainboard.getPieceAt(targetedXRightPosition, targetedYDownPosition);
				console.log(targetedYDownPosition);
				console.log(targetedXRightPosition);
			}
			
			if (leftTilePiece != null) {
				leftTilePieceColor = leftTilePiece.color;
				console.log("There is a piece! Its color is: " + leftTilePieceColor);
				console.log("canGoLeft: " + canGoLeft);
				console.log("targetedYDownPositionForCapture: " + targetedYDownPositionForCapture);
				console.log("targetedXLeftPositionForCapture: " + targetedXLeftPositionForCapture);
			}

			if (leftTilePiece == null && canGoLeft) {
				var targetedLeftFreeTile = this.mainboard.getTile(targetedXLeftPosition, targetedYDownPosition);
				availableTiles.push(targetedLeftFreeTile);
			}
			else if (leftTilePieceColor != pieceColor && canGoLeft && targetedYDownPositionForCapture > -1 && targetedXLeftPositionForCapture < 8) {
				console.log("I'm inside left mate");
				leftTilePiece = this.mainboard.getPieceAt(targetedXLeftPositionForCapture, targetedYDownPositionForCapture);
				if (leftTilePiece == null) {
					// If the tile is free
					targetedLeftFreeTile = this.mainboard.getTile(targetedXLeftPositionForCapture, targetedYDownPositionForCapture);
					availableTiles.push(targetedLeftFreeTile);
				}
			}

			if (rightTilePiece != null) {
				rightTilePieceColor = rightTilePiece.color;
				console.log("There is a piece! Its color is: " + rightTilePieceColor);
				console.log("canGoRight: " + canGoRight);
				console.log("targetedYDownPositionForCapture: " + targetedYDownPositionForCapture);
				console.log("targetedXRightPositionForCapture: " + targetedXRightPositionForCapture);
			}
			
			if(rightTilePiece == null && canGoRight) {
				var targetedRightFreeTile = this.mainboard.getTile(targetedXRightPosition, targetedYDownPosition);
				availableTiles.push(targetedRightFreeTile);
			}
			else if (rightTilePieceColor != pieceColor && canGoRight && targetedYDownPositionForCapture > -1 && targetedXRightPositionForCapture > -1) {
				console.log("I'm inside right mate");
				var rightTilePiece = this.mainboard.getPieceAt(targetedXRightPositionForCapture, targetedYDownPositionForCapture);
				if (rightTilePiece == null) {
					// If the tile is free
					targetedRightFreeTile = this.mainboard.getTile(targetedXRightPositionForCapture, targetedYDownPositionForCapture);
					availableTiles.push(targetedRightFreeTile);
				}
			}
		}
		return availableTiles;
	}
	
}