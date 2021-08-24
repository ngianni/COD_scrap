// devuelve la información disponible en el header del lugar
async function getInfo(page) {

    const element = await page.evaluate( () => {
        
        // controla si un elemento es nulo, y devuelve "ND"
        function checkelement(element){
            (element == null) ? element = 'ND' : element = element.innerText;
            return element
        }

        // --- seccion header --- //
        let header = document.getElementsByClassName('x3AX1-LfntMc-header-title')[0]

        // nombre del lugar
        let nombre = header.getElementsByClassName('x3AX1-LfntMc-header-title-title')[0]
        nombre = checkelement(nombre)

        // estrellas
        let estrellas = header.getElementsByClassName('aMPvhf-fI6EEc-KVuj8d')[0]
        estrellas = checkelement(estrellas)

        // cantidad de opiniones
        let opiniones = header.getElementsByClassName('h0ySl-wcwwM-E70qVe-rymPhb')[0]
        opiniones = (opiniones) ? opiniones.getElementsByClassName('OAO0-ZEhYpd-vJ7A6b OAO0-ZEhYpd-vJ7A6b-qnnXGd')[0] : opiniones;
        opiniones = checkelement(opiniones)

        // costo (si existe)
        let costo = header.getElementsByClassName('h0ySl-wcwwM-E70qVe-rymPhb')[0]
        costo = (costo) ? costo.querySelector('[aria-label^="Precio:"]') : costo;
        costo = checkelement(costo)

        // tipo de establecimiento
        let tipo = header.getElementsByClassName('gm2-body-2')[1]
        tipo = checkelement(tipo)

        // --- sección informacion --- //
        let info = document.querySelector('[aria-label^="Información para"]')

        // direccion
        let direccion = info.querySelector('[aria-label^="Dirección:"]')
        direccion = checkelement(direccion)

        // sitio web
        let web = info.querySelector('[aria-label^="Sitio web:"]')
        web = checkelement(web)

        // telefono
        let telefono = info.querySelector('[aria-label^="Teléfono:"]')
        telefono = checkelement(telefono)

        // plus code
        let pluscode = info.querySelector('[aria-label^="Plus"]')
        pluscode = checkelement(pluscode)

        // el lugar no está reclamado
        let reclamar  = info.querySelector('[data-item-id="merchant"]')
        reclamar = checkelement(reclamar)

        // menu del lugar (si aplica)
        let menu = info.querySelector('[data-item-id="menu"]')
        menu = checkelement(menu)

        // delivery del lugar (si aplica)
        let delivery = info.querySelector('[data-item-id="action:4"]')
        delivery = checkelement(delivery)

        // sitio para reservar (si aplica)
        let reservas = info.querySelector('[data-item-id="action:3"]')
        reservas = checkelement(reservas)

        // horarios de apertura
        let tabla    = info.getElementsByClassName('OqCZI gm2-body-2 WVXvdc')[0]
        let horarios = []

        if (tabla) {
            tabla = tabla.children[1]
            tabla = tabla.getElementsByTagName('table')[0]
            let filas = tabla.getElementsByTagName('tr')

            for ( i = 0 ; i < filas.length ; i++ ) {
                horarios.push({
                    dia: filas[i].children[0].innerText,
                    horario: filas[i].children[1].children[0].innerText
                })
            }
        } else {
            horarios = 'ND';
        }

        // --- sección atributos --- //
        
        let atributos = []
        if (atts) {
            
            
            atts = atts.getElementsByTagName('button')[0]
            atts.click()
            let data = document.getElementsByClassName('section-layout section-scrollbox cYB2Ge-oHo7ed cYB2Ge-ti6hGc')[0]
            // alert('abre')
            alert( data.innerText )

        } else {
            atributos = 'ND'
        }

        // 
        // creo objeto con la info levantada
        let place_info = {
            lugar: nombre,
            estrellas: estrellas,
            opiniones: opiniones,
            costo: costo,
            categoria: tipo,
            direccion: direccion,
            tel: telefono,
            web: web,
            pluscode: pluscode,
            menu: menu,
            delivery: delivery,
            reservas: reservas,
            reclamar: reclamar,
            horarios: horarios
        }

        console.log( place_info )
        return place_info;

    }); 

  return element;
}

