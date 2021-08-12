const puppeteer = require('puppeteer'); 
require('css.escape');



// funcion para buscar un elemento por codigo jstcache

// uso: gettag(page, '848')
// async function gettag(page, codigo) { await page.evaluate( f(cod), codigo ) } 
async function gettag(page, codigo) {
  const element = await page.evaluate( (cod) => {

        let selector = document.querySelector("[jstcache=" + CSS.escape(cod) + "]");
        // return selector.nodeName;
        switch (selector.nodeName) {
            case 'SPAN':
                return selector.innerText;
                break;
            case 'BUTTON':
                return selector.nodeValue;
                break;
            default:
                return console.log('error');
                break;
          };    
        //   return document.querySelector('[jstcache="848"]').innerText;
            // console.log('pueba')
            // console.log(document.querySelector("[jstcache=" + CSS.escape(cod) + "]").innerText);;
            
        },
  codigo);
  return element;
}



// escrapeo
let scrape = async () => { 
    // carga navegador
    const browser = await puppeteer.launch({headless: false}); 
    // abre pagina
    const page = await browser.newPage(); 

    await page.goto('https://www.google.com.ar/maps/preview'); 
    await page.type('#gs_lc50','Estacion Quilmes') 
    await page.click('#searchbox-searchbutton');
    await page.waitForTimeout(3000); 


    // prueba 
    // var nico = "848";
    // prueba = await page.evaluate((nico) => {return document.querySelector("[jstcache=" + CSS.escape(nico) + "]").innerText});
    // console.log(prueba);    

    // codigos jstcache de tags
    const tags = {titulo:"848", valoracion:"875", comentario:"887", tipo_lugar:"885"};
    //
    for (x in tags){
        console.log(await gettag(page, tags[x] )); // titulo []
    }
            
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