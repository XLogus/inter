$(function() {
    refreshCarousel();
});

function refreshCarousel() {
$('.owl-carousel').owlCarousel({
    loop:false,
    margin:10,
    nav:true,
    responsive:{
        0:{
            items:4
        },
        600:{
            items:4
        },
        1000:{
            items:4
        }
    }
});

}

//var serviceURL = "http://www.miguelmanchego.com/pages/intermezzo/";
var serviceURL = "http://intermezzo-promusic.com/intermezzoapp/";
var produs;
var curid = 0;
var contenido;
var user_id = 0;
var user_uuid;
var user_platform;
var user_firstname = 0;
var user_registrationId;
var music;

$.ajaxSetup({ cache: false, crossDomain: true });



$(document).bind( "pagebeforechange", function( e, data ) {
    
    $('audio').each(function(){
        this.pause(); // Stop playing
        this.currentTime = 0; // Reset time
        //music.pause();
    }); 
    
    
    if ( typeof data.toPage === "string" ) {
        var u = $.mobile.path.parseUrl( data.toPage );
        var params = hashParams(u.hash);
        
        var re1 = /^#conciertos/;
        var re2 = /^#produccion/;
        var re3 = /^#avisos/;
        var re4 = /^#pasados/;
        var re5 = /^#mensaje/;
        
        
        if ( u.hash.search(re1) !== -1 ) {
            getProducciones();
        } else if( u.hash.search(re2) !== -1 ){            
            getDetalleConcierto(u, params, data.options);  
            $(".concierto__mp3").hide();
        } else if(u.hash.search(re3) !== -1) {
            getAvisos();
        } else if(u.hash.search(re4) !== -1) {
            getAvisos2();
        } else if(u.hash.search(re5) !== -1) {
            getProducciones2();
        } else {
            //e.preventDefault();
        } 
        
    }
    
    // detectar si estoy en la home 
    
    if (location.hash == "" || location.hash == "homepage") {
        verificaLogin();
    }
    
    
});

function verificaLogin() {
    if (window.localStorage.getItem("user_id") === null) {
        // Signifca que no se inicio sesion
        if (location.hash != "" || location.hash != "homepage") {
            document.location.hash = "#homepage";
        }
        console.log("no se inicio sesion");
    } else {
        user_id = window.localStorage.getItem("user_id");    
        user_firstname = window.localStorage.getItem("firstname");
        user_platform = window.localStorage.getItem("platform");
        user_uuid = window.localStorage.getItem("uuid");
        user_registrationId = window.localStorage.getItem("registrationId");
        console.log("sesion id:"+user_id);
        if (location.hash == "" || location.hash == "homepage") {
            document.location.hash = "#avisos";
        }
    }
}

// Salir
$("body").on("click", ".js-salir", function() {
    window.localStorage.clear();
    //document.location.hash = "#homepage";
    if (navigator.app) {
        navigator.app.exitApp();
    } else if (navigator.device) {
        navigator.device.exitApp();
    } else {
        window.close();
    }
    document.location.hash = "#homepage";
});


$(".aviso__wrapper").on("click", ".js-avisook", function() {
    //alert("notificado");
    $user_id = $(this).data("iduser");
    $aviso_id = $(this).data("idaviso");
     $.getJSON(serviceURL + 'producciones/notifica/?user_id='+$user_id+'&aviso_id='+$aviso_id).done(function(data) {
         $(".aviso__item--"+ $aviso_id).remove();
    });         
});


$(".js-acceder").on("click", function(event) {
    event.preventDefault();
    $username = $(".js-username").val();
    $password = $(".js-password").val();
    //user_uuid = window.localStorage.getItem("uuid");
    //user_platform = window.localStorage.getItem("platform");
    //user_registrationId = window.localStorage.getItem("registrationId");
    $user_uuid = $("#user_uuid").val();
    $user_platform = $("#user_platform").val();
    $user_registrationId = $("#user_registrationId").val();
    
    window.localStorage.setItem("uuid", $user_uuid);
    window.localStorage.setItem("registrationId", $user_registrationId);
    window.localStorage.setItem("platform", $user_platform);
    
    
    //user_uuid = device.uuid;
    if($username == "") {
        $(".js-msgerror").html("<p>Por favor ingrese su usuario</p>");
    } else if($password == "") {
        $(".js-msgerror").html("<p>Por favor ingrese su clave</p>");
    } else {
        $(".js-msgerror").html("<p> </p>");
        /// Verificar logins
         $.getJSON(serviceURL + 'usuarios/login/', {
             username:$username,
             password:$password, 
             uuid: $user_uuid,
             platform: $user_platform,
             registrationId: $user_registrationId
         }).done(function(data) {
             //console.log("logeandose");
             datos = jQuery.parseJSON(data);
             user_id = datos.user_id;    
             user_firstname = datos.firstname;
             window.localStorage.setItem("user_id", user_id);
             window.localStorage.setItem("user_firstname", user_firstname);
             
             $("h1.ui-title").html('<a href="#avisos">'+user_firstname+'</a>');
             console.log("user: "+user_id+" uuid: "+user_uuid);
             if(user_id == "nay") {
                 $("input.js-username").val("");
                 $("input.js-password").val("");
                 $(".js-msgerror").html("<p>Usuario o clave incorrectos</p>");                 
             } else {
                 $.mobile.changePage("#avisos");
             }
        });
    }
});

