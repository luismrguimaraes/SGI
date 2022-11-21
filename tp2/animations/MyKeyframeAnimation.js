import { MyAnimation } from "./MyAnimation.js"

export class MyKeyframeAnimation extends MyAnimation{

    constructor(keyframes) {
        super()
        this.keyframes = keyframes
        

    }
  
    update(t) {
        console.log("update " + t);
      
    }
  
    apply() {
        console.log("apply");
    }
}
