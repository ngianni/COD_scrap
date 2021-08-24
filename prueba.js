let a1 = '30% concurrido a la(s) 21:00.'
let a2 = 'Actualmente 30% concurrido, generalmente 7% concurrido.'
let b = 'Cerrado los domingos'

let url = 'https://www.google.com.ar/maps/place/Banco+de+la+Naci%C3%B3n+Argentina/@-34.5979497,-58.449445,15z/data=!3m1!4b1!4m5!3m4!1s0x95bcca0b37aa8031:0xaed31f7f75a1b53d!8m2!3d-34.59795!4d-58.4406902'

coords = url.slice(url.lastIndexOf('-34.'))

console.log( coords.split('!4d') )