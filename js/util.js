let listHoraires = [];
let nbAjaxCall = 0;
let repoUrl =
  "https://jsonblob.com/api/jsonBlob/8ce6aeba-8b7a-11e9-a28e-6d449d565f92";

let gare0 = {
  code: "K",
  nomGare: "KENITRA",
  codeGare: "00250",
  codeReseau: "0093"
};
let gare1 = {
  code: "ST",
  nomGare: "SALE TABRIQUET",
  codeGare: "00238",
  codeReseau: "0093"
};
let gare2 = {
  code: "S",
  nomGare: "SALE",
  codeGare: "00237",
  codeReseau: "0093"
};
let gare3 = {
  code: "RV",
  nomGare: "RABAT VILLE",
  codeGare: "00231",
  codeReseau: "0093"
};
let gare4 = {
  code: "RA",
  nomGare: "RABAT AGDAL",
  codeGare: "00229",
  codeReseau: "0093"
};
let gare5 = {
  code: "T",
  nomGare: "TEMARA",
  codeGare: "00227",
  codeReseau: "0093"
};
let gare6 = {
  code: "SK",
  nomGare: "SKHIRAT",
  codeGare: "00223",
  codeReseau: "0093"
};
let gare7 = {
  code: "B",
  nomGare: "BOUZNIKA",
  codeGare: "00221",
  codeReseau: "0093"
};
let gare8 = {
  code: "M",
  nomGare: "MOHAMMEDIA",
  codeGare: "00217",
  codeReseau: "0093"
};
let gare9 = {
  code: "AS",
  nomGare: "AIN SEBAA",
  codeGare: "00213",
  codeReseau: "0093"
};
let gare10 = {
  code: "CP",
  nomGare: "CASA PORT",
  codeGare: "00206",
  codeReseau: "0093"
};

let listGare = [
  gare0,
  gare1,
  gare2,
  gare3,
  gare4,
  gare5,
  gare6,
  gare7,
  gare8,
  gare9,
  gare10
];
let listGareRetour = [
  gare10,
  gare9,
  gare8,
  gare7,
  gare6,
  gare5,
  gare4,
  gare3,
  gare2,
  gare1,
  gare0
];

let isRetour = false;
let gares = isRetour ? [...listGareRetour] : [...listGare];

/**
 * Faire les apples Ajax nécessaires
 */
function getData() {
  listHoraires = [];

  for (var i = 1; i < gares.length; i++) {
    ajaxCall(i - 1, gares[i - 1], gares[i]);
  }

  if (isRetour) {
    // Autres appel Ajax nécessaires liées à la liaison  MOHAMMEDIA => RABAT AGDAL
    ajaxCall(i++, gares[2], gares[3]);
    ajaxCall(i++, gares[3], gares[4]);
    ajaxCall(i++, gares[4], gares[5]);
    ajaxCall(i++, gares[2], gares[4]);
    ajaxCall(i++, gares[2], gares[5]);
    ajaxCall(i++, gares[3], gares[5]);
  } else {
    // Autres appel Ajax nécessaires liées à la liaison RABAT AGDAL => MOHAMMEDIA
    ajaxCall(i++, gares[4], gares[6]);
    ajaxCall(i++, gares[4], gares[7]);
    ajaxCall(i++, gares[4], gares[8]);
    ajaxCall(i++, gares[5], gares[7]);
    ajaxCall(i++, gares[5], gares[8]);
    ajaxCall(i++, gares[6], gares[8]);
  }
}

