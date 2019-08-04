const LIGNE_URL = "https://navetty.herokuapp.com/lignes/dir/";
const VOYAGE_URL = "https://navetty.herokuapp.com/voyages/ligne/";
const GARE_URL = "https://navetty.herokuapp.com/gares";
const CORS_URL = "https://cors-anywhere.herokuapp.com/";

const DIRECTION_1 = "k_cp";
const DIRECTION_2 = "cp_k";
/*
function doCORSRequest(options, printResult) {
  var x = new XMLHttpRequest();
  x.open(options.method, CORS_URL + options.url);
  x.onload = x.onerror = function() {
    printResult(
      options.method + ' ' + options.url + '\n' +
      x.status + ' ' + x.statusText + '\n\n' +
      (x.responseText || '')
    );
  };
  if (/^POST/i.test(options.method)) {
    x.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  }
  x.send();
}

doCORSRequest({
  method: 'GET',
  url: 'https://navetty.herokuapp.com/lignes/dir/K_CP/2',
}, function printResult(result) {
  console.log(result);
});
*/
/**
 * Lecture des fichiers datas
 */
function readData() {
	
	setLocalStorageData(DIRECTION_1);
	setLocalStorageData(DIRECTION_2);
  
	fetch(CORS_URL + GARE_URL)
	.then(reponse => reponse.json(""))
	.then(data => {
		console.log(data);
		localStorage.setItem("gares", JSON.stringify(data));
	}).catch(e => console.log("Impossible d'accéder à la liste des gares !!"));

/*
  var proxyUrl = 'https://cors-anywhere.herokuapp.com/',
  targetUrl = 'https://navetty.herokuapp.com/gares'
  fetch(proxyUrl + targetUrl)
  .then(reponse => reponse.json(""))
  .then(data => {
    console.log(data);
    localStorage.setItem("gares", JSON.stringify(data));
  })
  .catch(e => console.log("Cannot access to https://navetty.herokuapp.com/gares !!"));

  var lignesUrl = 'https://navetty.herokuapp.com/lignes/dir/K_CP';
  fetch('https://cors-anywhere.herokuapp.com/' + lignesUrl)
  .then(reponse => reponse.json(""))
  .then(lignes => {
    var nbLignes = lignes.
    lignes.forEach(ligne => {
      var UrlVoyage = 'https://navetty.herokuapp.com/voyages/ligne/'+ligne.numLigne;
      console.log(ligne);
      fetch('https://cors-anywhere.herokuapp.com/' + UrlVoyage)
      .then(reponse => reponse.json(""))
      .then(voyages => {
        voyages.forEach(ligne => {
          console.log(ligne);
        })
      })
      .catch(e => console.log("Cannot access to https://navetty.herokuapp.com/lignes/dir/K_CP !!"));
    })
  })
  .catch(e => console.log("Cannot access to https://navetty.herokuapp.com/lignes/dir/K_CP !!"));


  localStorage.setItem("lignes_fromCPtoK", JSON.stringify(cp_to_k));
  localStorage.setItem("lignes_fromKtoCP", JSON.stringify(k_to_cp));
*/
}

function compareById(a, b) {
  return a.id < b.id ? -1 : 1;
}

async function makeBatchCalls(arrayIds, length, direction) {
  var index = 31;
  console.log("[START] makeBatchCalls(" + direction + ")");  
  //convert them to two dimensionl arrays of given length [[1,2,3,4,5], [6,7,8,9,10]]
  var tab = arrayIds.reduce(
    (rows, key, index) => (index % length == 0 ? rows.push([key]) : rows[rows.length - 1].push(key)) && rows, []
  );
  var Batchresults = [];
  var mapTmp = new Map();
  for (numLignes of tab) {
    Batchresults.push(
      await Promise.all(
        numLignes.map(numLigne => {
          fetch(CORS_URL + VOYAGE_URL + numLigne)
            .then(reponse => reponse.json(""))
            .then(data => {
              var lsMap = new Map();
              var result = new Map();
              data.sort(compareById);
              mapTmp.set(data[0].numLigne.padStart(2, "0"), data);
              index--;
              if (index == 0) {
                result = new Map([...mapTmp.entries()].sort());
                var lsJSON = {};
                result.forEach((value, key, map) => {
                  var numLigne = value[0].numLigne;
                  var horaire = [];
                  for (var l of value) {
                    horaire.push(l.hrDepart != null ? l.hrDepart.substring(0,5) : null);
                    horaire.push(l.hrArrivee != null ? l.hrArrivee.substring(0,5) : null);
                  }
                  lsJSON[numLigne] = horaire;
                  lsMap.set(numLigne, horaire);
                  localStorage.setItem("lignes_fromTo_" + direction, JSON.stringify(lsJSON));
                });
                console.log("----------------- lsJSON [" + direction + "] ------------------ ");
                console.log(lsJSON);
                console.log("[END] makeBatchCalls(" + direction + ")");
              }
            }).catch(e => console.log("Cannot access to " + VOYAGE_URL + numLigne + " !! " + e));
        })
      )
    );
  }
  return Promise.all(Batchresults); //wait for all batch calls to finish
}

function setLocalStorageData(direction) {
  console.log("[START] setLocalStorageData(" + direction + ")");
  fetch(CORS_URL + LIGNE_URL + direction)
    .then(reponse => reponse.json(""))
    .then(data => {
      localStorage.setItem("lignes_" + direction, JSON.stringify(data));
      var listNumLignes = [];
      data.map(l => {
        listNumLignes.push(l.numLigne);
      });
      makeBatchCalls(listNumLignes, 31, direction);
    }).catch(e => console.log("Cannot access to " + LIGNE_URL + direction + " !!"));
}

function check4Update() {
  console.log('['+moment().format('HH:mm:ss SSS') + '] check4Update() started !!');
  let lastAjaxExe = localStorage.getItem("lastAjaxExe");
  if (lastAjaxExe != getToday()) {
    readData();
  }
}

function getToday() {
  return moment().format("DD/MM/YYYY");
}

check4Update();
setIntervalID = setInterval(function() {
  check4Update();
}, 3600000);
