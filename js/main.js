var listHoraires = [];
var listHorairesRetour = [];

var now = '', twoHourAgo = '';
var index = 0, indexGare = 0;
var isFinished = false;
var isRetour = false;
var link = '';
	
var gare0 = {"code":"K", "nomGare":"KENITRA", "codeGare":"00250", "codeReseau":"0093"};
var gare1 = {"code":"ST", "nomGare":"SALE TABRIQUET", "codeGare":"00238", "codeReseau":"0093"};
var gare2 = {"code":"S", "nomGare":"SALE", "codeGare":"00237", "codeReseau":"0093"};
var gare3 = {"code":"RV", "nomGare":"RABAT VILLE", "codeGare":"00231", "codeReseau":"0093"};
var gare4 = {"code":"RA", "nomGare":"RABAT AGDAL", "codeGare":"00229", "codeReseau":"0093"};
var gare5 = {"code":"T", "nomGare":"TEMARA", "codeGare":"00227", "codeReseau":"0093"}; 
var gare6 = {"code":"S", "nomGare":"SKHIRAT", "codeGare":"00223", "codeReseau":"0093"};
var gare7 = {"code":"B", "nomGare":"BOUZNIKA", "codeGare":"00221", "codeReseau":"0093"};
var gare8 = {"code":"M", "nomGare":"MOHAMMEDIA", "codeGare":"00217", "codeReseau":"0093"};
var gare9 = {"code":"AS", "nomGare":"AIN SEBAA", "codeGare":"00213", "codeReseau":"0093"};
var gare10 = {"code":"CP", "nomGare":"CASA PORT", "codeGare":"00206", "codeReseau":"0093"};

var listGare = [gare0, gare1, gare2, gare3, gare4, gare5, gare6, gare7, gare8, gare9, gare10];
var listGareRetour = [gare10, gare9, gare8, gare7, gare6, gare5, gare4, gare3, gare2, gare1, gare0];

var data = "";
var msg = "";
var nbAjaxCall = 0;
var finalObj = [];


