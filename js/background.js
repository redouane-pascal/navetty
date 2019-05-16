//var now = '';
//var arrayHoraire_v1 = [];
//var index = 0, indexGare = 0;
//
//var gare0 = {"nomGare":"KENITRA", "codeGare":"00250", "codeReseau":"0093"};
//var gare1 = {"nomGare":"SALE", "codeGare":"00237", "codeReseau":"0093"};
//var gare2 = {"nomGare":"RABAT VILLE", "codeGare":"00231", "codeReseau":"0093"};
//var gare3 = {"nomGare":"RABAT AGDAL", "codeGare":"00229", "codeReseau":"0093"};
//var gare4 = {"nomGare":"MOHAMMEDIA", "codeGare":"00217", "codeReseau":"0093"};
//var gare5 = {"nomGare":"AIN SEBAA", "codeGare":"00213", "codeReseau":"0093"};
//var gare6 = {"nomGare":"CASA PORT", "codeGare":"00206", "codeReseau":"0093"};
//
//var listGare = [gare0, gare1, gare2, gare3, gare4, gare5, gare6];
//
//var link = "";//"https://www.oncf.ma/fr/Horaires?from[00229][0093]=RABAT+AGDAL&to";
//var maGare = ""; mesGares = "", maGareDepart = "";
//
//function getHoraireFromTo(gareFrom, gareTo){
//	// alert(gareFrom.nomGare +' => '+gareTo.nomGare);
//	// Vider le localStorage lors du 1er chargement
//	if(index == 0){
//		localStorage.removeItem('arrayHoraire_v1');
//	}
//	var d = new Date();
//	var twoHourAgo = 
//		("00" + (d.getDate())).slice(-2) + "/" + 
//		("00" + d.getMonth() + 1).slice(-2) + "/" + 
//		d.getFullYear() + "+" + 
//		("00" + (d.getHours()-2)).slice(-2) + ":" + 
//		("00" + d.getMinutes()).slice(-2) 
//	;	
//	
//	var nomGareFrom = gareFrom.nomGare.replace(' ', '+');
//	link = "https://www.oncf.ma/fr/Horaires?from["+gareFrom.codeGare+"]["+gareFrom.codeReseau+"]="+nomGareFrom+"&to";
//	
//	var nomGareTo = gareTo.nomGare.replace(' ', '+');
//	link = link+"["+gareTo.codeGare+"]["+gareTo.codeReseau+"]="+nomGareTo+"&" + "datedep="+twoHourAgo+"&dateret=&is-ar=0";
//	
//	$.ajax({
//		url: link, 
//		type: 'GET', 
//		success: function(result){   
//			var html = $.parseHTML(result);
//			var dataTable = html[44].getElementsByClassName("table table_custom")[0];
//			if(dataTable) {
//				var cells = dataTable.querySelectorAll("td");
//				var nbCells = Math.floor(cells.length / 6);
//				var taille = nbCells; // nbCells < 5 ? nbCells : 5; 
//				for (var i = 0; i < taille; i++){
//					var typeTrain = cells[6*i+4].textContent.trim().indexOf('navette') > -1;
//					if(typeTrain){
//						var heureDepart = cells[6*i].textContent.trim();	
//						var heureArrivee = cells[6*i+1].textContent.trim();					
//						var nbMinutes = 60*parseInt(heureDepart.substring(0, 2))+parseInt(heureDepart.substring(5, 3));
//						var tempsRestant = getTempsRestant(nbMinutes);
//						var obj = {'index' : index, 
//							'nomGareFrom' : nomGareFrom, 
//							'nomGareTo' : nomGareTo, 
//							'heureDepart' : heureDepart.replace('h', ':').replace('min', ''), 
//							'heureArrivee' : heureArrivee.replace('h', ':').replace('min', '')};
//						index = index + 1;
//						arrayHoraire_v1.push(obj);	
//					}
//				}				
//				localStorage.setItem('arrayHoraire_v1', JSON.stringify(arrayHoraire_v1));
//				// Refaire le traitement pour la prochaine Gare
//				indexGare = indexGare + 1;
//				if(indexGare < 6){
//					getHoraireFromTo(listGare[indexGare], listGare[indexGare+1]); 
//				}
//			}
//		},
//		//async: false,
//		error : function(error){
//			console.log('Error ${error}');
//		}
//	})	
//	
//}
///*
//function getHoraire(){
//	arrayHoraire_v1 = [];
//	var d = new Date();
//	now = 
//		("00" + (d.getDate())).slice(-2) + "/" + 
//		("00" + d.getMonth() + 1).slice(-2) + "/" + 
//		d.getFullYear() + "+" + 
//		("00" + (d.getHours()-1)).slice(-2) + ":" + 
//		("00" + d.getMinutes()).slice(-2) 
//	;	
//	
//	// Récupérer le détail des gares à afficher
//	var listGaresToDisplay = [];	
//	$.when(
//		// lister les gares à afficher.
//		$.getJSON("resource/config.json", function( myData ) {
//			maGare = myData.gare;
//			mesGares = myData.gares;
//			maGareDepart = myData.gareDepart;
//			localStorage.setItem('maGare', maGare);
//			localStorage.setItem('mesGares', JSON.stringify(mesGares));
//			localStorage.setItem('maGareDepart', maGareDepart);
//		}),
//		
//		// Récupérer le détail des gares à afficher.
//		$.getJSON("resource/list.json", function( listGare ) {
//			for (i = 0; i < mesGares.length; i++) {
//				var gareToDisplay = listGare.find(
//					item => {
//						return item.nomGare == mesGares[i]
//					}
//				);
//				listGaresToDisplay.push(gareToDisplay);
//				
//				var gareDeDepart = listGare.find(
//					item => {
//						return item.nomGare == maGareDepart
//					}
//				);
//				var nomGareDepart = gareDeDepart.nomGare.replace(' ', '+');
//				link = "https://www.oncf.ma/fr/Horaires?from["+gareDeDepart.codeGare+"]["+gareDeDepart.codeReseau+"]="+nomGareDepart+"&to";
//			}
//		})
//		
//	).then(function() {	
//		
//		getHoraireData(listGaresToDisplay, 0);
//		
//	});
//
//}
//
//function getHoraireData(listGaresToDisplay, indiceToStop){
//	
//	if(indiceToStop < listGaresToDisplay.length){
//		var item = listGaresToDisplay[indiceToStop];
//		var nomGare = item.nomGare.replace(' ', '+');
//		var newLink = link+"["+item.codeGare+"]["+item.codeReseau+"]="+nomGare+"&" + "datedep="+now+"&dateret=&is-ar=0";
//		$.ajax({
//			url: newLink, 
//			type: 'GET', 
//			success: function(result){   
//				var html = $.parseHTML(result);
//				var dataTable = html[44].getElementsByClassName("table table_custom")[0];
//				if(dataTable) {
//					var cells = dataTable.querySelectorAll("td");
//					var nbCells = Math.floor(cells.length / 6);
//					var taille = nbCells; // < 10 ? nbCells : 10;
//					for (var i = 0; i < taille; i++){
//						var heureDepart = cells[6*i].textContent.trim();					
//						var nbMinutes = 60*parseInt(heureDepart.substring(0, 2))+parseInt(heureDepart.substring(5, 3));
//						var tempsRestant = getTempsRestant(nbMinutes);
//						var obj = {'gare' : nomGare.replace('+', ' '), 'heureDepart' : heureDepart.replace('h', ':').replace('min', ''), 'nbMinutes' : nbMinutes, 'TempsRestant' : tempsRestant};
//						arrayHoraire_v1.push(obj);	
//					}
//				}
//				indiceToStop++;
//				getHoraireData(listGaresToDisplay, indiceToStop);
//			},
//			//async: false,
//			error : function(error){
//				console.log('Error ${error}');
//			}
//		})
//	}else{
//		arrayHoraire_v1.sort(function(a, b){
//			return a.nbMinutes-b.nbMinutes;
//		});
//		localStorage.setItem('arrayHoraire_v1', JSON.stringify(arrayHoraire_v1));		
//		
//		// show badge
//		showHoraireNextTrain(arrayHoraire_v1, maGare);
//	}
//}
//
//function showHoraireNextTrain(arrayHoraire_v1, maGare){
//	var isBadgeSet = false;
//	var taille = arrayHoraire_v1.length;// < 10 ? arrayHoraire_v1.length : 10;
//	for (var i = 0, l = taille; i < l; i++) {	
//		if((arrayHoraire_v1[i].gare === maGare) && (arrayHoraire_v1[i].TempsRestant != '-')){
//			isBadgeSet = false;
//			var tempsRestant = parseInt(arrayHoraire_v1[i].TempsRestant.replace(' min'));		
//			var badgeColor = "green"; 
//			if(tempsRestant < 16){
//				badgeColor = "red";
//			}else if (tempsRestant < 26){
//				badgeColor = "orange";
//			}				
//			chrome.browserAction.setBadgeText({text: arrayHoraire_v1[i].heureDepart});		
//			chrome.browserAction.setBadgeBackgroundColor({color: badgeColor});	
//			return;		
//		}
//	}
//}
//*/
//function getTempsRestant(minutes){
//	var d = new Date();
//	var n = d.toLocaleTimeString();
//	var minNow = 60*parseInt(n.substring(0, 2))+parseInt(n.substring(5, 3));
//	var diff = minutes-minNow;
//	return	diff > 59 ? '1h+' : (diff < 0 ? '-' : diff+' min');
//}	
///*
//function getHoraireByDateDepart(listHoraire, heureDepart, nomGareFrom) {
//	var cond = true;
//	if(nomGareFrom != ''){
//		cond = cond && item.nomGareFrom == nomGareFrom
//	}
//	if(heureDepart != ''){
//		cond = cond && item.heureDepart == heureDepart
//	}
//	return heureDepart.find(
//		item => {
//			return cond
//		}
//	);
//}
//*/
//
//getHoraireFromTo(listGare[0], listGare[1]); 
//	
//setInterval(function(){ 
//	getHoraireFromTo(listGare[0], listGare[1])
//}, 300000);



