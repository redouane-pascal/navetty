let listGare = JSON.parse(d_listGares);
let listGareRetour = listGare.slice(0).reverse();

let isRetour = false;
let gares = isRetour ? [...listGareRetour] : [...listGare];
let screenWidth = screen.width;
let lignes = d_lignes_fromTo_k_cp;


let nbLignes = 14;
let setIntervalID = 0;

let start;
let end; // Nombre total des trains
function setStartAndEnd() {
    start = 0;
    end = 0; // Nombre total des trains
    // Pour déterminer les trains à afficher
    for (var i = start; i < tabHoraire.length; i++) {
        var lastHour = tabHoraire[i][tabHoraire[i].length - 1];
        if (lastHour != null && moment().isBefore(moment(lastHour, "HH:mm"))) {
            start = i > 1 ? i - 1 : i; // 1 : nombre de trains déjà arrivés au Terminus.
            end = start + nbLignes; //  : nombre de trains supplémentaires à afficher.
            end = end > 29 ? 29 : end;
            break;
        }
    }
}

let tabNumLignes = [];
let tabHoraire = [];

function jsonToTab(lignes) {
    tabNumLignes = [];
    tabHoraire = [];
    for (let [numLigne, horaire] of Object.entries(JSON.parse(lignes))) {
        tabNumLignes.push(numLigne);
        tabHoraire.push(horaire);
    }
}

/**
 * Réinitialiser l'affichage
 * @param {*} lignesData 
 */
function clearUI() {

    for (var k = 0; k < nbLignes; k++) {
        //$("#ligne"+k).remove();
        $("#train" + k).css("display", "none");
        $("#numTrain_" + k).css("display", "none");
        for (var i = 1; i <= gares.length; i++) {
            var index = fromIndexToChar(k) + "" + i; // i : la gare, k : la ligne
            $("#h" + index).val("--:--");
            $("#h" + index).removeAttr('style');
            $("#cf" + index).css("display", "block");
            $("#cf" + index).removeAttr('style');

        }
    }
}

/**
 * Générer la grille d'affichage des horaires des trains
 */
