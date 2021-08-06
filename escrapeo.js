const puppeteer = require('puppeteer'); 

// codigos jstcache de tags
var titulo = '[jstcache="848"]'


gettag = async () => {
  const element = await page.evaluate(() => {
      // nombre del lugar
      return document.querySelector('[jstcache="848"]').innerText;

      });
  return element
}


// escrapeo
let scrape = async () => { 

    const browser = await puppeteer.launch({headless: false}); 

    const page = await browser.newPage(); 

    await page.goto('https://www.google.com.ar/maps/preview'); 
    await page.type('#gs_lc50',' Estacion Quilmes') 
    await page.click('#searchbox-searchbutton');
    await page.waitForTimeout(3000); 



    console.log(gettag())

    // const element = await page.evaluate(() => {
    //   // nombre del lugar
    //   return document.querySelector('[jstcache="848"]').innerText;

    // });




    // console.log(element)
    // console.log("Hasta aca estamos")


    //browser.close(); // Close the Browser...

    
};




scrape().then((value) => { 

    console.log(value); 

});
