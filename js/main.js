var listHoraires = [];
var listHorairesRetour = [];

var twoHourAgo = "";
var index = 0;
var isRetour = false;
var link = "";
var data = "";
var nbAjaxCall = 0;
var finalObj = [];
	
var gare0 = {"code":"K", "nomGare":"KENITRA", "codeGare":"00250", "codeReseau":"0093"};
var gare1 = {"code":"ST", "nomGare":"SALE TABRIQUET", "codeGare":"00238", "codeReseau":"0093"};
var gare2 = {"code":"S", "nomGare":"SALE", "codeGare":"00237", "codeReseau":"0093"};
var gare3 = {"code":"RV", "nomGare":"RABAT VILLE", "codeGare":"00231", "codeReseau":"0093"};
var gare4 = {"code":"RA", "nomGare":"RABAT AGDAL", "codeGare":"00229", "codeReseau":"0093"};
var gare5 = {"code":"T", "nomGare":"TEMARA", "codeGare":"00227", "codeReseau":"0093"}; 
var gare6 = {"code":"SK", "nomGare":"SKHIRAT", "codeGare":"00223", "codeReseau":"0093"};
var gare7 = {"code":"B", "nomGare":"BOUZNIKA", "codeGare":"00221", "codeReseau":"0093"};
var gare8 = {"code":"M", "nomGare":"MOHAMMEDIA", "codeGare":"00217", "codeReseau":"0093"};
var gare9 = {"code":"AS", "nomGare":"AIN SEBAA", "codeGare":"00213", "codeReseau":"0093"};
var gare10 = {"code":"CP", "nomGare":"CASA PORT", "codeGare":"00206", "codeReseau":"0093"};

var listGare = [gare0, gare1, gare2, gare3, gare4, gare5, gare6, gare7, gare8, gare9, gare10];
var listGareRetour = [gare10, gare9, gare8, gare7, gare6, gare5, gare4, gare3, gare2, gare1, gare0];


function init() {

	// Récupérer les données du LocalStorage, sinon faire les appels nécessaires.
	var lastAjaxExe = localStorage.getItem("lastAjaxExe");
	if( (localStorage.getItem('lignes') == null) || (lastAjaxExe != moment().format('DD/MM/YYYY')) ){
		
		$(document).ready(function(){
			$('#loader').show();
			// Récupérer les données du site oncf.ma
			getData();
		});

	}else{
		// Cacher le loading
		$('#loader').hide();

		lignes = JSON.parse(localStorage.getItem('lignes'));

		// Afficher l'AI.
		afficherLignes(lignes);

		// Mettre à jour l'affichage chaque 1/2 minutes
		setInterval(function(){
			afficherLignes(lignes)
		}, 30000);
	}

		
}

/**
 * Transforme la liste des horaires des trains en une liste des lignes de trains
 * @param horaires
 * @param nomGareDepart
 * @returns {Array}
 */
function fromHorairesToLignes(nomGareDepart, lignes){

	// Récupérer la liste des horaires des trains partant de la gare de départ 'nomGareDepart'
	var horairesDepart = $(listHoraires).filter(function (i,n){
		return n.nomGareFrom===nomGareDepart;
	});
	
	// Pour chaque horaire, trouver les autres horaires du train pour les prochaines gares
	for(var k=0; k<horairesDepart.length; k++){
		var ligne = [];
		var gareDepart = horairesDepart[k];
		ligne.push(gareDepart);
		for(var j=0; j<10; j++){
			var gareArrivee = getNextGare(gareDepart);
			if(gareArrivee != null){	
				gareDepart = gareArrivee;
				ligne.push(gareDepart);
			}else{
				break;
			}
		}
		
		var hrObj = {};
		for(gare of listGare){
			hrObj[gare.code+'A']="--:--";
			hrObj[gare.code+'D']="--:--";
		}
					
		ligne.forEach(function(horaire) {
			for(var m=0; m<listGare.length; m++){
				var nomGare = listGare[m].nomGare.replace(' ', '+');
				var code = listGare[m].code;
				if(nomGare === horaire.nomGareFrom){
					hrObj[code+'D'] = horaire.heureDepart;
				}
				if(nomGare === horaire.nomGareTo){
					hrObj[code+'A'] = horaire.heureArrivee;
				}
			}
		});

		lignes.push(hrObj);
	}
	lignes.sort(function(a, b) {return parseInt(a.CPA.replace(':','')) - parseInt(b.CPA.replace(':',''))});
	console.log(JSON.stringify(lignes));

	// Nettoyer la liste des horaires
	listHoraires = $(listHoraires).filter(function (i,n){
		return (n.nomGareFrom!=nomGareDepart);
	})

}	

