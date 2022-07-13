const mongoose = require("mongoose");
const Schema = mongoose.Schema


const PostSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    desc: {
        type: String,
    },
    img: {
        type: String,
    },
    category: {
        type: String,
        enum: ['Kỹ thuật - điện tử', 'Công nghệ thông tin', 'Kinh tế - Kinh doanh', 'Nông - Lâm - Thủy sản', 'Ngôn ngữ học', 'Tin tức - sự kiện', 'Khác']
    },
    likes: {
        type: Array,
        default: [],
    },
    show: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Post", PostSchema);