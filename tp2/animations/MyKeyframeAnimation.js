import { MyAnimation } from "./MyAnimation.js"

export class MyKeyframeAnimation extends MyAnimation{

    constructor(keyframes, instants) {
        super()
        this.keyframes = keyframes
        this.instants = instants
    }
  
    update(t) {
        var t_seconds = t/1000
        console.log("update " + t_seconds)

        var active_segment = -1
        for (var i = 0; i < this.instants.length -1; ++i){
            if (t_seconds >= this.instants[i] && t_seconds < this.instants[i+1])
                active_segment = this.instants[i]
        }
        console.log(active_segment)

    }
  
    apply() {
        console.log("apply");
    }
}
