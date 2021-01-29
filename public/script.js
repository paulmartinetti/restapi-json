/**
 * 
 * global vars
 */
// json entier (données = data)
let data;
// au début on fabrique selector, ce vars rassure qu'il n'ai fabriqué qu'une fois et après, first = false
let first = true;

// indice actuel, 0 corréspond à D1_Eco 50, 1 corréspond à D2_Janisol
let projAct;
let projLen = 0;
let projNom = "projet";

// les noms des params de chaque json
// paramA[0] = "delayStart"
let paramA = [];
// len = 9, du 0 au 8 chaque boucle de var "i"
let len;
// du gui, on va remplir ça une fois avec step, min, max
let sliderA = [];
let url;

// états des boutons
let saveDes = false;
let supProj = false;

/**
 * ALWAYS update gui from data
 * 
 */

function guiUpdate() {

  // m-à-j gui des données
  for (let i = 0; i < len; i++) {
    // nom, comme "balayage"
    let param = paramA[i];
    // sa valeur il faut forcer Number() sinon il est traité comme texte (String)
    let val = Number(data[projAct][param]);

    // il faut chercher de nouveau chaque slider
    let s = document.getElementById(param);
    // et sa valeur montrée
    let sv = document.getElementById(param + "Val");

    // les boutons plus et moins, puisque on change leurs états en fonction de min max
    let bp = document.getElementById(param + "Plus");
    let bm = document.getElementById(param + "Moins");


    // update gui
    sv.innerHTML = s.value = val;

    // l'expression après = on simule le prochain appuis sur + ou - , et s'il sera trop grand ou petit, on désactive le bouton
    bp.disabled = val + Number(sliderA[i].step) > Number(sliderA[i].max);
    bm.disabled = val - Number(sliderA[i].step) < Number(sliderA[i].min);

    // boutons
    let sav = document.getElementById("saveRegs");
    sav.disabled = saveDes;

    let sup = document.getElementById("suppProj");
    sup.innerHTML = "Supprimer ce projet";
    sup.disabled = supProj;
  }
}


/**
 * populate select option w json
 * https://www.codebyamir.com/blog/populate-a-select-dropdown-list-with-json
 */
function setupGui() {
  // fabrique une fois seulement
  if (!first) return;

  let option;
  projLen = 0;
  // il n'y a qu'un seul selector
  let dropdown = document.getElementById('designation-dropdown');
  // initialiser
  removeAllChildNodes(dropdown);
  dropdown.length = 0;
  dropdown.selectedIndex = 0;
  // remplir selector
  for (const i in data) {
    option = document.createElement('option');
    option.text = data[i].nom;
    option.value = projNom + data[i].id;
    dropdown.add(option);
    projLen++;
  }

  // fill param key array, il y aura tjs un projet
  projAct = projMin();
  // capter les noms de parametres dans un tableau
  paramA = Object.keys(data[projAct]);
  // supprimer "id" et "name"
  paramA.splice(0, 2);
  // capter pour boucler maj gui
  len = paramA.length;

  // remplir global var pour gérer le gui
  for (let i = 0; i < len; i++) {
    let s = document.getElementById(paramA[i]);
    let obj = {
      step: s.step,
      min: s.min,
      max: s.max
    };
    // step, min, max de chaque slider
    sliderA.push(obj);
  }

  // une fois seulement (on appel le json à chaque appuis sur selector)
  first = false;
}

/**
 * selector onChange()
 * https://www.w3schools.com/jsref/event_onchange.asp
 * 
 * Pulldown = selector
 */
function selectOnChange(curSelVal) {
  // capter l'projAct = l'indice actuel du json (un groupe de valeurs)
  for (const i in data) {
    let t = projNom + data[i].id;
    if (t == curSelVal) {
      // trouvé !
      projAct = t;
      break;
    }
  }
  // rechercher le json de nouveau à chaque appuis du selector
  url = 'http://localhost:3001/projets';
  request.open('GET', url, true);
  request.send();
}

