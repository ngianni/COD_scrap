const puppeteer = require('puppeteer'); 
require('css.escape');



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

    // await page.exposeFunction('getDay', getDay);

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

        let nodos = document.querySelectorAll("[jstcache=" + CSS.escape(cod) + "]")
        nodos.forEach( function (node) { dias.push( getDay( node.innerText ) ) } );
                
        return dias;

    }, codigo);

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

        function completeDias ( dias , dias_data ) {

            for ( node in dias_data ) {
                dias[node.dia][node.tiempo] = node.valor
            }

            return dias;

        }
        
        let dias = newDias()

        let nodos = document.querySelectorAll("[jstcache=" + CSS.escape(cod) + "]")
         
        let dias_info = nodesToValues ( nodos , diasCerrados )
        
        let barras = completeDias( dias , dias_info )
                
        return barras;

    } , closed, codigo );

    return concurrencia;
}

// 'banco de la nacion argentina corrientes 5401'

// escrapeo
let scrape = async () => { 
    // carga navegador
    const browser = await puppeteer.launch({headless: false}); 
    // abre pagina
    const page = await browser.newPage(); 
 
    await page.goto('https://www.google.com.ar/maps/preview'); 
    await page.type('#gs_lc50','banco de la nacion argentina corrientes 5401') 
    await page.click('#searchbox-searchbutton');
    await page.waitForTimeout(7000); 

    // guardamos valores del lugar
    console.log(await gettag(page, '848', 0)); // titulo
    console.log(await gettag(page, '860', 0)); // valoración .
    console.log(await gettag(page, '887', 0)); // cantidad de comentarios totales
    console.log(await gettag(page, '868', 0)); // tipo de lugar
    console.log(await gettag(page, '918', 0)); // Dirección
    console.log(await gettag(page, '918', 1)); // Sitio web
    console.log(await gettag(page, '918', 2)); // Plus Code


    // levanta barras de horas
    // var barras = document.querySelectorAll("[jstcache='943']");
    // levanta dias cerrados
    // var noDias = document.querySelectorAll("[jstcache='960']");

    // extraigo barras
    // document.querySelectorAll("[jstcache='943']").forEach( (node) => { console.log( node.outerText ) } );

    // extraigo array de días cerrados
    
    // let diasCerrado

    let diasCerrados = await getDayClosed( page , '1017' );
    console.log( diasCerrados ); 
  
    let barras = await getBars( page , diasCerrados , '1000' );
    console.log( barras ); 

 
     
    // cierro browser
    //browser.close(); 

};


scrape();

// nombre
// puntuacion
// cantidad de reviews
// tipo de lugar
// direccion
// sitio web
// horarios populares (array de arrays [lunes [x x x x ]; martes [x x x x ]; ...])
// distribucion estrellas
// palabras mas frecuentes
// latitud y longitud

// reviews:

// por cada filtro/tag (total 11):
//    -> por relevancia
//    -> por antiguedad
//    -> por mejor calificacion
//    -> por peor calificacion

// review:
//    -> nombre
//    -> local guide
//    -> opiniones
//    -> valoracion
//    -> fecha
//    -> review