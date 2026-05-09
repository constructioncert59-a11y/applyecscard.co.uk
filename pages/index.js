import { useState } from "react";

export default function Home() {

  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [photoFile, setPhotoFile] = useState(null);

  // CONVERT IMAGE TO BASE64
  const convertToBase64 = (file) => {

    return new Promise((resolve, reject) => {

      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => resolve(reader.result);

      reader.onerror = (error) => reject(error);

    });
  };

  // SUBMIT FORM
  const handleSubmit = async (e) => {

    e.preventDefault();

    // IMAGE CONVERT
    const photoBase64 = photoFile
      ? await convertToBase64(photoFile)
      : "";

    // FINAL DATA
    const formData = {

      full_name,
      email,
      photo: photoBase64
    };

    // SEND API
    const response = await fetch("/api/send-email", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify(formData)
    });

    const result = await response.json();

    console.log(result);

    if (result.success) {
      alert("Form Submitted Successfully");
    } else {
      alert("Something went wrong");
    }
  };

  return (

    <div style={{
      maxWidth: "500px",
      margin: "50px auto",
      padding: "20px",
      fontFamily: "Arial"
    }}>

      <h1>ECS Booking Form</h1>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          placeholder="Full Name"
          value={full_name}
          onChange={(e) => setFullName(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "15px"
          }}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "15px"
          }}
        />

        <label>Upload Photo</label>

        <br /><br />

        <input
          type="file"
          onChange={(e) => setPhotoFile(e.target.files[0])}
        />

        <br /><br />

        <button
          type="submit"
          style={{
            padding: "12px 25px",
            background: "black",
            color: "white",
            border: "none",
            cursor: "pointer"
          }}
        >
          Submit
        </button>

      </form>

    </div>
  );
}
