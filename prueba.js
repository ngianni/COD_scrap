let a1 = '30% concurrido a la(s) 21:00.'
let a2 = 'Actualmente 30% concurrido, generalmente 7% concurrido.'
let b = 'Cerrado los domingos'

// devuelve un array con porcentaje de concurrencia y horario
// a partir de un string. 

function getBar( texto ) {
  
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

console.log( getBar(a1) )
console.log( getBar(a2) )