function getProducciones2() {    
    verificaLogin();
        $.getJSON(serviceURL + 'producciones/mostrar/?user_id='+user_id).done(function(data) {
            $('.eventos__wrap').html("");    
            produs = data;
            var rpta = "";
            $.each(produs, function(index, pela) {
                rpta += '<option value="'+pela.produccion_id+'">';
                rpta += pela.titulo;
                rpta += '</option>';                                                
            });
            $("#mensajeeve").html(rpta);
        }); 
}


function getAvisos() {     
    verificaLogin();
        $.getJSON(serviceURL + 'producciones/mostraravisos/?user_id='+user_id).done(function(data) {
            $('.eventos__wrap').html("");    
            produs = data;
            $(".aviso__wrapper").html("");
            $.each(produs, function(index, pela) {
                
                rpta = '<div class="aviso__item aviso__item--'+pela.aviso_id+'">';
                rpta += '<h2>Aviso <span>'+pela.fecha+'</span></h2>';
                rpta += '<p>'+pela.texto+'</p>';
                rpta += '<p class="align-right">';
                rpta += '<a href="#" data-idaviso="'+pela.aviso_id+'" data-iduser="'+user_id+'" class="btn btn-verde btn-small js-avisook">Ok</a>';
                rpta += '</p>';
                rpta += '</div>';
                $(".aviso__wrapper").append(rpta);
                //$('#carteleraList').listview('refresh');    
            });
        });   
        
       
        /* $user_uuid = window.localStorage.getItem("uuid");
        $user_platform = window.localStorage.getItem("platform");
        $user_registrationId = window.localStorage.getItem("registrationId");*/
        //$(".infoapp__wrapper").html( "uuid: "+   user_uuid + "platform: "+user_platform+"registrationID: "+ user_registrationId );
}

function getAvisos2() {     
    verificaLogin();
        $.getJSON(serviceURL + 'producciones/mostraravisos2/?user_id='+user_id).done(function(data) {
            $('.eventos__wrap').html("");    
            produs = data;
            $(".aviso__wrapper2").html("");
            $.each(produs, function(index, pela) {
                
                rpta = '<div class="aviso__item aviso__item--'+pela.aviso_id+'">';
                rpta += '<h2>Aviso <span>'+pela.fecha+'</span></h2>';
                rpta += '<p>'+pela.texto+'</p>';                
                rpta += '</div>';
                $(".aviso__wrapper2").append(rpta);
                //$('#carteleraList').listview('refresh');    
            });
        });   
}

function getProducciones() {    
    verificaLogin();
        $.getJSON(serviceURL + 'producciones/mostrar/?user_id='+user_id).done(function(data) {
            $('.eventos__wrap').html("");    
            produs = data;
            $.each(produs, function(index, pela) {
                rpta = '<a class="eventos__link eventolink'+pela.produccion_id+'" href="#produccion?id='+pela.produccion_id+'">';
                rpta += pela.titulo;
                rpta += '</a>';                
                //$('#carteleraList').listview('refresh');    
                $(".eventos__wrap").append(rpta);
            });
            linkmas = '<a href="#avisos" class="eventos__link">Volver</a>';
            $(".eventos__wrap").append(linkmas);
        }); 
    refreshCarousel();
}

function getDetalleConcierto(url, params, options) {
    if (typeof params['id'] === 'undefined' || params['id'] === null) {
        var id = curid;  
    } else {
        var id = params['id'];    
        curid = id;
    }
    
    var $page = $('#produccion');
    
    if(typeof produs == 'undefined' || produs === null) {
        getProducciones();
    } else {
        // Marcar activo
        $('.eventos__link').removeClass("active");
        $('.eventolink'+id).addClass("active");
        
        
        contenido = produs[id];
        rpta = '<h3>'+contenido.titulo+'</h3>';
        rpta += '<p>'+contenido.descripcion+'</p>';
        rpta += '<p><span>Fecha inicio: </span>'+contenido.inicio+'<br><span>Fecha fin: </span>'+contenido.fin+'</p>';
        rpta += '<p><span>Compositor: </span>'+contenido.compositor+'</p>';
        $(".concierto__info").html(rpta);
    }
    
    // Actualizar URL
    options.dataUrl = url.href;
    $.mobile.pageContainer.pagecontainer("change", $page, { 
        transition: 'flip',
        changeHash: true
    });
}

