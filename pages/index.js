import { useState } from "react";

export default function Home() {

  // TEXT FIELDS
  const [full_name, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [ni_number, setNiNumber] = useState("");
  const [gender, setGender] = useState("");
  const [street_address, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [confirm_email, setConfirmEmail] = useState("");
  const [ecs_card_type, setEcsCardType] = useState("");
  const [ecs_card_number, setEcsCardNumber] = useState("");
  const [expiry_date, setExpiryDate] = useState("");
  const [occupation, setOccupation] = useState("");
  const [employer, setEmployer] = useState("");
  const [qualification, setQualification] = useState("");
  const [hs_test, setHsTest] = useState("");

  // FILES
  const [photoFile, setPhotoFile] = useState(null);
  const [idProofFile, setIdProofFile] = useState(null);
  const [hsProofFile, setHsProofFile] = useState(null);

  // BASE64 CONVERT
  const convertToBase64 = (file) => {

    return new Promise((resolve, reject) => {

      if (!file) {
        resolve("");
        return;
      }

      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => resolve(reader.result);

      reader.onerror = (error) => reject(error);

    });
  };

  // SUBMIT
  const handleSubmit = async (e) => {

    e.preventDefault();

    // FILE CONVERT
    const photoBase64 =
      await convertToBase64(photoFile);

    const idProofBase64 =
      await convertToBase64(idProofFile);

    const hsProofBase64 =
      await convertToBase64(hsProofFile);

    // FINAL DATA
    const formData = {

      full_name,
      dob,
      ni_number,
      gender,
      street_address,
      city,
      postcode,
      mobile,
      email,
      confirm_email,
      ecs_card_type,
      ecs_card_number,
      expiry_date,
      occupation,
      employer,
      qualification,
      hs_test,

      photo: photoBase64,
      id_proof: idProofBase64,
      hs_test_proof: hsProofBase64
    };

    console.log(formData);

    // API CALL
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
      maxWidth: "700px",
      margin: "40px auto",
      padding: "20px",
      fontFamily: "Arial"
    }}>

      <h1>ECS Booking Form</h1>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          placeholder="Full Name"
          onChange={(e) => setFullName(e.target.value)}
        />

        <br /><br />

        <input
          type="date"
          onChange={(e) => setDob(e.target.value)}
        />

        <br /><br />

        <input
          type="text"
          placeholder="NI Number"
          onChange={(e) => setNiNumber(e.target.value)}
        />

        <br /><br />

        <input
          type="text"
          placeholder="Gender"
          onChange={(e) => setGender(e.target.value)}
        />

        <br /><br />

        <input
          type="text"
          placeholder="Street Address"
          onChange={(e) => setStreetAddress(e.target.value)}
        />

        <br /><br />

        <input
          type="text"
          placeholder="City"
          onChange={(e) => setCity(e.target.value)}
        />

        <br /><br />

        <input
          type="text"
          placeholder="Postcode"
          onChange={(e) => setPostcode(e.target.value)}
        />

        <br /><br />

        <input
          type="text"
          placeholder="Mobile"
          onChange={(e) => setMobile(e.target.value)}
        />

        <br /><br />

        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <br /><br />

        <input
          type="email"
          placeholder="Confirm Email"
          onChange={(e) => setConfirmEmail(e.target.value)}
        />

        <br /><br />

        <input
          type="text"
          placeholder="ECS Card Type"
          onChange={(e) => setEcsCardType(e.target.value)}
        />

        <br /><br />

        <input
          type="text"
          placeholder="ECS Card Number"
          onChange={(e) => setEcsCardNumber(e.target.value)}
        />

        <br /><br />

        <input
          type="date"
          onChange={(e) => setExpiryDate(e.target.value)}
        />

        <br /><br />

        <input
          type="text"
          placeholder="Occupation"
          onChange={(e) => setOccupation(e.target.value)}
        />

        <br /><br />

        <input
          type="text"
          placeholder="Employer"
          onChange={(e) => setEmployer(e.target.value)}
        />

        <br /><br />

        <input
          type="text"
          placeholder="Qualification"
          onChange={(e) => setQualification(e.target.value)}
        />

        <br /><br />

        <input
          type="text"
          placeholder="HS Test"
          onChange={(e) => setHsTest(e.target.value)}
        />

        <br /><br />

        <label>Photo</label>
        <br />

        <input
          type="file"
          onChange={(e) => setPhotoFile(e.target.files[0])}
        />

        <br /><br />

        <label>ID Proof</label>
        <br />

        <input
          type="file"
          onChange={(e) => setIdProofFile(e.target.files[0])}
        />

        <br /><br />

        <label>HS Test Proof</label>
        <br />

        <input
          type="file"
          onChange={(e) => setHsProofFile(e.target.files[0])}
        />

        <br /><br />

        <button type="submit">
          Submit
        </button>

      </form>

    </div>
  );
}
