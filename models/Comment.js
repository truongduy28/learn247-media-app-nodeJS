const mongoose = require("mongoose");
const Schema = mongoose.Schema


const CommentSchema = new mongoose.Schema({
    postId: {
        type: Schema.Types.ObjectId,
        ref: 'Post'
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    desc: {
        type: String,
        required: true
    },
    img: {
        type: String
    },
    show: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Comment", CommentSchema);