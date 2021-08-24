const puppeteer = require('puppeteer'); 
require('css.escape');

const fnc = require("./functions");

// 'banco de la nacion argentina corrientes 5401'

// escrapeo
let scrape = async () => { 
    // carga navegador
    const browser = await puppeteer.launch({headless: false}); 
    // abre pagina
    const page = await browser.newPage(); 
    
    await page.goto('https://www.google.com.ar/maps/preview'); 
    await page.type('#gs_lc50','parque centenario') 
    await page.click('#searchbox-searchbutton');
    await page.waitForTimeout(5000); 

    // guardamos valores del lugar
    // console.log(await fnc.gettag(page, '848', 0)); // titulo
    // console.log(await fnc.gettag(page, '860', 0)); // valoración .
    // console.log(await fnc.gettag(page, '887', 0)); // cantidad de comentarios totales
    // console.log(await fnc.gettag(page, '868', 0)); // tipo de lugar
    // console.log(await fnc.gettag(page, '918', 0)); // Dirección
    // console.log(await fnc.gettag(page, '918', 1)); // Sitio web
    // console.log(await fnc.gettag(page, '918', 2)); // Plus Code

    // dias cerrados del lugar
    let info = await fnc.getInfo( page );
    console.log( info ); 

    // dias cerrados del lugar
    let diasCerrados = await fnc.getDayClosed( page , '1017' );
    console.log( diasCerrados ); 
    
    // concurrencia por día y hora en el lugar
    let barras = await fnc.getBars( page , diasCerrados , '1000' );
    console.log( barras ); 

    // cantidad de valoraciones por estrella
    let estrellas = await fnc.getStars( page , '1107' );
    console.log( estrellas ); 
    
    // extraigo tags
    tags = await fnc.getFreqWords ( page, '826', '829' , '830' );
    console.log( tags );

    // latitud y longitud 
    coords = await fnc.getCoords ( page.url() )
    console.log( coords )

    // cierro browser
    //browser.close(); 

};


scrape();

