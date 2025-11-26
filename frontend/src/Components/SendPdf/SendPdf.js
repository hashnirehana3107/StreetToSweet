import React, { useEffect, useState } from 'react';
import Nav from '../Nav/Nav';
import axios from 'axios';
import PdfComp from './PdfComp';
import { pdfjs } from 'react-pdf';


pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

function SendPdf() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState("");
  const [allPdf, setAllPdf] = useState([]);
  const [pdfFile, setPDFFile] = useState(null);

  useEffect(() => {
    getpdf();
  }, []);

  const getpdf = async () => {
    const result = await axios.get("http://localhost:3000/getFile");
    console.log(result.data.data);
    setAllPdf(result.data.data);
  };

  const submitPDF = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);
    console.log(title, file);

    try {
      const result = await axios.post("http://localhost:3000/uploadfile",
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      console.log(result);

      if (result.data.status === 200) {
        alert("File uploaded successfully");
        getpdf();
      } else {
        alert("File upload failed");
      }
    } catch (error) {
      console.error("Error Uploading PDF: " + error.message);
      alert("An error occurred while uploading the PDF. Please try again.");
    }
  };

  //show pdf...
  const showPDF = (pdf) => {
    setPDFFile(`http://localhost:3000/file/${pdf}`);
  };

  return (
    <div>
      <Nav />
      <h1>Send PDF</h1>

      <form onSubmit={submitPDF}>
        <label>PDF Title</label> <br />
        <input
          required
          type='text'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        /> <br /><br />

        <label>Select PDF File</label> <br /><br />
        <input
          type="file"
          accept="application/pdf"
          required
          onChange={(e) => setFile(e.target.files[0])}
        /><br /><br />

        <button type="submit">Send PDF</button>
      </form>


      {/* display uploaded PDFs */}

<div>
  <h4>PDF Details</h4>
  {allPdf == null ? "" : allPdf.map((data) => (
    <div key={data._id}>
      <h1>Title: {data.title}</h1>
      <button onClick={() => showPDF(data.pdf)}>Show PDF</button>
    </div>
  ))}
</div>
<PdfComp pdfFile={pdfFile} />
</div>
  );
}


export default SendPdf;
