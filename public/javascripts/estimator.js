document.getElementById('stl-import').addEventListener('click', () => { document.getElementById('file-submission').click(); });

document.getElementById('file-submission').addEventListener('change', upload);
async function upload() {
  if (document.getElementById('file-submission').files.length == 0) {
    return;
  }

  console.log(document.getElementById('file-submission').files);

  const formData = new FormData();
  formData.append('stl-file', document.getElementById('file-submission').files[0]);

  const response = await fetch(`${window.location.pathname}/upload`, {
    method: 'POST',
    body: formData,
  });

  console.log(response);
  response.json()
    .then((r) => {
      console.log(r);
    })
    .catch((r) => {
      console.log(r)
    });
}
