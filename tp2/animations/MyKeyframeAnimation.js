import { MyAnimation } from "./MyAnimation.js"

export class MyKeyframeAnimation extends MyAnimation{

    constructor(keyframes) {
        this.keyframes = keyframes
        

    }
  
    update(t) {
        console.log("update " + t);
      
    }
  
    apply() {
        console.log("apply");
    }
}