$(".js-planning").on("click", function() {
    $(".concierto__mp3").hide();
    if (typeof music !== 'undefined') { music.pause(); }
    var id = curid;  
    contenido = produs[id];
    rpta = '<h3>Planning</h3>';
    if(contenido.planning == "") {
        rpta += '<p>No se ha subido el planning</p>';
    } else {
        rpta += '<p><a target="_blank" href="'+serviceURL+'/uploads/'+contenido.planning+'" class="btn btn-verde btn-big">Descargar</a></p>';
    }
    $(".concierto__info").html(rpta);
});

$(".js-libreto").on("click", function() {
    $(".concierto__mp3").hide();
    if (typeof music !== 'undefined') { music.pause(); }
    var id = curid;  
    contenido = produs[id];
    rpta = '<h3>Libreto</h3>';
    if(contenido.libreto == "") {
        rpta += '<p>No se ha subido el libreto</p>';
    } else {
        rpta += '<p><a target="_blank" href="'+serviceURL+'/uploads/'+contenido.libreto+'" class="btn btn-verde btn-big">Descargar</a></p>';
    }
    $(".concierto__info").html(rpta);
});

$(".js-partitura").on("click", function() {
    $(".concierto__mp3").hide();
    if (typeof music !== 'undefined') { music.pause(); }
    var id = curid;  
    contenido = produs[id];
    rpta = '<h3>Partitura</h3>';
    if(contenido.libreto == "") {
        rpta += '<p>No se ha subido la partitura</p>';
    } else {
        rpta += '<p><a target="_blank" href="'+serviceURL+'/uploads/'+contenido.partitura+'" class="btn btn-verde btn-big">Descargar</a></p>';
    }
    $(".concierto__info").html(rpta);
});

$(".js-info").on("click", function() {
    $(".concierto__mp3").hide();
    if (typeof music !== 'undefined') { music.pause(); }
    var id = curid;  
    contenido = produs[id];    
    rpta = '<h3>'+contenido.titulo+'</h3>';
        rpta += '<p>'+contenido.descripcion+'</p>';
        rpta += '<p><span>Fecha inicio: </span>'+contenido.inicio+'<br><span>Fecha fin: </span>'+contenido.fin+'</p>';
        rpta += '<p><span>Compositor: </span>'+contenido.compositor+'</p>';
    $(".concierto__info").html(rpta);
});

$(".js-audios").on("click", function() {
    //if (typeof music !== 'undefined') { music.pause(); }
    $(".concierto__mp3").show();
    var id = curid;  
    contenido = produs[id];    
    audio1 = contenido.audio1;
    audio2 = contenido.audio2;
    audio3 = contenido.audio3;
    
    rpta = '<h3>'+contenido.titulo+'</h3>';
    /*
    rpta += '<div class="player__wrapper">';    
    rpta += '<a class="js-play btn--control" href="#">play</a>';
    rpta += '<progress id="seek-obj" value="0" max="1"></progress>';
    rpta += '<div class="musicduration"><span class="js-totalduration"></span> / ';
    rpta += '<span class="js-curtime"></span></div>';
    rpta += '<div class="js-pista"></div>';     
    rpta += '</div>';
    */
    
    /*
    rpta += '<ul class="audios">';    
    if(audio1 != "") {
        rpta += '<li><a class="js-eligepista" data-musica="'+audio1+'" href="#">Escuchar audio 1</a><audio controls><source src="'+audio1+'" type="audio/mpeg">Your browser does not support the audio element.</audio></li>';
    }
    if(audio2 != "") {
        rpta += '<li><a class="js-eligepista" data-musica="'+audio2+'" href="#">Escuchar audio 2</a></li>';    
    }
    if(audio3 != "") {
        rpta += '<li><a class="js-eligepista" data-musica="'+audio3+'" href="#">Escuchar audio 3</a></li>';    
    } 
    if(audio1 != "" && audio2 != "" && audio3 != "") {
        rpta += '<li>No se encontraron audios</li>';
    }
    */
    if(audio1 != "") {
        $("#audio1").attr("src", audio1);
        $("#audio1").show();
    } else {
        $("#audio1").hide();
    }
    if(audio2 != "") {
        $("#audio2").attr("src", audio2);
        $("#audio2").show();
    } else {
        $("#audio2").hide();
    }
    if(audio3 != "") {
        $("#audio3").attr("src", audio3);
        $("#audio3").show();
    } else {
        $("#audio3").hide();
    }
    
    
    //rpta += '</ul>';
    $(".concierto__info").html("");
    //setAudio(audio1);   
});

