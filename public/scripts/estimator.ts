import { loadSTL, removeSTL, getActive } from './three-preview.js';


/**
 * Interfaces
 */
interface Configurations {
  [fileName: string]: Configuration;
}

interface Configuration {
  name: string;
  material: string;
  colour: string;
  printer: string;
  infill: number;
  quantity: number;
}


/**
 * Constants and variables
 */
let modelConfigs: Configurations;
let cart: Configurations;

let stls: HTMLDivElement;
let stl: HTMLDivElement;
let inp: HTMLInputElement;
let del: HTMLInputElement;


/**
 * Event Listeners
 */
// Initial loading of document
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

  if (sessionStorage.getItem('cart')) {
    cart = JSON.parse(sessionStorage.getItem('cart'));
  }
  else {
    cart = {};
  }
};

// Deal with file import
document.getElementById('stl-import').addEventListener('click', () => {
  document.getElementById('file-submission').click();
});
document.getElementById('file-submission').addEventListener('change', upload);

// Deal with submission
document.getElementById('config-submit').addEventListener('click', async function () {
  const fileName = getActive();

  if (!fileName) {
    // TODO: prompt indicating empty submission
    return;
  }

  saveConfiguration(fileName);

  cart[fileName] = { ...modelConfigs[fileName] };

  updateCart();
});


function updateCart() {
  let numItems = 0;
  
  for (const key in cart) {
    numItems += +cart[key].quantity;
  }

  console.log(numItems);
}


async function upload() {
  const fileInput = document.getElementById('file-submission') as HTMLInputElement;

  if (fileInput.files.length == 0) {
    return;
  }

  const formData = new FormData();
  formData.append('stl-file', fileInput.files[0]);

  await fetch(`${window.location.pathname}/upload/`, {
    method: 'PUT',
    body: formData,
  })
  .then((response) => {
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  })
  .then((data) => {
    createSTLButton(data.fileName, removeExtension(data.modelName));

    // add config
    modelConfigs[data.fileName] = {
      'name': data.modelName,
      'material': '',
      'colour': '',
      'printer': undefined,
      'infill': 15,
      'quantity': 1,
    };
    sessionStorage.setItem('modelConfigs', JSON.stringify(modelConfigs));
    updateActiveSTL(data.fileName);
  })
  .catch((error) => {
    console.error(error);
  });

  fileInput.value = '';
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
  children.forEach((child: HTMLElement) => {
    child.classList.add('import-selected');
  });

  loadSTL(fileName);
  loadConfiguration(fileName);
}


function saveConfiguration(fileName: string) {
  const materialInput = document.getElementById('material') as HTMLInputElement;
  const colourInput = document.getElementById('colour') as HTMLInputElement;
  const printerInput = document.querySelector('input[name="printer"]:checked') as HTMLInputElement;
  const infillInput = document.getElementById('infill') as HTMLInputElement;
  const quantityInput = document.getElementById('quantity') as HTMLInputElement;

  modelConfigs[fileName] = {
    ...modelConfigs[fileName],
    'material': materialInput ? materialInput.value : '',
    'colour': colourInput ? colourInput.value : '',
    'printer': printerInput ? printerInput.value : '',
    'infill': infillInput ? +infillInput.value : 15,
    'quantity': quantityInput ? +quantityInput.value : 1,
  };

  sessionStorage.setItem('modelConfigs', JSON.stringify(modelConfigs));
}


function loadConfiguration(fileName: string) {
  const { material, colour, printer, infill, quantity } = modelConfigs[fileName];
  
  (document.getElementById('material') as HTMLInputElement).value = material;
  (document.getElementById('colour') as HTMLInputElement).value = colour;

  const printerOptions = document.getElementsByName('printer');
  printerOptions.forEach((option: HTMLInputElement) => {
    if (option.value == printer) {
      option.checked = true;
    }
    else {
      option.checked = false;
    }
  });

  (document.getElementById('infill') as HTMLInputElement).value = infill.toString();
  (document.getElementById('quantity') as HTMLInputElement).value = quantity.toString();
}


function removeConfiguration(fileName: string) {
  delete modelConfigs[fileName];
  sessionStorage.setItem('modelConfigs', JSON.stringify(modelConfigs));
}


function createSTLButton(fileName: string, modelName: string) {
  stls = document.getElementById('stls') as HTMLDivElement;

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

    await fetch(`${window.location.pathname}remove/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'id': fileName,
      }),
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Issue sending delete request to server!');
      }

      return response.json();
    }).then((data) => {
      removeSTL(fileName);
      
      document.getElementById(`stl-${fileName}`).remove();
      removeConfiguration(fileName);
    }).catch((error) => {
      console.error(error);
    });
  });

  stl.appendChild(del);

  stls.append(stl);
}


function removeExtension(s) {
  return s.replace(/\.stl$/, '');
}
