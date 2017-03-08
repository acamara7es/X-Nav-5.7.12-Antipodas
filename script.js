var map1, map2;
var map1_register, map2_register;
var active_map;
var pos, antipodes;
var marker1, marker2;

function getLocation() {
    if (Modernizr.geolocation) {
        navigator.geolocation.getCurrentPosition(initMap,function(){
            alert("No se pudo obtener la ubicación.")
            var aux = {
                coords:{
                    latitude: 0.0,
                    longitude: 0.0
                }
            }
            initMap(aux);
        });
    } else {
        $.ajax("https://cdn.jsdelivr.net/webshim/1.15.10/polyfiller.js", {
                "crossDomain": true,
                "dataType": "script"
            })
            .done(function(data) {
                console.log(data);
                webshim.setOptions('geolocation', {
                    confirmText: '¿Permitir que {location} acceda a su ubicación?'
                });
                webshim.polyfill('geolocation');
                webshim.ready("geolocation", function() {
                    navigator.geolocation.getCurrentPosition(initMap);
                });
            })
        Math.sign = Math.sign || function(x) {
            x = +x; /* convert to a number*/
            if (x === 0 || isNaN(x)) {
                return x;
            }
            return x > 0 ? 1 : -1;
        }
    }
}

function initMap(location) {
    pos = {
        lat: location.coords.latitude,
        lng: location.coords.longitude
    };
    console.log(pos.lat);
    console.log(pos.lng);
    drawMap(pos, "map1");
    antipodes = getAntipodes(pos);
    drawMap(antipodes, "map2");
    addListeners();
}

function getAntipodes(pos) {
    var antipodes = {
        lat: -pos.lat,
        lng: pos.lng - Math.sign(pos.lng) * 180
    };
    return antipodes;
}

function convertLatLng(latlng) {
    var myLatLng = {
        lat: latlng.lat(),
        lng: latlng.lng()
    };
    return myLatLng;
}

function drawMap(pos, id) {
    var mapDiv = document.getElementById(id);
    var map = new google.maps.Map(mapDiv, {
        center: pos,
        zoom: 15,
        mapTypeId: "satellite"
    });
    var marker = new google.maps.Marker({
        position: pos,
        map: map
    });
    if (id === "map1") {
        map1 = map;
        marker1 = marker;
    } else {
        map2 = map;
        marker2 = marker;
    }

}

function addListeners() {
    map1.addListener("zoom_changed", function() {
        if (active_map == 1) {
            map2.setZoom(this.getZoom());
        }
        this.setCenter(pos);
    });

    map1.addListener("click", function(e) {
        pos = convertLatLng(e.latLng);
        antipodes = getAntipodes(pos);
        moveMap1(pos);
        moveMap2(antipodes);
    });

    map2.addListener("zoom_changed", function() {
        if (active_map == 2) {
            map1.setZoom(this.getZoom())
        }
        this.setCenter(antipodes);
    });

    map2.addListener("click", function(e) {
        antipodes = convertLatLng(e.latLng);
        pos = getAntipodes(antipodes);
        moveMap1(pos);
        moveMap2(antipodes);
    });
}

function moveMap1(pos) {
    marker1.setMap(null);
    marker1 = new google.maps.Marker({
        position: pos,
        map: map1
    });
    console.log(map1.getCenter().lat());
    map1.panTo(pos);
    console.log(map1.getCenter());
}

function moveMap2(pos) {
    marker2.setMap(null);
    marker2 = new google.maps.Marker({
        position: pos,
        map: map2
    });
    map2.panTo(pos);
}

//Evita la recursividad en los eventos
$(document).ready(function() {
    $("#map1").hover(function() {
        active_map = 1;
    }, function() {
        active_map = 0;
    });

    $("#map2").hover(function() {
        active_map = 2;
    }, function() {
        active_map = 0;
    });
    $("#map1").mouseup(stopRegister);
    $("#map1").mousedown(function(){
        registerMove(1);
    });
    $("#map1").mousemove(moveCenter);
    $("#map2").mouseup(stopRegister);
    $("#map2").mousedown(function(){
        registerMove(2);
    });
    $("#map2").mousemove(moveCenter);

});

function moveCenter(){
    var aux={};
    if(map1_register){
        aux = {
            lat: map1.getCenter().lat(),
            lng: map1.getCenter().lng()
        }
        pos = aux;
        antipodes = getAntipodes(pos);
        map2.panTo(antipodes);
    }
    if(map2_register){
        aux = {
            lat: map2.getCenter().lat(),
            lng: map2.getCenter().lng()
        }
        antipodes = aux;
        pos=getAntipodes(antipodes);
        map1.panTo(pos);
    }
}

function stopRegister(){
    console.log("HOLA")
    map1_register = false;
    map2_register = false;
};

function registerMove(id){
    console.log(id);
    map1_register = id===1;
    map2_register = id===2;
}
