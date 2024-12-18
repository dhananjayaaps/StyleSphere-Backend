const NESTJS_URL = "http://localhost:3000/upload/model";

document.getElementById("upload-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const fileInput = document.getElementById("model-file");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a file!");
    return;
  }

  // Display loading status
  const resultContainer = document.getElementById("analysis-result");
  resultContainer.textContent = "Processing file, please wait...";

  try {
    // Send file to NestJS backend
    const formData = new FormData();
    formData.append("file", file);

    const nestResponse = await fetch(NESTJS_URL, {
      method: "POST",
      body: formData,
    });

    if (!nestResponse.ok) {
      throw new Error(`NestJS Error: ${await nestResponse.text()}`);
    }

    const result = await nestResponse.json();

    // Display result
    resultContainer.textContent = JSON.stringify(result, null, 2);
    // alert("Model analysis and saving completed!");
  } catch (error) {
    console.error(error);
    alert(`Error: ${error.message}`);
  }
});
