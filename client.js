document.getElementById("prompt-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const genreInput = document.getElementById("genre");
    const genre = genreInput.value.trim();
    const resultDiv = document.getElementById("result");
    const submitButton = document.querySelector("#prompt-form button");

    // Disable button and show loading
    submitButton.disabled = true;
    resultDiv.innerHTML = "Generating...";

    try {
        const response = await fetch(`/generate?genre=${encodeURIComponent(genre)}`);
        const data = await response.json();
        if (data.error) {
            resultDiv.innerHTML = `Error: ${data.error}`;
        } else {
            resultDiv.innerHTML = `<strong>Prompt:</strong> ${data.prompt}`;
        }
    } catch (error) {
        resultDiv.innerHTML = "Error: Failed to connect to server.";
    } finally {
        // Reset form and re-enable button
        genreInput.value = "";
        submitButton.disabled = false;
        genreInput.focus();
    }
});