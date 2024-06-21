import { loadSTL, removeSTL, getActive, changeColour } from './three-preview.js';

/**
 * Interfaces
 */
interface Configurations {
  [fileName: string]: {
    name: string;
    material: string;
    colour: string;
    infill: number;
    quantity: number;
  }
}

interface MaterialMappings {
  [material: string]: {
    (colourName: string) : Promise<string>,
    (colourHex: string) : Promise<string>,
  }
}


/**
 * Constants and variables
 */
let modelConfigs: Configurations;
let cart: Configurations;

let mappings: MaterialMappings;

let stls: HTMLDivElement;
let stl: HTMLDivElement;
let inp: HTMLInputElement;
let del: HTMLInputElement;


/**
 * Event handlers
 */
// Initial loading of document
window.onload = async () => {
  // Check is the session matches
  let sessionId = await getSessionId();
  if (sessionStorage.getItem('sessionId') && sessionStorage.getItem('sessionId') !== sessionId) {
    // TODO: redirect to error page
    console.error(new Error('The session id does not match.'));
  }
  else {
    sessionStorage.setItem('sessionId', sessionId);
  }

  // Configuration & cart setup
  if (sessionStorage.getItem('modelConfigs')) {
    modelConfigs = JSON.parse(sessionStorage.getItem('modelConfigs'));
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

  // Load models
  for (const key in modelConfigs) {
    createSTLButton(key, modelConfigs[key].name);
  }

  // Populate form
  mappings = await retrieveOptions();
  loadMaterials();

  updateUI(null);
};

window.onbeforeunload = () => {
  let active = getActive();
  if (active) {
    saveConfiguration(active);
  }
};

// Deal with file import
document.getElementById('stl-import')?.addEventListener('click', () => {
  document.getElementById('file-submission').click();
});
document.getElementById('file-submission')?.addEventListener('change', upload);

// Deal with submission
document.getElementById('config-submit')?.addEventListener('click', async function () {
  const fileName = getActive();

  if (!fileName) {
    // TODO: prompt indicating empty submission
    return;
  }

  // ensure fields are selected
  if ((document.getElementById('material') as HTMLSelectElement).value === '' || (document.getElementById('colour') as HTMLSelectElement).value === '') {
    // TODO: 
    return;
  }

  saveConfiguration(fileName);

  // add or overwrite current configuration in the cart
  cart[fileName] = { ...modelConfigs[fileName] };
  sessionStorage.setItem('cart', JSON.stringify(cart));
  updateCart();
});

// Deal with material change
document.getElementById('material')?.addEventListener('change', () => {
  loadColours();
  changeColour(getHexColour());
});

// Deal with colour change
document.getElementById('colour')?.addEventListener('change', () => {
  changeColour(getHexColour());
});


function updateUI(fileName: string = null) {
  if (fileName) {
    loadConfiguration(fileName);
  }
  else {
    clearMaterials();
    clearColours();
    (document.getElementById('material') as HTMLSelectElement).value = '';
    (document.getElementById('colour') as HTMLSelectElement).value = '';
    (document.getElementById('infill') as HTMLInputElement).value = '15';
    (document.getElementById('quantity') as HTMLInputElement).value = '1';

  }

  updateCart();
}


async function getSessionId(): Promise<string> {
  return await fetch(`${window.location.pathname}/get-session-id`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Issue retrieving the session id.');
      }

      return response.json();
    })
    .then((data) => {
      return data.sessionId;
    })
    .catch((e) => {
      console.error(e);
    });
}


function getHexColour(): number {
  let material = (document.getElementById('material') as HTMLSelectElement).value;
  let colour = (document.getElementById('colour') as HTMLSelectElement).value;

  if (!material || !colour) {
    return null;
  }

  let colours = mappings[material];
  for (let i = 0; i < colours.length; i++) {
    if (colours[i].colourName === colour) {
      return parseInt(colours[i].colourHex, 16);
    }
  }
}