function ajaxCall(id, gareFrom, gareTo) {
  let today = getToday() + "+00:00";
  $.ajax({
    url:
      "https://www.oncf.ma/fr/Horaires?from[" +
      gareFrom.codeGare +
      "][" +
      gareFrom.codeReseau +
      "]=" +
      gareFrom.nomGare.replace(" ", "+") +
      "&to[" +
      gareTo.codeGare +
      "][" +
      gareTo.codeReseau +
      "]=" +
      gareTo.nomGare.replace(" ", "+") +
      "&datedep=" +
      today +
      "&dateret=&is-ar=0",
    type: "GET",
    success: function(result) {
      extractData(result, gareFrom, gareTo, id);
      console.log(
        "getDataFromTo() : " + gareFrom.nomGare + " -> " + gareTo.nomGare
      );
      if (nbAjaxCall == 15) {
        // 15 = 9 + 6 (10 gares => 9 appels Ajax) + (6 appels Ajax pour le trançon RABAT AGDAL <=> MOHAMMEDIA)
        nbAjaxCall = 0;
        var lignes = [];
        listHoraires = cleanData(listHoraires);
        if (isRetour) {
          fromHorairesToLignes("CASA+PORT", lignes);
          fromHorairesToLignes("RABAT+AGDAL", lignes);
          updateData({ fromKtoCP: lignes });
        } else {
          fromHorairesToLignes("KENITRA", lignes);
          fromHorairesToLignes("RABAT+AGDAL", lignes);
          updateData({ fromKtoCP: lignes });
        }
      }
      nbAjaxCall++;
    },
    error: function(error) {
      console.log("Error ${error}");
    }
  });
}

function extractData(ajaxResponse, gareFrom, gareTo, id) {
  console.log("extractData(ajaxResponse, " + id + ", " + isRetour + ")");
  var html = $.parseHTML(ajaxResponse);
  var dataTable = html[44].getElementsByClassName("table table_custom")[0];
  if (dataTable) {
    var cells = dataTable.querySelectorAll("td");
    var nbCells = Math.floor(cells.length / 6);
    var taille = nbCells; // nbCells < 5 ? nbCells : 5;
    for (var i = 0; i < taille; i++) {
      var typeTrain =
        cells[6 * i + 4].textContent.trim().indexOf("navette") > -1;
      if (typeTrain) {
        var heureDepart = cells[6 * i].textContent.trim();
        var heureArrivee = cells[6 * i + 1].textContent.trim();
        var nbMinutes =
          60 * parseInt(heureDepart.substring(0, 2)) +
          parseInt(heureDepart.substring(5, 3));
        if (isRetour) {
          var obj = {
            index: 100 * id + i, //String.fromCharCode(65+id)+i,
            nomGareFrom: gareFrom.nomGare.replace(" ", "+"),
            nomGareTo: gareTo.nomGare.replace(" ", "+"),
            heureDepart: heureDepart.replace("h", ":").replace("min", ""),
            heureArrivee: heureArrivee.replace("h", ":").replace("min", "")
          };
        } else {
          var obj = {
            index: 100 * id + i, //String.fromCharCode(65+id)+i,
            nomGareFrom: gareFrom.nomGare.replace(" ", "+"),
            nomGareTo: gareTo.nomGare.replace(" ", "+"),
            heureDepart: heureDepart.replace("h", ":").replace("min", ""),
            heureArrivee: heureArrivee.replace("h", ":").replace("min", "")
          };
        }
        listHoraires.push(obj);
      }
    }
  }
}

function cleanData(dirtyData) {
  // Trier les données
  dirtyData.sort(function(a, b) {
    return a.index - b.index;
  });

  // Supprimer les doublons
  return dirtyData.reduce((arr, item) => {
    let exists = !!arr.find(
      x =>
        x.heureDepart === item.heureDepart && x.nomGareFrom === item.nomGareFrom
    );
    if (!exists) {
      arr.push(item);
    }
    return arr;
  }, []);
}

/**
 * Partager les données sur Internet
 * @param data
 */
function updateData(data) {
  $.ajax({
    url: repoUrl,
    type: "PUT",
    data: JSON.stringify(data),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function(data, textStatus, jqXHR) {
      localStorage.setItem("lignes_fromKtoCP", JSON.stringify(data.fromKtoCP));
      localStorage.setItem("lastAjaxExe", getToday());
      console.log("jsonblob updated with : " + data);
    }
  });
}

