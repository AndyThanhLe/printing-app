
/**
 * Event Listeners
 */

// Deal with file import
document.getElementById('stl-import').addEventListener('click', () => {
  document.getElementById('file-submission').click();
});
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
      method: 'PUT',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    response.json()
      .then((r) => {
        console.log(r);
        createSTLButton(r);
      })
      .catch((r) => {
        console.log(r)
      });
  }
  catch (error) {
    console.error(`An error has occurred!: ${error}`);
  }

  // Populate
  
  document.getElementById('file-submission').value = '';
}


// Deal with submission
document.getElementById('config-submit').addEventListener('click', async function () {
  const response = await fetch(`${window.location.pathname}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "material": document.getElementsByName('material')[0].value,
      "colour": document.getElementsByName('colour')[0].value,
      "printer": document.getElementsByName('printer')[0].value,
      "infill": document.getElementsByName('infill')[0].value,
    }),
  });

  // redirect...
});


function createSTLButton(r) {
  const stls = document.getElementById('stls');

  const stl = document.createElement('div');
  stl.className = 'stl';

  const inp = document.createElement('input');
  inp.id = `stl-${r.fileName}`;
  inp.type = 'button';
  inp.value = `STL ${r.fileName}`;

  stl.appendChild(inp);
  stls.append(stl);

  inp.addEventListener('click', () => {
    console.log(inp.id.split('-').pop());
  });
  
}