function updateCart() {
  let numItems = 0;
  
  for (const key in cart) {
    numItems += +cart[key].quantity;
  }

  document.getElementById('cart-count').innerText = numItems.toString();
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
      'infill': 15,
      'quantity': 1,
    };
    sessionStorage.setItem('modelConfigs', JSON.stringify(modelConfigs));

    updateActiveSTL(data.fileName);
  })
  .catch((e) => {
    console.error(e);
  });

  fileInput.value = '';
}


async function updateActiveSTL(fileName: string) {
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

  updateUI(fileName);

  await loadSTL(fileName, getHexColour());
}


function saveConfiguration(fileName: string) {
  const materialInput = document.getElementById('material') as HTMLSelectElement;
  const colourInput = document.getElementById('colour') as HTMLSelectElement;
  const infillInput = document.getElementById('infill') as HTMLInputElement;
  const quantityInput = document.getElementById('quantity') as HTMLInputElement;

  modelConfigs[fileName] = {
    ...modelConfigs[fileName],
    'material': materialInput ? materialInput.value : '',
    'colour': colourInput ? colourInput.value : '',
    'infill': infillInput ? +infillInput.value : 15,
    'quantity': quantityInput ? +quantityInput.value : 1,
  };

  sessionStorage.setItem('modelConfigs', JSON.stringify(modelConfigs));
}


function loadConfiguration(fileName: string) {
  const { material, colour, infill, quantity } = modelConfigs[fileName];

  loadMaterials();
  (document.getElementById('material') as HTMLSelectElement).value = material;

  loadColours();
  (document.getElementById('colour') as HTMLSelectElement).value = colour;

  (document.getElementById('infill') as HTMLInputElement).value = infill.toString();
  (document.getElementById('quantity') as HTMLInputElement).value = quantity.toString();
}


function removeConfiguration(fileName: string) {
  delete modelConfigs[fileName];
  delete cart[fileName];
  sessionStorage.setItem('modelConfigs', JSON.stringify(modelConfigs));
  sessionStorage.setItem('cart', JSON.stringify(cart));

  updateUI();
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

    await fetch(`${window.location.pathname}/remove/`, {
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
    }).then((_) => {
      removeSTL(fileName);
      
      document.getElementById(`stl-${fileName}`).remove();
      removeConfiguration(fileName);
    }).catch((e) => {
      console.error(e);
    });
  });

  stl.appendChild(del);

  stls.append(stl);
}


function removeExtension(fileName: string) {
  return fileName.replace(/\.stl$/, '');
}


async function retrieveOptions(): Promise<MaterialMappings> {
  let mapping: MaterialMappings = {};
  
  return await fetch(`${window.location.pathname}/get-config-options`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Issue retrieving material from server.');
      }

      return response.json();
    })
    .then((data) => {
      for (let key in data) {
        mapping[key] = data[key];
      }

      return mapping;
    })
    .catch((e) => {
      console.error(e);
      return {};
    });
}


function clearMaterials() {
  const materialElement = document.getElementById('material');

  Array.from(materialElement.childNodes).forEach((child) => {
    if (child instanceof HTMLOptionElement && child.value !== '') {
      child.remove();
    }
  });
}


function loadMaterials() {
  const materialElement = document.getElementById('material');

  clearMaterials();

  for (let key in mappings) {
    let optionElement = document.createElement('option');
    optionElement.value = key;
    optionElement.innerHTML = key;
    materialElement.appendChild(optionElement);
  }
}


function clearColours() {
  const colourElement = document.getElementById('colour');
  
  Array.from(colourElement.childNodes).forEach((child) => {
    if (child instanceof HTMLOptionElement && child.value !== '') {
      child.remove();
    }
  });
}


function loadColours() {
  const colourElement = document.getElementById('colour');
  const material = (document.getElementById('material') as HTMLSelectElement).value;

  clearColours();

  for (let index in mappings[material]) {
    let optionElement = document.createElement('option');
    optionElement.value = mappings[material][index].colourName;
    optionElement.innerHTML = mappings[material][index].colourName;
    colourElement.appendChild(optionElement);
  }
}