function initUI() {

    console.log(moment().format("HH:mm:ss SSS ") + "[INFO] initUI ");

    document.querySelector("table").remove();

    $('#loader').after('<table id="grille" class="table table-borderless" style="margin-bottom: 0px; position: relative; z-index: 3;"><thead></thead><tbody></tbody></table>');

    let tab = document.querySelector("table");

    for (var k = 0; k < nbLignes; k++) {
        $("#numTrain_" + k).remove();
        $("#train" + k).remove();
    }

    // L'affichage des noms des gares
    var myHeader = tab.querySelector("thead").insertRow();
    for (var i = 1; i <= gares.length; i++) {
        var myTh = document.createElement("th");
        myTh.setAttribute("id", "gare_" + i);
        var thStyle = "vertical-align: middle; width: 9.1%; padding: 7px !important; font-size: 10px; border-width: 1px;border-bottom: 1px !important;border-style: dashed; background-repeat: no-repeat; background-position-x: center; ";
        var numImg = isRetour ? gares.length - i + 1 : i;
        //thStyle = thStyle + " background-image: url('/img/g" + numImg + ".png'); ";
        thStyle = i % 2 == 0 ? thStyle + "background-color: #ed7d31;" : thStyle + "background-color: white;"
        myTh.setAttribute("style", thStyle);
        myTh.innerHTML = gares[i - 1].name.toUpperCase();
        myHeader.appendChild(myTh);
    }

    let hourWidth = Math.round(screen.width * 5 / 100);
    let spaceWidth = Math.round((screen.width - 11 * hourWidth) / 11);
    let spaceAtLeft = Math.round(spaceWidth / 2) - 1;

    console.log("hourWidth = " + hourWidth);
    console.log("spaceWidth = " + spaceWidth);
    console.log("spaceAtLeft = " + spaceAtLeft);

    for (var j = 0; j <= (end - start); j++) {
        var myRow = tab.querySelector("tbody").insertRow();
        // var topLigne = 40 + 30 * j;

        // L'affichage des trains en mouvement
        var myDivTrain = document.createElement("div");
        myDivTrain.setAttribute("id", "train" + j);
        let myDivTrainStyle = "display: none; left: 80px; background-image: url(img/train.gif); width: 9.1%; position: absolute; z-index: 2; height: 19px;";

        var thHeight = parseInt($("#gare_1").css("height").replace("px", ""), 10) + 1;
        var tdHeight = 31;
        var trainHeight = 20;
        var bandUpHeight = parseInt($("#band_up").css("height").replace("px", ""), 10) + 1;

        let myDivTrainStyleTop = thHeight + tdHeight - trainHeight + tdHeight * j + bandUpHeight;
        myDivTrainStyle = myDivTrainStyle + " top:" + myDivTrainStyleTop + "px; ";
        myDivTrain.setAttribute("style", myDivTrainStyle);
        //body.appendChild(myDivTrain);
        tab.parentNode.insertBefore(myDivTrain, tab.previousSibling);

        // L'affichage des numéro de lignes
        var myDivNumLigne = document.createElement("div");
        myDivNumLigne.setAttribute("id", "numTrain_" + j);
        myDivNumLigne.setAttribute("class", "numTrain");
        myDivNumLigne.setAttribute("title", "N° du train");
        var myDivNumLigneTop = j * tdHeight + thHeight + bandUpHeight;
        let myDivNumLigneStyle = "top:" + myDivNumLigneTop + "px; ";
        myDivNumLigne.setAttribute("style", myDivNumLigneStyle);
        myDivNumLigne.innerHTML = tabNumLignes[j + start] ? tabNumLignes[j + start] : ".";
        tab.parentNode.insertBefore(myDivNumLigne, tab.previousSibling);

        // L'affichage des horaires des trains
        for (var i = 1; i <= gares.length; i++) {
            var index = fromIndexToChar(j) + "" + i; // i : la gare, j : la ligne
            //var leftGare = 31 + 99 * (i - 1);

            var leftGare = spaceAtLeft + (hourWidth + spaceWidth) * (i - 1);

            var myTd = myRow.insertCell();
            var tdStyle = "border-top: 0px !important; padding: 0px; padding-top: 8px; "; //; width:114px;";
            // if (i == gares.length) tdStyle += " padding: 16px;";
            myTd.setAttribute("style", tdStyle);

            var myDiv = document.createElement("div");
            myDiv.setAttribute("id", "cf" + index);
            myDiv.setAttribute("class", "circle_front");
            // var divStyle = "left: " + leftGare + "px; ";
            // divStyle = divStyle + "top: " + topLigne + "px; ";
            // // divStyle += "background-color: gray; ";
            // myDiv.setAttribute("style", divStyle);

            var mySpan = document.createElement("span");
            mySpan.setAttribute("id", "h" + index);
            mySpan.setAttribute("class", "nomGare horaire");
            //mySpan.setAttribute("style", "color: lightgrey;");
            mySpan.textContent = "--:--";

            myDiv.appendChild(mySpan);
            myTd.appendChild(myDiv);
        }
    }
}

/**
 * Afficher une ligne de train
 * @param lignes
 */
