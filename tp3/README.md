# SGI 2022/2023 - TP3

## Group T06G09
| Name             | Number    | E-Mail                    |
| ---------------- | --------- | ------------------------- |
| Ricardo Nunes    | 202109480 | up202109480@edu.fe.up.pt  |
| Luís Guimarães   | 202204188 | up202204188@edu.fe.up.pt  |

----
## Project information

- (items describing main strong points)
- Scene
  - (Brief description of the created scene)
  - (relative link to the scene)
----
## Limitations
- Camera names for player 1 and 2 must be:
	- 1: "Game_camera_p0"
	- 2: "Game_camera_p1"
- Component with boards must have ID "checkers"
- The start button is the game board (before the game has started)

## Issues/Bugs:
- Clicking on pieces' corners, when a tile is visible and close to the mouse cursor, results in different ids being picked than the one expected.
- The use of camel case vs underscore in naming is not as consistent as desired.