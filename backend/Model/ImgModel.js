const mongoose = require('mongoose');
const schema = mongoose.Schema;

//input data details call
const ImgSchema = new schema({
    //insert details
    image: {
        type: String, //data type
        required: true //validate
    },
});

module.exports = mongoose.model(
    "ImgModel", //file name
    ImgSchema //function name
);