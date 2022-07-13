// import library
const express = require('express');
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const multer = require('multer')
const path = require("path");




// import route
const userRoute = require('./routes/user')
const authRoute = require('./routes/auth')
const postRoute = require('./routes/post')
const commentRoute = require('./routes/comment')
const conversationRoute = require('./routes/conversation')
const messageRoute = require('./routes/message')



// app start up and port
const app = express();
app.use(express.json())


// Enviroment avarible ENV
dotenv.config()


app.use("/images", express.static(path.join(__dirname, "public/images")));


// connect database
mongoose.connect(process.env.MONGO_URL, () => {
    console.log("Connected to MongoDB");
});

//middleware
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(morgan("common"));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/images");
    },
    filename: (req, file, cb) => {
        cb(null, req.body.name);
        // cb(null, file.originalname);

    },
});

const upload = multer({ storage: storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
    try {
        return res.status(200).json("File uploded successfully");
    } catch (error) {
        return res.status(500).json(error.message);
    }
});



// request http
app.get('/', (req, res) => {
    res.send('alo')
})
app.use('/api/users', userRoute)
app.use('/api/auth', authRoute)
app.use('/api/posts', postRoute)
app.use('/api/posts', commentRoute)
app.use("/api/conversation", conversationRoute);
app.use("/api/messages", messageRoute);

app.listen(1800, () => {
    console.log('Server is running... ');
})