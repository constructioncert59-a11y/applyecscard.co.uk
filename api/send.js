document.addEventListener("DOMContentLoaded", function () {

  const form =
    document.getElementById("ecsForm");

  if (!form) return;

  form.addEventListener("submit", async function (e) {

    e.preventDefault();

    const submitBtn =
      document.querySelector(".submit-btn");

    // =========================
    // DISABLE BUTTON
    // =========================

    submitBtn.disabled = true;

    submitBtn.innerText =
      "Processing...";

    try {

      // =========================
      // FORM DATA
      // =========================

      const formData =
        new FormData(form);

      // =========================
      // CLOUDINARY UPLOAD FUNCTION
      // =========================

      async function uploadToCloudinary(file) {

        if (!file) return "";

        const cloudData =
          new FormData();

        cloudData.append(
          "file",
          file
        );

        // YOUR CLOUDINARY PRESET
        cloudData.append(
          "upload_preset",
          "YOUR_UPLOAD_PRESET"
        );

        const response =
          await fetch(
            "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/auto/upload",
            {
              method: "POST",
              body: cloudData
            }
          );

        const result =
          await response.json();

        // ERROR CHECK
        if (!response.ok) {

          throw new Error(
            result.error?.message ||
            "Cloudinary upload failed"
          );

        }

        return result.secure_url;

      }

      // =========================
      // GET FILES
      // =========================

      const photo =
        form.querySelector(
          'input[name="photo"]'
        )?.files[0];

      const idProof =
        form.querySelector(
          'input[name="id_proof"]'
        )?.files[0];

      const hsProof =
        form.querySelector(
          'input[name="hs_test_proof"]'
        )?.files[0];

      // =========================
      // UPLOAD FILES
      // =========================

      const photoUrl =
        await uploadToCloudinary(photo);

      const idProofUrl =
        await uploadToCloudinary(idProof);

      const hsProofUrl =
        await uploadToCloudinary(hsProof);

      // =========================
      // NORMAL FORM DATA
      // =========================

      const data = {};

      formData.forEach((value, key) => {

        // REMOVE FILE OBJECTS
        if (!(value instanceof File)) {

          data[key] = value;

        }

      });

      // =========================
      // ADD FILE URLS
      // =========================

      data.photo =
        photoUrl;

      data.id_proof =
        idProofUrl;

      data.hs_test_proof =
        hsProofUrl;

      // =========================
      // SEND TO BACKEND
      // =========================

      const response =
        await fetch("/api/send", {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify(data)

        });

      const result =
        await response.json();

      // =========================
      // API ERROR
      // =========================

      if (!response.ok) {

        throw new Error(
          result.error ||
          "Submission failed"
        );

      }

      // =========================
      // SUCCESS ALERT
      // =========================

      alert(
        "Application submitted successfully!"
      );

      // =========================
      // RESET FORM
      // =========================

      form.reset();

      // =========================
      // REDIRECT TO PAYMENT
      // =========================

      window.location.href =
        "https://www.paypal.com/ncp/payment/UE3S2YBUJASZ4";

    } catch (error) {

      console.error(
        "FORM ERROR:",
        error
      );

      alert(
        error.message ||
        "Something went wrong"
      );

    } finally {

      // =========================
      // ENABLE BUTTON
      // =========================

      submitBtn.disabled = false;

      submitBtn.innerText =
        "Submit & Proceed to Payment";

    }

  });

});
