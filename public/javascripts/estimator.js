document.getElementById('stl-import').addEventListener('click', () => { document.getElementById('file-submission').click(); });

document.getElementById('file-submission').addEventListener('change', upload);
async function upload() {
  if (document.getElementById('file-submission').files.length == 0) {
    return;
  }

  console.log(document.getElementById('file-submission').files);

  const formData = new FormData();
  formData.append('stl-file', document.getElementById('file-submission').files[0]);

  try {
    const response = await fetch(`${window.location.pathname}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }
  
    console.log(response);
    response.json()
      .then((r) => {
        console.log(r);
      })
      .catch((r) => {
        console.log(r)
      });
  }
  catch (error) {
    console.error(`An error has occurred!: ${error}`);
  }

  // Populate
}