$(".js-eventos").on("click", function() {
    var id = curid;  
    contenido = produs[id];    
    rpta = '<h3>Eventos</h3>';
    rpta += contenido.eventos;
    
    $(".concierto__info").html(rpta);
});

// Enviar Mensaje
$(".js-enviarmsg").on("click", function() {
    $evento = $('#mensajeeve').val();
    $mensaje = $('#mensajetxt').val();
    if($mensaje != "") {
        $.getJSON(serviceURL + 'mensajes/enviar/?user_id='+user_id+'&evento='+$evento+'&mensaje='+$mensaje).done(function(data) {            
            produs = data;
            //$(".msj__wrap").html("<br><h3>Su mensaje fue enviado</h3>");
            $('.mensaje__rpta').html("Su mensaje fue enviado, en breve le contestaremos a su email.")
            $('#mensajetxt').val('');
        });  
    } else {
        $('.mensaje__rpta').html("Por favor ingrese un mensaje")
    }
});

// parse params in hash
function hashParams(hash) {
		var ret = {};
	    var match;
	    var plus   = /\+/g;
	    var search = /([^\?&=]+)=([^&]*)/g;
	    var decode = function(s) { 
	    	return decodeURIComponent(s.replace(plus, " ")); 
	    };
	    while( match = search.exec(hash) ) ret[decode(match[1])] = decode(match[2]);
	    
	    return ret
};


// Detectar ID y modelo de celular
/*
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    var element = document.getElementById('deviceProperties');
    element.innerHTML = 'Device Model: '    + device.model    + '<br />' +
                        'Device Cordova: '  + device.cordova  + '<br />' +
                        'Device Platform: ' + device.platform + '<br />' +
                        'Device UUID: '     + device.uuid     + '<br />' +
                        'Device Version: '  + device.version  + '<br />';
}

function onDeviceReady() {

    if(window.StatusBar) {
        StatusBar.overlaysWebView(false);
    }

    console.log("vaa");
    jQuery("#deviceProperties").html("encendido");
    

    var element = document.getElementById('deviceProperties');
    element.innerHTML = 'Device Model: '    + device.model    + '<br />' +
                        'Device Cordova: '  + device.cordova  + '<br />' +
                        'Device Platform: ' + device.platform + '<br />' +
                        'Device UUID: '     + device.uuid     + '<br />' +
                        'Device Version: '  + device.version  + '<br />';
    
}
*/

$(function() {
    $("[data-role=panel] ul").listview();
    $("[data-role=panel]").enhanceWithin().panel();
	FastClick.attach(document.body);    
});


/// BOF Audio player
$("body").on("click", ".js-play", function() {
    if (music.paused && !music.ended) {
        music.play();
        $(this).html("pause");
        $(this).addClass("pause");
    } else {
        music.pause();
        $(this).html("play");
        $(this).removeClass("pause");
    }
});

$("body").on("click", ".js-eligepista", function() {    
    music.pause();    
    mimusica = $(this).data("musica");
    console.log(mimusica);
    setAudio(mimusica); 
    
    music.play();
    $(".js-play").html("pause");
    $(".js-play").addClass("pause");
    
});

function setAudio(pista){
    music = new Audio(pista);    
    var progressbar = $("#seek-obj");    
    var currentTime;
    var duration
    
    music.addEventListener("loadedmetadata", function(_event) {
        var currentTime = music.currentTime | 0;
        var duration = music.duration | 0;
        
        var minutes = "0" + Math.floor(duration / 60);
        var seconds = "0" + (duration - minutes * 60);
        var dur = minutes.substr(-2) + ":" + seconds.substr(-2);
        
        var minutes = "0" + Math.floor(currentTime / 60);
        var seconds = "0" + (currentTime - minutes * 60);
        var cur = minutes.substr(-2) + ":" + seconds.substr(-2);
        
        $(".js-totalduration").html(dur); 
        //$(".js-pista").html(music.currentSrc);
        progressbar.val(currentTime/duration);
        document.getElementById('seek-obj').addEventListener("click", seek);
    });
    
    music.addEventListener("timeupdate", function(_event) {
        var currentTime = music.currentTime | 0;
        var duration = music.duration | 0;
        
        var minutes = "0" + Math.floor(currentTime / 60);
        var seconds = "0" + (currentTime - minutes * 60);
        var cur = minutes.substr(-2) + ":" + seconds.substr(-2);
        
        $(".js-curtime").html(cur);   
        progressbar.val(currentTime/duration);
    });
    
    
    function seek(event) {
        var percent = event.offsetX / this.offsetWidth;
        music.currentTime = percent * music.duration;
        progressbar.value = percent / 100;
    }
}
/// EOF Audio player