//SETUP MAP
var mymap = L.map('mapid').setView([56.17204066666667, 10.1883435], 13);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
			maxZoom: 18,
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
				'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
				'Imagery © <a href="http://mapbox.com">Mapbox</a>',
			id: 'mapbox.streets'
}).addTo(mymap);

i=0;
//Array Of lat longs from Nokia
phoneData = [];
//Array of lat longs from grounded data
groundedData = []

//Array of phone lats
phoneLatData = [];

//Array of phone lngs
phoneLngData = [];

/**
 * ROW DATA:
 * 1 ROW : header 
 * 		#TimeStampInMS, gt_lat, gt_long, phone_lat, phone_lng
 * 2 - infinite : content
 * 		0: [#TimeStampInMS], 1: [gt_lat], 2: [gt_long], 3: [phone_lat], 4: [phone_lng]
 */
Papa.parse("http://localhost:8888/geodata/resources/walking.csv", {
	download:true,
	step: function(row) {
		if(i == 0){
			console.log("Header:", row.data);
		} else {
			if(row.data[0][3] && row.data[0][4]){
				var pLatLng = L.latLng(row.data[0][3], row.data[0][4])
				phoneData.push(pLatLng)
				phoneLatData.push(parseFloat(row.data[0][3]))
				phoneLngData.push(parseFloat(row.data[0][4]))

			}
			if(row.data[0][1] && row.data[0][2]){
				var gLatLng = L.latLng(row.data[0][1],row.data[0][2])
				groundedData.push(gLatLng);
			}
		}
		i++;
	},
	complete: function() {
		phoneLatData = meanFilter(phoneLatData);
		phoneLngData = meanFilter(phoneLngData);
		phoneMeanData = convertToLatLng(phoneLatData, phoneLngData);
		L.polyline(phoneData, {color: 'RGBA(255,0,0,0.5)'}).addTo(mymap);
		L.polyline(groundedData, {color: 'RGBA(0,255,0,0.5)'}).addTo(mymap);
		L.polyline(phoneMeanData, {color: 'RGBA(0,0,255,0.5)'}).addTo(mymap);
	}
})

function meanFilter(arr){
	result = [];
	for (i = 2; i < arr.length - 2; ++i){
		result[i - 2] = (
			arr[i - 2] +
			arr[i - 1] +
			arr[i] +
			arr[i + 1] +
			arr[i + 2]) / 5;
	}
	return result;
}

function convertToLatLng(lat, lng){
	if(lat.length != lng.length){
		alert('hell no')
		return
	}
	latLng = []
	for (i = 0; i < lat.length; ++i){
		latLng.push(L.latLng(lat[i], lng[i]))
	}
	return latLng;
}

// FILE READ FUNCTION
function readTextFile(file)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                alert(allText);
            }
        }
    }
    rawFile.send(null);
}