/**
* slider onChange() -- si tu appuis sur un slider, on m-à-j les données
* https://stackoverflow.com/questions/13896685/html5-slider-with-onchange-function
*/
function getSlider(id, newVal) {
  for (let i = 0; i < len; i++) {
    // recherche dans tous les params (balayage, speed, etc)
    let param = paramA[i];
    // param touché
    if (id == param) {
      // nouvelle valeur du slider, ça vient du gui
      data[projAct][param] = Number(newVal);
      break;
    }
  }
  // update gui
  guiUpdate();
}


/**
* boutons plus et moins
* https://stackoverflow.com/questions/34156282/how-do-i-save-json-to-local-text-file
*/
function onPlus(monId) {
  for (let i = 0; i < len; i++) {
    // scan params
    let param = paramA[i];
    // identifier le bouton touché
    if (monId.includes(param)) {
      let n = Number(data[projAct][param]);
      // ajoute step à la valeur actuelle
      n += Number(sliderA[i].step);
      // m-à-j les données
      data[projAct][param] = n.toFixed(2);
      break;
    }
  }
  // update gui -- toujours les données conduisent le gui !!!
  guiUpdate();
}
function onMoins(monId) {
  for (let i = 0; i < len; i++) {
    // scan params
    let param = paramA[i];
    // update param of touched slider
    if (monId.includes(param)) {
      let n = Number(data[projAct][param]);
      n -= Number(sliderA[i].step);
      data[projAct][param] = n.toFixed(2);
      break;
    }
  }
  // update gui
  guiUpdate();
}

// sauvegarder projet
function saveReglages() {
  // désactiver bouton
  let sav = document.getElementById("saveRegs");
  sav.disabled = true;
  saveDes = true;
  majReglages('PUT');
}


// bouton supprimer projet
function supprimeProjet() {
  let b = document.getElementById("suppProj");
  // confirmer
  if (!supProj) {
    b.innerHTML = "Supprimer, oui ?";
    supProj = true;
    return;
  } else {
    // maj var, pour gui
    b.disabled = supProj;
    majReglages('DELETE');
    first = true;
  }
}

// en ajoutant et supprimant un projet
function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}
function projMin(){
  let t;
  for (const i in data) {
    t = (t<data[i].id) ? t : data[i].id;
  }
  return "projet"+t;
}
function projMax(){
  let t;
  for (const i in data) {
    t = (t>data[i].id) ? t : data[i].id;
  }
  return "projet"+t;
}
var randomProperty = function (obj) {
  var keys = Object.keys(obj);
  return obj[keys[keys.length * Math.random() << 0]];
};
/**
 * 
 * m-a-j json dans le server
* https://robkendal.co.uk/blog/how-to-build-a-restful-node-js-api-server-using-json-files
* 
 * 
 * https://gist.github.com/EtienneR/2f3ab345df502bd3d13e
 * 
*/

function majReglages(crud) {

  const xhr = new XMLHttpRequest();
  url = 'http://localhost:3001/projets/' + projNom + data[projAct]["id"];
  xhr.open(crud, url, true);
  xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
  let pkg = JSON.stringify(data[projAct]);
  xhr.onload = function () {
    if (xhr.status === 200) {
      // c'est bon

      // rechercher le json de nouveau à chaque appuis du selector
      url = 'http://localhost:3001/projets';
      request.open('GET', url, true);
      request.send();

      // activer btn
      switch (crud) {
        case "PUT":
          saveDes = false;
        case "DELETE":
          supProj = false;
      }

    } else {
      // Reached the server, but it returned an error
    }
    // toujours
    guiUpdate();
  }
  xhr.onerror = function () {
    console.error('An error occurred fetching the JSON from ' + url);
  };
  xhr.send(pkg);
}


// 1. route GET, rechercher les données
const request = new XMLHttpRequest();
url = 'http://localhost:3001/projets';
request.open('GET', url, true);

request.onload = function () {
  if (request.status === 200) {
    // c'est bon
    data = JSON.parse(request.responseText);
    // remplir selector
    setupGui();
  } else {
    // Reached the server, but it returned an error
  }
  // initial
  guiUpdate();
}
request.onerror = function () {
  console.error('An error occurred fetching the JSON from ' + url);
};

// c'est parti -- premier appel à une fonction
request.send();