// Devuelve el texto de un elemento dentificado pot jstcache. 
// El index selecciona el elemento del array devuelto por querySelectorAll
async function gettag(page, codigo, index) {

    const element = await page.evaluate( (cod,x) => {

        // async function gettag(page, codigo) { await page.evaluate( f(cod), codigo ) } 
        let selector = document.querySelectorAll("[jstcache=" + CSS.escape(cod) + "]")[x].innerText;
        return selector;

    }, codigo, index);

  return element;
}

// devuelve los días cerrados de un sitio
async function getDayClosed (page , codigo) {

    const days_array = await page.evaluate( (cod) => {

        // devuelve el día cerrado de un string 
        // (ej: 'Cerrado los domingos' -> 'domingos')
        const getDay = function ( cadena ){

            // extraigo dia de la cadena
            cadena = cadena.split(" ").pop();                                 // tomo ultima palabra del string
            cadena = cadena.toLowerCase();                                    // convierto a minusculas
            cadena = cadena.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // quito acentos
            
            // llevo a singular los dias plurales
            if (cadena == 'sabados' || cadena == 'domingos'){ 
                cadena = cadena.slice(0, -1);
            }
    
            return cadena;
        }

        let dias = [];
        let nodos = document.querySelector('[aria-label^="Horarios de mayor concurrencia"]')
        // let nodos = document.querySelectorAll("[jstcache=" + CSS.escape(cod) + "]")

        if (nodos) {

            nodos = nodos.getElementsByClassName('section-popular-times-container')[0]

            for (let i = 0 ; i < nodos.length ; i++) {

                nodo = nodos.children[6].getElementsByClassName('section-popular-times-message')[0].firstChild
                dias.push( getDay( nodo.innerText ) )
                
            }
        }
                
        return dias;

    }, codigo);

    console.log( days_array );
    return days_array;
}

// devuelve un objeto con pares dias-porcentajes concurrencia
async function getBars (page , closed , codigo ) {

    const concurrencia = await page.evaluate( ( diasCerrados, cod ) => {

         // devuelve un array con porcentaje de concurrencia y horario a partir de un string.   
        function getTimeVal( texto ) {
        
            // cantidad de % en el texto
            let cant = (texto.match(/%/g) || []).length;
            // posicion del ultimo %
            let pos = texto.lastIndexOf('%');
        
            let recorte_valor
            let recorte_hora
        
            
            if ( cant == 2 ) { // si hay dos porcentajes (porque es el horario actual) devuelve el segundo
            recorte_valor = parseInt( texto.slice( pos - 2 , pos ) );
            recorte_hora  = 99; // si no hay horario, devuelve código 99
            } 
            else {
            recorte_valor = parseInt( texto.slice(  0 , pos ) );
            recorte_hora  = parseInt( texto.slice( -6 , -4  ) );
            }
        
            let valor_hora = { valor: recorte_valor, tiempo: recorte_hora };
        
            return valor_hora;
        }

        // crea un diccionario de arrays. cada key es un día de la semana, y cada value es un array 
        // correspondiente a cada hora del día, inicializado en 0.
        function newDias () {

            // crea abjeto con elementos vacios
            let dias = {
                domingo:   [],
                lunes:     [],
                martes:    [],
                miercoles: [],
                jueves:    [],
                viernes:   [],
                sabado:    []
            }  
            
            // llena arrays con ceros (24, uno para cada hora del dia)
            for ( dia in dias ) {
                // console.log( dias[dia] )
                dias[dia].length = 24; 
                dias[dia].fill(0);
              }

            return dias
        }

        // convierte los nodos con datos de las barras a un array de objetos, con {valor, hora, dia}
        function nodesToValues ( nodos , cerrados ) {

            let arr = []
            
            // convierte nodos a un array de objetos valor-tiempo
            for ( nodo of nodos ){
                arr.push( getTimeVal( nodo.ariaLabel ) )
            }
            
            // si hay un codigo 99, lo reemplaza por su horario correspondiente
            for ( i = 0 ; i < arr.length ; i++ ) {
                if ( arr[i].tiempo == 99 ) {
                    if      ( i == 0)                { arr[i].tiempo = arr[i + 1].tiempo - 1 }                  // el 99 está al inicio de los nodos
                    else if ( i == (arr.length -1) ) { arr[i].tiempo = arr[i - 1].tiempo + 1 }                  // el 99 está al final de los nodos
                    else if ( arr[i+1].tiempo > arr[i-1].tiempo ) { arr[i].tiempo = arr[i - 1].tiempo + 1 }     // el 99 está en el medio, y el horario siguiente es mayor que el anterior
                    else if ( arr[i+1].tiempo < arr[i-1].tiempo ) { arr[i].tiempo = arr[i + 1].tiempo - 1 }     // el 99 está en el medio, y el horario siguiente es menor que el anterior (cambio de día)
                }
            }

            for ( i = 0 ; i < arr.length ; i++){
                if ( isNaN( arr[i].tiempo ) ) {
                    arr.splice(i,1)
                }
            }

            let dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
            let pos = 0;
            let len = arr.length;

            loop1: 
            for ( j = 0 ; j < dias.length ; j++ ) {

                if ( cerrados.includes( dias[j] ) ) { continue;}

                loop2: 
                for ( ; pos < len ; pos++ ) {

                    if ( pos == 0 ) {
                        arr[pos].dia = dias[j]
                    } else if ( arr[pos].tiempo > arr[pos-1].tiempo ) {
                            arr[pos].dia = dias[j]
                    } else {
                        arr[pos].dia = dias[j+1];
                        pos++;
                        break loop2;
                    }
                }
            }

            return arr;
        }

        // completa el objeto días con la info en dias_data
        function completeDias ( dias_arr , dias_data ) {

            for ( node of dias_data ) {
                dias_arr[node.dia][node.tiempo] = node.valor
            }

            return dias;

        }
        
        let dias = newDias()
        let nodos = document.querySelectorAll("[jstcache=" + CSS.escape(cod) + "]")
        let dias_info = nodesToValues ( nodos , diasCerrados )
        let barras = completeDias( dias , dias_info )
        
        console.log(barras);

        return barras;

    } , closed, codigo );

    return concurrencia;
}