function getNextGare(gareDepart){
	for(var i=1; i<4; i++){ // 4 : nombre de minutes max d'attente du train au sein d'une gare.
		var heureDepartProchaineGare = moment(gareDepart.heureArrivee, 'HH:mm').add(i, 'minutes'); //addMinute(gareDepart.heureArrivee, i);
		
		var gareArrivee = $(listHoraires).filter(function (m,n){
			return (n.nomGareFrom===gareDepart.nomGareTo && n.heureDepart===heureDepartProchaineGare.format('HH:mm'));
		});
		
		// Si on trouve la gare on la supprime de la liste des gares
		listHoraires = $(listHoraires).filter(function (m,n){
			return (n.nomGareFrom!=gareDepart.nomGareTo || n.heureDepart!=heureDepartProchaineGare.format('HH:mm'));
		});
		
		if(gareArrivee.length > 0){	
			return gareArrivee[0];
		}
	}
	return null;
}

function afficherLignes(lignes){

	var msg = '';
	var now = moment().format("HH:mm");
	var l = lignes.length;
	var start = 0;
	var end = 0;		// Nombre total des trains
	
	// Pour déterminer les trains à afficher
	for(var i=start; i<lignes.length; i++){
		
		var lastHour = lignes[i].CPA;
		if( (lastHour != '--:--') && (moment().isBefore(moment(lastHour, 'HH:mm'))) ){
			start = i > 1 ? i - 1 : i;		// 1 : nombre de trains déjà arrivés au Terminus.
			end = start + 9;				// 9 : nombre de trains supplémentaires à afficher.
			break;
		}
	}
	
	for(var i=start; i<=end; i++){
		var tabHours = lignes[i];
		var tabHoursToDisplay = [];
		var isTrainHere = false;
		
		for(var j=0; j<listGare.length; j++){
			var numGare = j+1;
			var currentGare = listGare[j];
			var code = currentGare.code;
			
			var heureArrivee = tabHours[code+'A'];
			var heureDepart = tabHours[code+'D'] == undefined ? '--:--' : tabHours[code+'D'];
			var heureAffichee = '--:--';
			
			if( (heureArrivee == '--:--') && (heureDepart != '--:--') ){
				heureArrivee = heureDepart;
			}
			if( (heureDepart == '--:--') && (heureArrivee != '--:--') ){
				heureDepart = heureArrivee;
			}
			
			if( (heureDepart != '--:--') && (heureArrivee != '--:--') ){
				if(moment().isBefore(moment(heureArrivee, 'HH:mm'))){
				//if(isFirstLessThanSecond(now, heureArrivee)){		// Train en route vers la gare
					if(isTrainHere){
						var numGarePrec = numGare-1;
						var trainWidth = '72px'; // $("#train"+(i-start)).css('width');
						while(numGarePrec > 0){
							if($("#cf"+(i-start)+''+numGarePrec).css('display')!='none'){
								break;
							}else{
								trainWidth =  (parseInt(trainWidth.replace('px', ''))+72)+'px';
								numGarePrec--;
							}
						}
						$("#train"+(i-start)).css('width', trainWidth);
						$("#train"+(i-start)).addClass("ltr"+numGarePrec);
						$("#train"+(i-start)).css('display', 'block');
						isTrainHere = false;
					}
					heureAffichee = heureArrivee;
				}

				if( (heureArrivee == now) || 
					(moment().isAfter(moment(heureArrivee, 'HH:mm'))) && 
					(moment().isBefore(moment(heureDepart, 'HH:mm'))) || 
					(now == heureDepart) ) {	// Train en attente dans la gare
					heureAffichee = heureDepart;
					$('#h'+(i-start)+''+numGare).css('color', 'white');
					$("#cf"+(i-start)+''+numGare).css('background-color', 'orange');
					isTrainHere = false;
				}
				
				if(moment().isAfter(moment(heureDepart, 'HH:mm'))){	// Train a quitté la gare
					heureAffichee = heureDepart;
					isTrainHere = true;
				}
			}
			
			if( (heureAffichee != '--:--') &&  (moment().isAfter(moment(heureAffichee, 'HH:mm'))) ){
				heureAffichee = heureDepart;
				$('#h'+(i-start)+''+numGare).css('color', 'lightgrey');
				$("#cf"+(i-start)+''+numGare).css('background-color', 'gray');
			}
			
			if( (heureDepart == '--:--') && (heureArrivee == '--:--') ){
				$("#cf"+(i-start)+''+numGare).css('display', 'none');
			}
						
			tabHoursToDisplay.push(heureAffichee);
			var span = (i-start) == 0 ? "#h0" + numGare : "#h" + (i-start)+ '' + numGare;
			$(span).text(heureAffichee);
		}
	}
	$('#loader').hide();
}

