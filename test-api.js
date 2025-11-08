fetch("https://n8n.aichandre.my.id/webhook/get-list")
  .then((response) => {
    console.log("Response status:", response.status);
    return response.text();
  })
  .then((data) => {
    console.log("Response data:", data);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
