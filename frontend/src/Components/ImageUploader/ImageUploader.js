import React, { useState, useEffect } from "react";
import Nav from "../Nav/Nav";
import axios from "axios";

function ImageUploader() {
  const [image, setImage] = useState(null);
  const [allImage, setAllImage] = useState([]);

  const submitImg = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("image", image);

      await axios.post("http://localhost:5000/uploadimg", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      getImage();
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const onImgChange = (e) => {
    setImage(e.target.files[0]);
  };

  const getImage = async () => {
    try {
      const result = await axios.get("http://localhost:5000/getImage");
      setAllImage(result.data.data);
    } catch (e) {
      console.error("Error fetching images:", e);
    }
  };

  useEffect(() => {
    getImage();
  }, []);

  return (
    <div>
      <Nav />
      <h1>Img Part</h1>
      <form onSubmit={submitImg}>
        <input type="file" accept="image/*" onChange={onImgChange} />
        <button type="submit">Upload</button>
      </form>

      {allImage.length === 0 ? (
        <p>No images uploaded yet.</p>
      ) : (
        allImage.map((data) => (
          <img
            key={data._id}
            src={`http://localhost:5000/files/${data.image}`}
            alt={`Uploaded ${data._id}`}
            height={200}
            width={200}
          />
        ))
      )}
    </div>
  );
}

export default ImageUploader;
