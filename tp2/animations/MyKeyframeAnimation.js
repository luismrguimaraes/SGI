import { MyAnimation } from "./MyAnimation.js"

export class MyKeyframeAnimation extends MyAnimation{

    constructor(keyframes, instants, scene) {
        super(scene)
        this.keyframes = keyframes
        this.instants = instants
        this.active_transformation = mat4.create()
    }
  
    update(t) {
        var t_seconds = t/1000

        // find animation segment
        var last_index = this.instants.length -1
        // active_segment = ("none" || start_index || "last")
        var active_segment = "none"
        for (var i = 0; i < last_index; ++i){
            if (t_seconds >= this.instants[i] && t_seconds < this.instants[i+1])
                active_segment = i
        }
        if (t_seconds >= this.instants[last_index])
            active_segment = "last"

        //var transfMatrix = mat4.create();
        if (active_segment != "none"){
            if (active_segment == "last"){
                let start_index = last_index
                this.active_transformation = mat4.create()
                // for every geometric transformation in active_transformation
                for (var i = 0; i < this.keyframes[start_index].length; ++i){
                    //apply transformation
                    if (i == 0){
                        var transf_vec3 = this.keyframes[start_index][i]
                        mat4.translate(this.active_transformation, this.active_transformation, transf_vec3)
                    }else if (i > 0 && i < 4){
                        //let axis = 
                        //transf_vec3 = vec3.lerp(transf_vec3, this.keyframes[start_index][i], this.keyframes[end_index][i], exec_ratio)
                        //mat4.rotate(this.active_transformation, this.active_transformation, transf_vec3)
                    }else{
                        transf_vec3 = this.keyframes[start_index][i]
                        mat4.scale(this.active_transformation, this.active_transformation, transf_vec3)
                    }
                    }
            }
            else{
                let start_index = active_segment
                let end_index = start_index +1
                let t_total = this.instants[end_index] - this.instants[start_index]
                let exec_ratio = (t_seconds - this.instants[start_index]) / t_total
                console.log(exec_ratio, this.instants[start_index], this.instants[end_index])

                this.active_transformation = mat4.create()
                // for every geometric transformation in active_transformation
                for (var i = 0; i < this.keyframes[start_index].length; ++i){
                    //interpolate
                    var transf_vec3 = vec3.create()
                    
                    //apply transformation
                    if (i == 0){
                        transf_vec3 = vec3.lerp(transf_vec3, this.keyframes[start_index][i], this.keyframes[end_index][i], exec_ratio)
                        mat4.translate(this.active_transformation, this.active_transformation, transf_vec3)
                    }else if (i > 0 && i < 4){
                        //let axis = 
                        //transf_vec3 = vec3.lerp(transf_vec3, this.keyframes[start_index][i], this.keyframes[end_index][i], exec_ratio)
                        //mat4.rotate(this.active_transformation, this.active_transformation, transf_vec3)
                    }else{
                        transf_vec3 = vec3.lerp(transf_vec3, this.keyframes[start_index][i], this.keyframes[end_index][i], exec_ratio)
                        mat4.scale(this.active_transformation, this.active_transformation, transf_vec3)
                    }
                }
                //vec3.lerp(transfMatrix, this.instants[start_index], this.instants[end_index], exec_ratio)
            }
        }else mat4.scale(this.active_transformation, this.active_transformation, [0,0,0])

    }
  
    apply() {
        this.scene.multMatrix(this.active_transformation)
    }
}
