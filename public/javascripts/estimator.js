import { loadSTL, removeSTL } from './three-preview.js';


// Declare variables and constants
const modelConfigs = {};

/**
 * Event Listeners
 */

// Deal with file import
document.getElementById('stl-import').addEventListener('click', () => {
  document.getElementById('file-submission').click();
});
document.getElementById('file-submission').addEventListener('change', upload);

// Deal with submission
document.getElementById('config-submit').addEventListener('click', async function () {
  // verify that data is submittable...
  

  const response = await fetch(`${window.location.pathname}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      'fileName': '',
      'material': document.getElementsByName('material')[0].value,
      'colour': document.getElementsByName('colour')[0].value,
      'printer': document.getElementsByName('printer')[0].value,
      'infill': document.getElementsByName('infill')[0].value,
      'quantity': document.getElementsByName('quantity')[0].value,
    }),
  });

  // redirect...
});


async function upload() {
  if (document.getElementById('file-submission').files.length == 0) {
    return;
  }

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
        createSTLButton(r.fileName, removeExtension(r.modelName));
        updateActiveSTL(r.fileName);
        adjustConfigurations(r);
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

function adjustConfigurations(r) {
  modelConfigs[r.fileName] = {
    'material': '',
    'colour': '',
    'printer': '',
    'infill': 15,
    'quantity': 1,
  }
}

function updateActiveSTL(fileName) {
  const active = document.querySelectorAll('.import-selected');

  for (let i = 0; i < active.length; i++) {
    active[i].classList.remove('import-selected');
  }

  const children = document.getElementById(`stl-${(fileName)}`).childNodes;
  for (let i = 0; i < children.length; i++) {
    children[i].classList.add('import-selected');
  }

  loadSTL(fileName);
}


function createSTLButton(fileName, modelName) {
  const stls = document.getElementById('stls');

  const stl = document.createElement('div');
  stl.className = 'stl';
  stl.id = `stl-${fileName}`;

  const inp = document.createElement('input');
  inp.id = `stl-data-${fileName}`;
  inp.type = 'button';
  inp.value = modelName;
  inp.addEventListener('click', async function() {
    updateActiveSTL(fileName);
  });
  stl.appendChild(inp);

  const del = document.createElement('input');
  del.id = `stl-del-${fileName}`;
  del.type = 'button';
  del.value = `Delete`;
  del.addEventListener('click', async function() {
    const fileName = this.id.split('-').pop();
    console.log(fileName); 

    try {
      const response = await fetch(`${window.location.pathname}/remove`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'id': fileName,
        }),
      });

      if (!response.ok) {
        throw new Error('Issue deleting the file!')
      }

      response.json()
        .then((r) => {
          console.log(fileName);
          removeSTL(fileName);
          const element = document.getElementById(`stl-${fileName}`);
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

function removeExtension(s) {
  return s.replace(/\.stl$/, '');
}