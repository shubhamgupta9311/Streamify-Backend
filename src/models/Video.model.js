import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema= new Schema({
videoFile: {
             url: {
        type: String,
        required: true
    },
    publicId: {
        type: String,
        required: true
    }
        },
        thumbnail: {
             url: {
        type: String,
        required: true
    },
    publicId: {
        type: String,
        required: true
    }
        },
        title: {
            type: String, 
            required: true
        },
        description: {
            type: String, 
            required: true
        },
        duration: {   //cloudinary url
            type: Number, 
            required: true
        },
        views: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }

    }, {
        timestamps:true
    }

)

videoSchema.plugin(mongooseAggregatePaginate);
const Video=mongoose.model("Video",videoSchema);
export{
    Video
}