// devuelve un objeto con pares estrella-cantidad valoraciones
async function getStars (page , codigo ) {

    const estrellas = await page.evaluate( ( cod ) => {

        // devuelve el porcentaje a partir del style 
        function getValue (cadena) {

            let patron = 'padding-left: ';

            cadena = cadena.slice(cadena.lastIndexOf(patron) + patron.length);
            cadena = cadena.slice( 0 , -1 );
            
            let valor = parseFloat( cadena );

            return valor;
        } 

        let nodos = document.querySelectorAll("[jstcache=" + CSS.escape(cod) + "]")

        let valoraciones = document.querySelectorAll("[jstcache='1095']")[0].innerText
        valoraciones = parseInt(valoraciones.slice( 0, valoraciones.indexOf(" ")))

        let stars = []
        
        for ( i = 0 ; i < nodos.length ; i++ ) {
            stars[i] = { 
                estrellas: 5-i,
                porc: Math.round( getValue(nodos[i].style.cssText) * 10 ) / 10 
            }
        }

        let total_porc = 0
        stars.forEach( d => {total_porc +=  d.porc} )

        for ( star of stars ) {
            star.cant = Math.round(star.porc * valoraciones / total_porc)             
        }
 
        console.log(stars)

        return stars;


    } , codigo );

    return estrellas;
}

// extrae coordenadas de una url
function getCoords ( url ){
    
    url = url.slice(url.lastIndexOf('-34.'));
    let coords = url.split('!4d') ;
    coords = { lat : coords[0] , long: coords[1] }

    return  coords;

}

// devuelve un array de objetos { tagfrecuente , frecuencia }
async function getFreqWords (page , codigo1, codigo2, codigo3 ) {

    const freqtags = await page.evaluate( ( cod1, cod2, cod3 ) => {

        let ftags = []
        let nodos = document.querySelectorAll("[jstcache=" + CSS.escape(cod1) + "]")

        nodos.forEach( nodo => {
            let tag = nodo.querySelectorAll("[jstcache=" + CSS.escape(cod2) + "]")[0].innerText;
            let freq = nodo.querySelectorAll("[jstcache=" + CSS.escape(cod3) + "]")[0].innerText;
            ftags.push( { tag: tag , freq: freq})
        })

        console.log(ftags);

        return ftags;


    } , codigo1, codigo2, codigo3 );

    return freqtags;
}



// exporto funciones 
module.exports = {
    getInfo, 
    gettag,
    getDayClosed,
    getBars,
    getStars,
    getCoords,
    getFreqWords
 };