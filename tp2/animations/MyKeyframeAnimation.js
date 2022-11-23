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

        if (active_segment != "none"){
            if (active_segment == "last"){
                var start_index = last_index

                var interpolating = false
            }else{
                var start_index = active_segment
                var end_index = start_index +1
                var t_total = this.instants[end_index] - this.instants[start_index]
                var exec_ratio = (t_seconds - this.instants[start_index]) / t_total
                //console.log(exec_ratio, this.instants[start_index], this.instants[end_index])

                var interpolating = true
            }
            this.active_transformation = mat4.create()

            // for every geometric transformation in active keyframe
            for (var i = 0; i < this.keyframes[start_index].length; ++i){                
                var transf_vec3 = vec3.create()
                if (i == 0){
                    // Translation
                    if (interpolating)
                        transf_vec3 = vec3.lerp(transf_vec3, this.keyframes[start_index][i], this.keyframes[end_index][i], exec_ratio)
                    else
                        transf_vec3 = this.keyframes[start_index][i]
                    mat4.translate(this.active_transformation, this.active_transformation, transf_vec3)
                }else if (i > 0 && i < 4){
                    // Rotations
                    if (interpolating){
                        var angle = (this.keyframes[end_index][i] - this.keyframes[start_index][i]) * exec_ratio + this.keyframes[start_index][i]
                    }else
                        var angle = this.keyframes[start_index][i]
                    //mat4.rotate(this.active_transformation, this.active_transformation, transf_vec3)
                    console.log(angle)
                    switch (i){
                        case 1:
                            mat4.rotateZ(this.active_transformation, this.active_transformation, angle)
                            break
                        case 2:
                            mat4.rotateY(this.active_transformation, this.active_transformation, angle)
                            break
                        case 3:
                            mat4.rotateX(this.active_transformation, this.active_transformation, angle) 
                    }
                }else{
                    // Scale
                    if(interpolating)
                        transf_vec3 = vec3.lerp(transf_vec3, this.keyframes[start_index][i], this.keyframes[end_index][i], exec_ratio)
                    else
                        transf_vec3 = this.keyframes[start_index][i]
                    mat4.scale(this.active_transformation, this.active_transformation, transf_vec3)
                }
            }
        }
        else mat4.scale(this.active_transformation, this.active_transformation, [0,0,0])

    }
  
    apply() {
        this.scene.multMatrix(this.active_transformation)
    }
}