function getData(){
	var today = moment().format('DD/MM/YYYY')+'00:00';

	$('#bar').width(0);
	$('#bar').show();

	for(var i=1; i<listGare.length; i++){
		ajaxCall(i-1, listGare[i-1], listGare[i]);
	}
	// Autres appel Ajax nécessaires liées à la liaison RABAT AGDAL => MOHAMMEDIA
	ajaxCall(i++, gare4, gare6);
	ajaxCall(i++, gare4, gare7);
	ajaxCall(i++, gare4, gare8);
	ajaxCall(i++, gare5, gare7);
	ajaxCall(i++, gare5, gare8);
	ajaxCall(i++, gare6, gare8);
}

function extractData(ajaxResponse, gareFrom, gareTo, id){
	console.log('extractData(ajaxResponse, '+id+', '+isRetour+')');
	var html = $.parseHTML(ajaxResponse);
	var dataTable = html[44].getElementsByClassName("table table_custom")[0];
	if(dataTable) {
		var cells = dataTable.querySelectorAll("td");
		var nbCells = Math.floor(cells.length / 6);
		var taille = nbCells; // nbCells < 5 ? nbCells : 5; 
		for (var i = 0; i < taille; i++){
			var typeTrain = cells[6*i+4].textContent.trim().indexOf('navette') > -1;
			if(typeTrain){
				var heureDepart = cells[6*i].textContent.trim();	
				var heureArrivee = cells[6*i+1].textContent.trim();					
				var nbMinutes = 60*parseInt(heureDepart.substring(0, 2))+parseInt(heureDepart.substring(5, 3));
				if(isRetour){
					var obj = {'index' : 100*id + i, //String.fromCharCode(65+id)+i, 
						'nomGareFrom' : gareFrom.nomGare.replace(' ', '+'), 
						'nomGareTo' : gareTo.nomGare.replace(' ', '+'), 
						'heureDepart' : heureDepart.replace('h', ':').replace('min', ''), 
						'heureArrivee' : heureArrivee.replace('h', ':').replace('min', '')};
					listHorairesRetour.push(obj);	
				}else{				
					var obj = {'index' : 100*id + i, //String.fromCharCode(65+id)+i, 
						'nomGareFrom' : gareFrom.nomGare.replace(' ', '+'), 
						'nomGareTo' : gareTo.nomGare.replace(' ', '+'), 
						'heureDepart' : heureDepart.replace('h', ':').replace('min', ''), 
						'heureArrivee' : heureArrivee.replace('h', ':').replace('min', '')};
					listHoraires.push(obj);						
				}
			}
		}
	}
}

function ajaxCall(id, gareFrom, gareTo){
	var today = moment().format('DD/MM/YYYY')+'00:00';
	$.ajax({
		url: "https://www.oncf.ma/fr/Horaires?from["+gareFrom.codeGare+"]["+gareFrom.codeReseau+"]="+gareFrom.nomGare.replace(' ', '+')+"&to["+gareTo.codeGare+"]["+gareTo.codeReseau+"]="+gareTo.nomGare.replace(' ', '+')+"&datedep="+today+"&dateret=&is-ar=0",
		type: 'GET', 
		success: function(result){  
			extractData(result, gareFrom, gareTo, id);
			console.log('getDataFromTo() : '+ gareFrom.nomGare +' -> '+ gareTo.nomGare);
			if(nbAjaxCall == 15){ // 15 = 9 + 6 (10 gares => 9 appels Ajax) + (6 appels Ajax pour le trançon RABAT AGDAL <=> MOHAMMEDIA)

				var lignes = [];
				listHoraires = cleanData(listHoraires);
				fromHorairesToLignes( 'KENITRA', lignes);
				fromHorairesToLignes( 'RABAT+AGDAL', lignes);
				localStorage.setItem('lignes', JSON.stringify(lignes));
				localStorage.setItem('lastAjaxExe', moment().format('DD/MM/YYYY'));

				// Afficher l'AI, après le dernier appel ajax effectué
				afficherLignes(lignes);
				// Mettre à jour l'affichage chaque 1/2 minutes
				setInterval(function(){
					afficherLignes(lignes)
				}, 30000);

			}
			nbAjaxCall++;			
		},
		error : function(error){
			console.log('Error ${error}');
		}
	});
}

function cleanData(dirtyData) {
	// Trier les données
	dirtyData.sort(function(a, b) {return a.index - b.index});

	// Supprimer les doublons
	return dirtyData.reduce((arr, item) => {
		let exists = !!arr.find(x => x.heureDepart  === item.heureDepart && x.nomGareFrom === item.nomGareFrom);
		if(!exists){
			arr.push(item);
		}
		return arr;
	}, []);
}

document.addEventListener('DOMContentLoaded', init);