/**
 * Transforme la liste des horaires des trains en une liste des lignes de trains
 * @param horaires
 * @param nomGareDepart
 * @returns {Array}
 */
function fromHorairesToLignes(nomGareDepart, lignes) {
  // Récupérer la liste des horaires des trains partant de la gare de départ 'nomGareDepart'
  var horairesDepart = $(listHoraires).filter(function(i, n) {
    return n.nomGareFrom === nomGareDepart;
  });

  // Pour chaque horaire, trouver les autres horaires du train pour les prochaines gares
  for (var k = 0; k < horairesDepart.length; k++) {
    var ligne = [];
    var gareDepart = horairesDepart[k];
    ligne.push(gareDepart);
    for (var j = 0; j < 10; j++) {
      var gareArrivee = getNextGare(gareDepart);
      if (gareArrivee != null) {
        gareDepart = gareArrivee;
        ligne.push(gareDepart);
      } else {
        break;
      }
    }

    var hrObj = {};
    for (gare of gares) {
      hrObj[gare.code + "A"] = "--:--";
      hrObj[gare.code + "D"] = "--:--";
    }

    ligne.forEach(function(horaire) {
      for (var m = 0; m < gares.length; m++) {
        var nomGare = gares[m].nomGare.replace(" ", "+");
        var code = gares[m].code;
        if (nomGare === horaire.nomGareFrom) {
          hrObj[code + "D"] = horaire.heureDepart;
        }
        if (nomGare === horaire.nomGareTo) {
          hrObj[code + "A"] = horaire.heureArrivee;
        }
      }
    });

    lignes.push(hrObj);
  }
  lignes.sort(function(a, b) {
    return parseInt(a.CPA.replace(":", "")) - parseInt(b.CPA.replace(":", ""));
  });
  console.log(JSON.stringify(lignes));

  // Nettoyer la liste des horaires
  listHoraires = $(listHoraires).filter(function(i, n) {
    return n.nomGareFrom != nomGareDepart;
  });
}

/**
 * Récupérer les données liées à la prochaine gare
 * @param gareDepart
 * @returns {*}
 */
function getNextGare(gareDepart) {
  for (var i = 1; i < 4; i++) {
    // 4 : nombre de minutes max d'attente du train au sein d'une gare.
    var heureDepartProchaineGare = moment(gareDepart.heureArrivee, "HH:mm").add(
      i,
      "minutes"
    );

    var gareArrivee = $(listHoraires).filter(function(m, n) {
      return (
        n.nomGareFrom === gareDepart.nomGareTo &&
        n.heureDepart === heureDepartProchaineGare.format("HH:mm")
      );
    });

    // Si on trouve la gare on la supprime de la liste des gares
    listHoraires = $(listHoraires).filter(function(m, n) {
      return (
        n.nomGareFrom != gareDepart.nomGareTo ||
        n.heureDepart != heureDepartProchaineGare.format("HH:mm")
      );
    });

    if (gareArrivee.length > 0) {
      return gareArrivee[0];
    }
  }
  return null;
}

function check4Update() {
  let lastAjaxExe = localStorage.getItem("lastAjaxExe");
  if (lastAjaxExe != getToday()) {
    getData();
  }
}

//check4Update();
chrome.alarms.create("check4UpdateAlarm", {
  delayInMinutes: 1,
  periodInMinutes: 1
});
chrome.alarms.onAlarm.addListener(function(alarm) {
  console.log("Check For Update !", alarm);
  check4Update();
});

function getToday() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1;
  var yyyy = today.getFullYear();
  if (dd < 10) {
    dd = "0" + dd;
  }
  if (mm < 10) {
    mm = "0" + mm;
  }
  return dd + "/" + mm + "/" + yyyy;
}