function checkTime(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

function getCurrentTime() {
	var now = new Date();
	var h = now.getHours();
	var m = now.getMinutes();
	// add a zero in front of numbers<10
	m = checkTime(m);
	return h + ":" + m;
}

function isFirstLessThanSecond(hour1, hour2){
	var h1 = parseInt(hour1.replace(':', ''));
	var h2 = parseInt(hour2.replace(':', ''));
	return h1 < h2;	
}
function isFirstEqualSecond(hour1, hour2){
	var h1 = parseInt(hour1.replace(':', ''));
	var h2 = parseInt(hour2.replace(':', ''));
	return h1 == h2;	
}

function init() {

	var unSortedData = JSON.parse(localStorage.getItem('listHoraires'));

	if(unSortedData != null){		
		
		// Trier les données
		unSortedData.sort(function(a, b) {return a.index - b.index});
		
		// Supprimer les doublons
		data = unSortedData.reduce((arr, item) => {
			let exists = !!arr.find(x => x.heureDepart  === item.heureDepart && x.nomGareFrom === item.nomGareFrom );
			if(!exists){
				arr.push(item);
			}
			return arr;
		}, []);
		
		getLignesFrom('KENITRA', 0);
		getLignesFrom('RABAT+AGDAL', Object.keys(finalObj).length);
		
	}else{
		$(document).ready(function(){
			$('#loader').show();			
			// Actualiser chaque minute
			run();
						
			/*
			setInterval(function(){ 
				run()
			}, 30000);
			*/
		});	
	}
		
	// Afficher l'AI.
	afficherLignes();
	setInterval(function(){ 
		afficherLignes()
	}, 30000);
		
}

function getLignesFrom(nomGareDepart, indice){
	// Récupérer la liste des horaires des trains partant de la gare de départ 'nomGareDepart'
	var horairesDepart = $(data).filter(function (i,n){
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
				
		finalObj.push(hrObj); //horaires;	
	}
	finalObj.sort(function(a, b) {return parseInt(a.CPA.replace(':','')) - parseInt(b.CPA.replace(':',''))});
	console.log(JSON.stringify(finalObj));
	
	// Nettoyer la liste des horaires
	data = $(data).filter(function (i,n){
		return (n.nomGareFrom!=nomGareDepart);
	})
		
}	

function getNextGare(gareDepart){
	for(var i=1; i<3; i++){ // 3 : nombre de minutes max d'attente du train au sein d'une gare.
		var heureDepartProchaineGare = addMinute(gareDepart.heureArrivee, i);
		
		var gareArrivee = $(data).filter(function (m,n){
			return (n.nomGareFrom===gareDepart.nomGareTo && n.heureDepart===heureDepartProchaineGare);
		});
		
		// Si on trouve la gare on la supprime de la liste des gares
		data = $(data).filter(function (m,n){
			return (n.nomGareFrom!=gareDepart.nomGareTo || n.heureDepart!=heureDepartProchaineGare);
		});
		
		if(gareArrivee.length > 0){	
			return gareArrivee[0];
		}
	}
	return null;
}

function afficherLignes(){

	var msg = '';
	var now = moment().format("HH:mm");
	var l = finalObj.length;
	var start = 0;
	var end = 49;		// Nombre total des trains
	
	// Pour déterminer les trains à afficher
	for(var i=start; i<=end; i++){
		
		var lastHour = finalObj[i].CPA;
		if( (lastHour != '--:--') && (moment().isBefore(moment(lastHour, 'HH:mm'))) ){
			start = i > 1 ? i - 1 : i;		// 1 : nombre de trains déjà arrivés au Terminus.
			end = start + 9;				// 9 : nombre de trains supplémentaires à afficher.
			break;
		}
	}
	
	for(var i=start; i<=end; i++){	
		var tabHours = finalObj[i];
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

function run(){
	var d = new Date();
	twoHourAgo = 
		("00" + (d.getDate())).slice(-2) + "/" + 
		("00" + (d.getMonth()+1)).slice(-2) + "/" + 
		d.getFullYear() + "+" + 
		("00" + (d.getHours()-2)).slice(-2) + ":" + 
		("00" + d.getMinutes()).slice(-2) 
	;

	twoHourAgo = ("00" + (d.getDate())).slice(-2) + "/" + 
		("00" + (d.getMonth()+1)).slice(-2) + "/" + 
		d.getFullYear() + "+00:00";

	$('#bar').width(0);
	$('#bar').show();	
	link = "https://www.oncf.ma/fr/Horaires?from["+listGare[0].codeGare+"]["+listGare[0].codeReseau+"]="+listGare[0].nomGare.replace(' ', '+');
	link = link+"&to["+listGare[1].codeGare+"]["+listGare[1].codeReseau+"]="+listGare[1].nomGare.replace(' ', '+')+"&datedep="+twoHourAgo+"&dateret=&is-ar=0";
	if(localStorage.getItem('lastAjaxExe')){		
		var lastAjaxExe =  new Date(localStorage.getItem("lastAjaxExe"));
		if(d.getHours() == lastAjaxExe.getHours()){
			listHoraires = JSON.parse(localStorage.getItem('listHoraires'));
			listHorairesRetour = JSON.parse(localStorage.getItem('listHorairesRetour'));			
			//main(d);
		}else{		
			for(var i=1; i<listGare.length; i++){
				ajaxCall(i-1, listGare[i-1], listGare[i]);
			}				
			ajaxCall(i++, gare4, gare6);
			ajaxCall(i++, gare4, gare7);
			ajaxCall(i++, gare4, gare8);
			
			ajaxCall(i++, gare5, gare7);
			ajaxCall(i++, gare5, gare8);
			
			ajaxCall(i++, gare6, gare8);
		}
	}else{	
		for(var i=1; i<listGare.length; i++){
			ajaxCall(i-1, listGare[i-1], listGare[i]);
		}				
		ajaxCall(i++, gare4, gare6);
		ajaxCall(i++, gare4, gare7);
		ajaxCall(i++, gare4, gare8);
		
		ajaxCall(i++, gare5, gare7);
		ajaxCall(i++, gare5, gare8);
		
		ajaxCall(i++, gare6, gare8);
	}	
}

function extractData(result, gareFrom, gareTo, id){
	console.log('extractData(result, '+id+', '+isRetour+')');
	var html = $.parseHTML(result);
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
				var tempsRestant = getTempsRestant(nbMinutes);
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
	$.ajax({
		url: "https://www.oncf.ma/fr/Horaires?from["+gareFrom.codeGare+"]["+gareFrom.codeReseau+"]="+gareFrom.nomGare.replace(' ', '+')+"&to["+gareTo.codeGare+"]["+gareTo.codeReseau+"]="+gareTo.nomGare.replace(' ', '+')+"&datedep="+twoHourAgo+"&dateret=&is-ar=0", 
		type: 'GET', 
		success: function(result){  
			extractData(result, gareFrom, gareTo, id);
			console.log('getDataFromTo() : '+ gareFrom.nomGare +' -> '+ gareTo.nomGare);
			if(nbAjaxCall == 15){			
				var d = new Date();	
				localStorage.setItem('listHorairesRetour', JSON.stringify(listHorairesRetour));	
				localStorage.setItem('listHoraires', JSON.stringify(listHoraires));							
				localStorage.setItem('lastAjaxExe', d);	
			}
			nbAjaxCall++;			
		},
		error : function(error){
			console.log('Error ${error}');
		}
	});
}

function getTempsRestant(minutes){
	var d = new Date();
	var n = d.toLocaleTimeString();
	var minNow = 60*parseInt(n.substring(0, 2))+parseInt(n.substring(5, 3));
	var diff = minutes-minNow;
	return	diff > 59 ? '1h+' : (diff < 0 ? '-' : diff+' min');
}	

function addMinute(temps, nbMinute){
	var t = temps.split(':');
	var newMinute = parseInt(t[1]) + nbMinute;
	var h = parseInt(t[0]);
	if(newMinute > 59){
		newMinute = newMinute - 60;
		h = h + 1;
	}
	if(newMinute < 10){
		newMinute = '0' + newMinute;
	}
	if(h < 10){
		h = '0' + h;
	}
	return h+":"+newMinute;
}

document.addEventListener('DOMContentLoaded', init);


