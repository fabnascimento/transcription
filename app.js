// call all the required packages
const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer');
const fs = require('fs');
require('dotenv').config()

var cfenv = require("cfenv")

var appEnv = cfenv.getAppEnv()

const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1');

const speechToText = new SpeechToTextV1({
    iam_apikey: appEnv.isLocal ? process.env.apikey : appEnv.getServiceCreds("speech_to_text").apikey,
    url: appEnv.isLocal ? process.env.STTURL : appEnv.getServiceCreds("speech_to_text").url
});

// SET STORAGE
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname.replace(/\s/g, "_"))
    }
})
const upload = multer({
    storage: storage
})

//CREATE EXPRESS APP
const app = express();
app.use(express.static(__dirname + '/dist'))
app.use(bodyParser.urlencoded({
    extended: true
}))

//ROUTES WILL GO HERE
// app.get('/', function (req, res) {
//     res.json({
//         message: 'WELCOME'
//     });
// });

app.post('/transcribe', upload.single('file'), function (req, res) {
    // req.body will hold the text fields, if there were any
    console.log(req.file)
    let params = {
        // From file
        audio: fs.createReadStream(`./${req.file.destination}/${req.file.filename}`),
        content_type: `${req.file.mimetype}; rate=44100`
    };
    // Call STT method
    speechToText.recognize(params)
        .then(result => {
            fs.unlinkSync(`./${req.file.destination}/${req.file.filename}`)
            res.json(result)
        })
        .catch(err => {
            res.json(err);
        });
})

app.use("*", function (req, resp) {
    resp.sendFile("/public/index.html");
});

app.listen(process.env.port || appEnv.port, '0.0.0.0', () => console.log(`Server started on port ${process.env.port || appEnv.port}`));