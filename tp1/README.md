# SGI 2022/2023 - TP1

# SGI 2022/2023

## Group T06G09
| Name             | Number    | E-Mail                    |
| ---------------- | --------- | ------------------------- |
| Ricardo Nunes    | 202109480 | up202109480@edu.fe.up.pt  |
| Luís Guimarães   | 202204188 | up202204188@edu.fe.up.pt  |

----
## Project information

- (items describing main strong points)
- A **ComponentsGraph** data structure is created to store information about each node. After parsing the components, a check is done to verify that the graph is well defined.
- The display of the scene graph is done recursively, using a depth-first traversal of the ComponentsGraph data structure.
- Inheritance of transformations, materials and textures are guaranteed by using stacks. The scene's matrix stack is used in the case of transformations, and two stacks are created in the ComponentsGraph data structure to store materials and textures' ids (the actual objects stored in the scene graph are accessed when setting the appearance of the scene).

- Desert
  - (Brief description of the created scene)
  - The center of the scene is an oasis surrounded by cactuses (which are composed of a cylinder and toruses)
  - Pyramids with different sizes can be seen as well
  - (relative link to the scene)
----
## Issues/Problems

- (items describing unimplemented features, bugs, problems, etc.)
