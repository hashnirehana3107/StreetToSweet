const mongoose = require('mongoose');
const schema = mongoose.Schema;

//input data details call
const pdfSchema = new schema({
    //insert details
    pdf: {
        type: String, //data type
        required: true //validate
    },
    title: {
        type: String,
        required: true,
    }


});

module.exports = mongoose.model(
    "PdfDetails", //file name
    pdfSchema //function name
);