function afficherLignes() {

    console.log(moment().format("HH:mm:ss SSS") + "[INFO] afficherLignes ");
    var msg = "";
    var l = tabHoraire.length;

    for (var i = start; i <= end; i++) {
        var tabHours = tabHoraire[i];
        var tabHoursToDisplay = [];
        var isTrainHere = false;

        tabHours.unshift(tabHours[0]);
        tabHours.push(tabHours[tabHours.length - 1]);

        // Afficher les numéros de ligne
        $("#numTrain_" + (i - start)).css("display", "block");

        for (var j = 0; j < gares.length; j++) {
            var numGare = j + 1;
            var currentGare = gares[j];
            var code = currentGare.code;

            // Si l'heureArrivee ou heureDepart est undefined, elle sera égale à l'autre valeur :)
            var heureDepart = tabHours[2 * j + 1]; // tabHours[code + "D"] == undefined ? tabHours[code + "A"] : tabHours[code + "D"];
            var heureArrivee = tabHours[2 * j]; // tabHours[code + "A"] == undefined ? tabHours[code + "D"] : tabHours[code + "A"];
            var heureAffichee = null; //"--:--";

            if ((heureDepart == null) && (heureArrivee != null)) {
                heureDepart = heureArrivee;
            }
            if ((heureArrivee == null) && (heureDepart != null)) {
                heureArrivee = heureDepart;
            }

            if (heureDepart != null && heureArrivee != null) {
                if (moment().isBefore(moment(heureArrivee, "HH:mm"))) {
                    if (isTrainHere) {
                        var numGarePrec = numGare - 1;
                        var trainWidth = "9.1%"; // $("#train"+(i-start)).css('width');
                        if (screenWidth < 700) {
                            trainWidth = "63.7px";
                        }
                        while (numGarePrec > 0) {
                            if ($("#cf" + fromIndexToChar(i - start) + "" + numGarePrec).css("display") != "none") {
                                break;
                            } else {
                                if (screenWidth < 700) {
                                    trainWidth = parseInt(trainWidth.replace("px", "")) + 63.7 + "px";
                                } else {
                                    trainWidth = parseInt(trainWidth.replace("%", "")) + 9.1 + "%";
                                }
                                numGarePrec--;
                            }
                        }
                        $("#train" + (i - start)).css("width", trainWidth);

                        let leftPosition = 4.55 + 9.1 * (numGarePrec - 1);
                        if (screenWidth < 700) {
                            leftPosition = 7 * leftPosition;
                            $("#train" + (i - start)).css("left", leftPosition + "px");
                        } else {
                            $("#train" + (i - start)).css("left", leftPosition + "%");
                        }

                        $("#train" + (i - start)).css("display", "block");
                        isTrainHere = false;
                    }
                    heureAffichee = heureArrivee;
                }

                // Train en attente dans la gare
                if (heureArrivee == moment().format("HH:mm") || (moment().isAfter(moment(heureArrivee, "HH:mm")) && moment().isBefore(moment(heureDepart, "HH:mm"))) || moment().format("HH:mm") == heureDepart) {
                    heureAffichee = heureDepart;
                    $("#h" + fromIndexToChar(i - start) + "" + numGare).css("color", "white");
                    $("#cf" + fromIndexToChar(i - start) + "" + numGare).css("background-color", "orange");
                    isTrainHere = false;
                }

                // Train a quitté la gare
                if (moment().isAfter(moment(heureDepart, "HH:mm"))) {
                    heureAffichee = heureDepart;
                    isTrainHere = true;
                }
            }

            // Griser la gare si le train l'a déjà quitté 
            if (heureAffichee != null && moment().isAfter(moment(heureAffichee, "HH:mm"))) {
                heureAffichee = heureDepart;
                $("#h" + fromIndexToChar(i - start) + "" + numGare).css("color", "lightgrey");
                $("#cf" + fromIndexToChar(i - start) + "" + numGare).css("background-color", "gray");
            }

            // Cacher la gare si le train ne s'y arrête pas
            if (heureDepart == null && heureArrivee == null) {
                $("#cf" + fromIndexToChar(i - start) + "" + numGare).css("display", "none");
            }

            tabHoursToDisplay.push(heureAffichee);
            var span = i - start == 0 ? "#h" + fromIndexToChar("0") + numGare : "#h" + fromIndexToChar(i - start) + "" + numGare;
            $(span).text(heureAffichee);
        }
    }
    $("#loader").hide();
}

function fromIndexToChar(index) {
    return String.fromCharCode(97 + parseInt(index));
}

/**
 * Le programme principale
 */
function main() {
    clearInterval(setIntervalID);

    if (isRetour) {
        lignes = d_lignes_fromTo_cp_k
        gares = [...listGareRetour]
    } else {
        lignes = d_lignes_fromTo_k_cp;
        gares = [...listGare];
    }

    if (lignes != null) {

        // Mettre à jour l'affichage chaque 1/2 minutes
        jsonToTab(lignes);
        setStartAndEnd();
        initUI();
        afficherLignes();
        setIntervalID = setInterval(function() {
            jsonToTab(lignes);
            clearUI();
            setStartAndEnd();
            afficherLignes();
        }, 10000);

        $("#loader").hide();
    }
}

document.querySelector("#switchBtn").addEventListener("change", function() {
    isRetour = !$('#switchBtn').is(':checked');
    main();
});

main();