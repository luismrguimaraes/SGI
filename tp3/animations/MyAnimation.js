export class MyAnimation {

    constructor(scene) {
        if (this.constructor == MyAnimation) {
            throw new Error("Abstract classes can't be instantiated.");
        }
        this.scene = scene
    }
  
    update(t) {
        console.log("update " + t);
      
    }
  
    apply() {
        console.log("apply");
    }
}
