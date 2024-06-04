import { loadSTL, removeSTL } from './three-preview.js';

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
        // TODO: make these actions into a function
        createSTLButton(r);
        updateActiveSTL(r);
      })
      .catch((r) => {
        console.log(r);
      });

  }
  catch (error) {
    console.error(`An error has occurred!: ${error}`);
  }
  
  document.getElementById('file-submission').value = '';
}

function updateActiveSTL(r) {
  loadSTL(r.fileName);
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
  const id = r.fileName;

  const stls = document.getElementById('stls');

  const stl = document.createElement('div');
  stl.className = 'stl';
  stl.id = `stl-${id}`;

  const inp = document.createElement('input');
  inp.id = `stl-data-${id}`;
  inp.type = 'button';
  inp.value = `${r.stlName}`;
  inp.addEventListener('click', async function() {
    console.log(this.id.split('-').pop());
  });
  stl.appendChild(inp);

  const del = document.createElement('input');
  del.id = `stl-del-${r.fileName}`;
  del.type = 'button';
  del.value = `Delete`;
  del.addEventListener('click', async function() {
    const stlId = this.id.split('-').pop();

    try {
      const response = await fetch(`${window.location.pathname}/remove`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'id': stlId,
        }),
      });

      if (!response.ok) {
        throw new Error('Issue deleting the file!')
      }

      response.json()
        .then((r) => {
          removeSTL(id);
          const element = document.getElementById(`stl-${stlId}`);
          element.remove();
        })
        .catch((e) => {
          console.log(e);
        });
    }
    catch (error) {
      console.log(error);
    }
  });
  stl.appendChild(del);

  stls.append(stl);
}
