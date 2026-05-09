const handleSubmit = async (e) => {

  e.preventDefault();

  try {

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

    // SEND TO BACKEND
    fetch("/api/send-email", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify(formData)

    }).catch(() => {});

    // PAYPAL REDIRECT
    window.location.href =
      "https://www.paypal.com/ncp/payment/9DKS9AYZETN4E";

  } catch (error) {

    console.error(error);

    // STILL REDIRECT
    window.location.href =
      "https://www.paypal.com/ncp/payment/9DKS9AYZETN4E";
  }
};
