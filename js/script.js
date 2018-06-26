$('.owl-carousel').owlCarousel({
    loop:false,
    margin:10,
    nav:true,
    responsive:{
        0:{
            items:5
        },
        600:{
            items:5
        },
        1000:{
            items:5
        }
    }
});

var serviceURL = "http://www.miguelmanchego.com/pages/intermezzo/";
var produs;
var curid = 0;
var contenido;
var user_id = 0;
var user_uuid = 0;


$(document).bind( "pagebeforechange", function( e, data ) {
    if ( typeof data.toPage === "string" ) {
        var u = $.mobile.path.parseUrl( data.toPage );
        var params = hashParams(u.hash);
        
        var re1 = /^#conciertos/;
        var re2 = /^#produccion/;
        var re3 = /^#avisos/;
        
        if ( u.hash.search(re1) !== -1 ) {
            getProducciones();
        } else if( u.hash.search(re2) !== -1 ){            
            getDetalleConcierto(u, params, data.options);            
            e.preventDefault()
        } else if(u.hash.search(re3) !== -1) {
            getAvisos();
        } else {
            //e.preventDefault();
        }
    }
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
    if($username == "") {
        $(".js-msgerror").html("<p>Por favor ingrese su usuario</p>");
    } else if($password == "") {
        $(".js-msgerror").html("<p>Por favor ingrese su clave</p>");
    } else {
        $(".js-msgerror").html("<p> </p>");
        /// Verificar logins
         $.getJSON(serviceURL + 'usuarios/login/', {
             username:$username,
             password:$password
         }).done(function(data) {
             //console.log("logeandose");
             datos = jQuery.parseJSON(data);
             user_id = datos.user_id;
             user_uuid = device.uuid;
             console.log("user: "+user_id+" uuid: "+user_uuid);
             if(user_id == "nay") {
                 $(".js-msgerror").html("<p>Usuario o clave incorrectos</p>");
             } else {
                 $.mobile.changePage("#avisos");
             }
        });
    }
});


function getAvisos() {        
        $.getJSON(serviceURL + 'producciones/mostraravisos/?user_id='+user_id).done(function(data) {
            $('.eventos__wrap').html("");    
            produs = data;
            $.each(produs, function(index, pela) {
                
                rpta = '<div class="aviso__item aviso__item--'+pela.aviso_id+'">';
                rpta += '<h2>Aviso</h2>';
                rpta += '<p>'+pela.texto+'</p>';
                rpta += '<p class="align-right">';
                rpta += '<a href="#" data-idaviso="'+pela.aviso_id+'" data-iduser="'+user_id+'" class="btn btn-verde btn-small js-avisook">Ok</a>';
                rpta += '</p>';
                rpta += '</div>';
                $(".aviso__wrapper").append(rpta);
                //$('#carteleraList').listview('refresh');    
            });
        });        
}

function getProducciones() {        
        $.getJSON(serviceURL + 'producciones/mostrar').done(function(data) {
            $('.eventos__wrap').html("");    
            produs = data;
            $.each(produs, function(index, pela) {
                rpta = '<a class="eventos__link eventolink'+pela.produccion_id+'" href="#produccion?id='+pela.produccion_id+'">';
                rpta += pela.titulo;
                rpta += '</a>';
                $(".eventos__wrap").append(rpta);
                //$('#carteleraList').listview('refresh');    
            });
        });        
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
    var id = curid;  
    contenido = produs[id];    
    rpta = '<h3>'+contenido.titulo+'</h3>';
        rpta += '<p>'+contenido.descripcion+'</p>';
        rpta += '<p><span>Fecha inicio: </span>'+contenido.inicio+'<br><span>Fecha fin: </span>'+contenido.fin+'</p>';
        rpta += '<p><span>Compositor: </span>'+contenido.compositor+'</p>';
    $(".concierto__info").html(rpta);
});

$(".js-audios").on("click", function() {
    var id = curid;  
    contenido = produs[id];    
    rpta = '<h3>'+contenido.titulo+'</h3>';
    rpta += '<ul class="audios"><li><audio controls><source src="http://miguelmanchego.com/pages/intermezzoapp/mp3/audio1.mp3" type="audio/mpeg">Your browser does not support the audio element.</audio> </li>';
    rpta += '<li><audio controls><source src="http://miguelmanchego.com/pages/intermezzoapp/mp3/audio2.mp3" type="audio/mpeg">Your browser does not support the audio element.</audio></li>';
    rpta += '</ul>';
    $(".concierto__info").html(rpta);
});

$(".js-eventos").on("click", function() {
    var id = curid;  
    contenido = produs[id];    
    rpta = '<h3>Eventos</h3>';
    rpta += '<p><strong>Miercoles 25/06/18 a las 17:30h</strong><br>Suspendisse vel finibus libero, ut hendrerit risus. Mauris egestas tellus nunc, quis pharetra tortor consequat ut. Morbi ultrices pretium scelerisque. Aenean eu porta diam, nec ornare lorem.</p>';
    rpta += '<p><strong>Lunes 22/06/18 a las 18:30h</strong><br>Suspendisse vel finibus libero, ut hendrerit risus. Mauris egestas tellus nunc, quis pharetra tortor consequat ut. Morbi ultrices pretium scelerisque. Aenean eu porta diam, nec ornare lorem.</p>';
    $(".concierto__info").html(rpta);
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