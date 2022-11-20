import { MyAnimation } from "./MyAnimation.js"

export class MyKeyframeAnimation extends MyAnimation{

    constructor() {
        if (this.constructor == MyAnimation) {
            throw new Error("Abstract classes can't be instantiated.");
        }
    }
  
    update(t) {
        console.log("update " + t);
      
    }
  
    apply() {
        console.log("apply");
    }
}
