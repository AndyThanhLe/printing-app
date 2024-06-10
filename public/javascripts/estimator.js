import { loadSTL, removeSTL, getActive } from './three-preview.js';


// Declare variables and constants
let stls;
let stl, inp, del;
let modelConfigs;


/**
 * Event Listeners
 */

window.onload = () => {
  if (sessionStorage.getItem('modelConfigs')) {
    modelConfigs = JSON.parse(sessionStorage.getItem('modelConfigs'));

    for (const key in modelConfigs) {
      createSTLButton(key, modelConfigs[key].name);
    }
  }
  else {
    modelConfigs = {};
  }
};




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
  // no file is selected
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

    //  { <fileName> , <modelName> }
    response.json()
      .then((r) => {
        createSTLButton(r.fileName, removeExtension(r.modelName));

        // add to model configurations
        modelConfigs[r.fileName] = {
          'name': r.modelName,
          'material': '',
          'colour': '',
          'printer': undefined,
          'infill': 15,
          'quantity': 1,
        };

        updateActiveSTL(r.fileName);
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











function updateActiveSTL(fileName) {
  // save the current configuration
  let prev = getActive();
  if (prev) {
    saveConfiguration(getActive());
  }

  const active = document.querySelectorAll('.import-selected');

  for (let i = 0; i < active.length; i++) {
    active[i].classList.remove('import-selected');
  }

  const children = document.getElementById(`stl-${(fileName)}`).childNodes;
  for (let i = 0; i < children.length; i++) {
    children[i].classList.add('import-selected');
  }

  loadSTL(fileName);
  loadConfiguration(fileName);
  saveConfiguration(fileName);
}


function saveConfiguration(fileName) {
  // update the saved configuration details
  modelConfigs[fileName] = {
    ...modelConfigs[fileName],
    'material': document.getElementById('material').value,
    'colour': document.getElementById('colour').value,
    'printer': document.querySelector('input[name="printer"]:checked')?.value,
    'infill': document.getElementById('infill').value,
    'quantity': document.getElementById('quantity').value,
  };

  sessionStorage.setItem('modelConfigs', JSON.stringify(modelConfigs));
  console.log(sessionStorage);
}


function loadConfiguration(fileName) {
  const { material, colour, printer, infill, quantity } = modelConfigs[fileName];
  
  document.getElementById('material').value = material;
  document.getElementById('colour').value = colour;

  document.getElementsByName('printer').forEach((r) => {
    if (r.value == printer) {
      r.checked = true;
    }
    else {
      r.checked = false;
    }
  });

  document.getElementById('infill').value = infill;
  document.getElementById('quantity').value = quantity;
}

function removeConfiguration(fileName) {
  delete modelConfigs[fileName];
  sessionStorage.setItem('modelConfigs', JSON.stringify(modelConfigs));
}




function createSTLButton(fileName, modelName) {
  stls = document.getElementById('stls');

  stl = document.createElement('div');
  stl.className = 'stl';
  stl.id = `stl-${fileName}`;

  inp = document.createElement('input');
  inp.id = `stl-data-${fileName}`;
  inp.type = 'button';
  inp.value = modelName;
  inp.addEventListener('click', async () => {
    updateActiveSTL(fileName);
  });
  stl.appendChild(inp);

  del = document.createElement('input');
  del.id = `stl-del-${fileName}`;
  del.type = 'button';
  del.value = `Delete`;
  del.addEventListener('click', async function () {
    const fileName = this.id.split('-').pop();

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
          removeSTL(fileName);
          const element = document.getElementById(`stl-${fileName}`);
          element.remove();
          removeConfiguration(fileName);
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
