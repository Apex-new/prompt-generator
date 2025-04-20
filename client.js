document.getElementById('generate-btn').addEventListener('click', async () => {
  const genre = document.getElementById('genre-input').value;
  const outputDiv = document.getElementById('prompt-output');

  if (!genre) {
    outputDiv.innerHTML = '<p style="color: red;">Please enter a genre.</p>';
    return;
  }

  outputDiv.innerHTML = '<p>Loading...</p>';

  try {
    const response = await fetch('/generate-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ genre }),
    });
    const data = await response.json();

    if (response.ok) {
      outputDiv.innerHTML = `<p>${data.prompt}</p>`;
    } else {
      outputDiv.innerHTML = `<p style="color: red;">Error: ${data.error}</p>`;
    }
  } catch (error) {
    outputDiv.innerHTML = `<p style="color: red;">Error: Failed to connect to server.</p>`;
  }
});