/*
https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol#HTTP/1.1_example_of_request_/_response_transaction
versione ripulita (parse)
*/


// start:   node server.js da shell. Quindi attivare ANTEPRMA WEB (IN ALTO A DESTRA SULLA SHELL)
// semplice web server sulla directory corrente
// modules loading ( come include )
// https://nodejs.org/api/http.html#requestenddata-encoding-callback
// https://medium.com/stackfame/how-to-run-shell-script-file-or-command-using-nodejs-b9f2455cb6b7
//var Timer = require('time-counter');
var http  = require('http'); // https://www.w3schools.com/nodejs/ref_http.asp
var https  = require('https'); // https://www.w3schools.com/nodejs/ref_http.asp
//var https = require('https'); // https://www.w3schools.com/nodejs/ref_http.asp
var url   = require('url');   // https://www.w3schools.com/nodejs/ref_url.asp
var fs    = require('fs');     // https://www.w3schools.com/nodejs/ref_fs.asp

var qs    = require('querystring'); // https://nodejs.org/api/querystring.html#querystringparsestr-sep-eq-options
//const util= require('util');  // inutil
// server instance create and (listen()) starting
const sqlite3 = require('sqlite3').verbose();
//const end = process.hrtime.bigint();
//console. timeEnd("miao");
//console.log( BigInt.asIntN(32, (end-start)/1000n )  );

/*
process.on('SIGINT', () => {});  // CTRL+C --> close db
process.on('SIGQUIT', () => {}); // Keyboard quit
process.on('SIGTERM', () => {}); // `kill` command
*/


//let db = new sqlite3.Database('../DB/chinook.db', sqlite3.OPEN_READWRITE,  (err) => {
let db = new sqlite3.Database('./chinook.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the chinook database.');
});
// https://www.sqlitetutorial.net/sqlite-nodejs/connect/
// https://www.sqlitetutorial.net/sqlite-nodejs/quer
console.log("  richiesta multpla EACH (funzione chiamata per ogni riga)");  // stampa prima
db.serialize(() => {
  db.each(`SELECT PlaylistId as id,
                  Name as name
           FROM playlists where PlaylistId< 14`, (err, row) => {
    if (err) {
      console.error(err.message);
    }
    console.log(row.id + "\t" + row.name);
  });
});
let sql = {'play1': `SELECT PlaylistId id,
                  Name name
           FROM playlists
           WHERE PlaylistId  = ?` 
            , // ;  // CON PARAMETRO
           'art1' : `SELECT ArtistId Id ,Name name
            FROM artists
            where ArtistId =? ` ,
           'art2' : `SELECT ArtistId Id ,Name name
            FROM artists
            where ArtistId < ? `,
           'art3' : `SELECT * 
            FROM artists
            where ArtistId < ? `,
            'art4': `SELECT * 
            FROM artists
            where ArtistId < ? `,
            };
let playlistId = 1;
let artistId = 16;

console.log("  richiesta multpla ALL (funzione chiamata una sola volta)");  // stampa prima
db.all(sql['art4'], [artistId], (err, rows) => {
  if (err) {
    return console.error(err.message);
  }
  if (!rows) return console.log(`No artist found with the id z  ${playlistId}`);
  //rows.forEach( row => console.log( `${ row.Id } is  ${row.name}`)) ;
  rows.forEach( row => 
      Object.keys(row).forEach ( key => {  console.log( `${ row[key] }`) } ) );
      //row.forEach (k =>  console.log( `${ k }`)) ); 
});


console.log("  richiesta singola GET");  // stampa prima


// first row only
db.get(sql['play1'], [playlistId], (err, row) => {
  if (err) {
    return console.error(err.message);
  }
  return row ? console.log(row.id, row.name) : console.log(`No playlist found with the id ${playlistId}`);

});




/*
NON CHIUDO
db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Close the database connection.');
});
*/
/*
process.on('SIGINT', () => {});  // CTRL+C --> close db
process.on('SIGQUIT', () => {}); // Keyboard quit
process.on('SIGTERM', () => {}); // `kill` command
*/
process.on('SIGINT', () => {  // https://stackoverflow.com/questions/20165605/detecting-ctrlc-in-node-js
    db.close((err) => {
      if (err) {
        console.error(err.message);
         process.exit();  // that's all !
      }
      console.log('Close the database connection.');
      process.exit();  // that's all !
      });
//process.exit(); NON qui !!
});  // CTRL+C --> close db




var TT=http.createServer(
  // quando c'e' la richiesta di client viene chiamata la funzione seguente
  //   req contiene tutte le info della richiesta  https://nodejs.org/api/http.html#class-httpincomingmessage
  //   res va riempita con la risposta https://nodejs.org/api/http.html#class-httpserverresponse
  // https://nodejs.org/api/http.html#responseenddata-encoding-callback
  // search response.end

  function (req, res) {
    // next:true : returns obj. query is array object
    var q = url.parse(req.url, false);  // https://nodejs.org/api/url.html#url_url_parse_urlstring_parsequerystring_slashesdenotehost77
    var body, post0 = "", get0 = null;  // parameter handling
    var filename = "." + q.pathname;   // relative pathname
    // https://nodejs.org/api/fs.html#fs_fs_readfile_path_options_callback
    //if (req.method == 'POST') {
    // attivo la richiesta dei dati di post che arrivanoa blocchi
    // https://nodejs.org/docs/latest-v16.x/api/querystring.html
    // https://nodejs.org/zh-cn/knowledge/HTTP/clients/how-to-access-query-string-parameters/
    // https://nodejs.org/api/url.html#urlobjectquery
    get0 = q.query || ""; // GET stuff, if any
    // ora raccolgo i dati nel post
    req.on('data', function (data) {  // collect POST data
      post0 += data;
      if (post0.length > 100000)  // too big data
        req.connection.destroy();
    });

    req.on('end', function () {  // alla fine attivo la/le pagine
      if (post0 && get0)  // c'e' sia post che get
        body = post0 + "&" + get0
      else // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_operator
        body = (post0 || "") + (get0 || "")
        // body contiene come testo sia POST che GET
      const queryObject = qs.parse(body);  // POST GET MIXED into object
      
      // next infos: https://nodejs.org/api/util.html#utilformatformat-args
      console.log(q.pathname,  JSON.stringify(queryObject)) //  debug info
      // https://nodejs.org/api/url.html#urlparseurlstring-parsequerystring-slashesdenotehost
      //   q: oggetto richiesta   // https://nodejs.org/api/url.html#url_url_parse_urlstring_parsequerystring_slashesdenotehost77
      //   req contiene tutte le info della richiesta  https://nodejs.org/api/http.html#class-httpincomingmessage
      //   res va riempita con la risposta https://nodejs.org/api/http.html#class-httpserverresponse
      //   queryobject : tutti i parametri spediti da client
      // GESTIONE diretta di alcune semplici pagine  fuori menu
      var session=login(req, res, queryObject)
      if (!session)
        return;
      res.session=session; // allego a result struct          
      if (q.pathname == '/segreto') {  // pagina virtuale
        //res.writeHead(200, { 'Content-Type': 'text/html' , 'classe': 'IVSA' });
        res.writeHead(200, {"alberto":"ciao", 'classe': 'IVSA' ,5:7 });
        res.write("Hai trovato il Segreto!! ");  // all file data to client     https://nodejs.org/api/all.html#http_response_write_chunk_encoding_callback
        res.write("<button  onclick=\"location.href='/' \"  name=b value=c>torna a MAIN</button>");
        return res.end();
      }
      
      else if (q.pathname == '/pollo') {  // pag gestita dalla funzione pollo()
        pollo(req, res);
      }

      else if (q.pathname == '/ASY') { // !!! SPECIAL HANDLING for asynch data
        asy_handling(req, res, queryObject);
        }
      else if (q.pathname == '/') {
        main(req, res);
      }
      // 
      else if (q.pathname == '/trecampi') {
        trecampi(res, queryObject);  // prima chiamata : metodo get
      }
      else if (q.pathname == '/interessi') {
        interessi(res, queryObject);  // prima chiamata : metodo get
      }
      else if (q.pathname == '/anitra') {
        anitra(res, queryObject);
      }
      else { // try serving local file
        fs.readFile(filename, function (err, data) {
          // quando finisce di leggere il file viene chiamata questa funzione
          if (err) {  // error reading file -> generic page non found error
            res.writeHead(404, { 'Content-Type': 'text/html', "pippo": 'pluta' });   // https://nodejs.org/api/all.html#http_response_end_data_encoding_callback
            process.stdout.write("Error 404 " + filename + "\n");  // writes also to console
            res.write("<button  onclick=\"location.href='/' \"  name=b value=c>vai a MAIN page</button><br>");
            return res.end("<b>404</b>File Not Found <h2>" + filename); // https://nodejs.org/api/all.html#http_response_end_data_encoding_callback
          }
          // else: no error. Can send requested page if authorized
          var mt = get_weak_mime(filename);
          if (mt)
            {
            res.writeHead(200, { 'Content-Type': mt ,"Cache-Control": "max-age=60"}); // maybe
            res.write(data);  // all file data to client     https://nodejs.org/api/all.html#http_response_write_chunk_encoding_callback
            //console.log("pluto");
            return res.end();
            }
          else  
            {
            res.writeHead(401, { 'Content-Type': 'text/html' });   // https://nodejs.org/api/all.html#http_response_end_data_encoding_callback
            res.write("<button  onclick=\"location.href='/' \"  name=b value=c>vai a MAIN page</button>");
            return res.end("<b>401</b>Unauth<h2>" + filename); // https://nodejs.org/api/all.html#http_response_end_data_encoding_callback
            }
        }
        ); 
      };
    } 
    );
  }
);
TT.listen(8080);
//TT.listen(8081);

process.stdout.write("partito su porta 8080\n");

/**********************************************************************/
/*  */
/* 
 *             te */
/**********************************************************************/
function get_weak_mime(fn) 
{ // molto semplice: principali mime type
  var s = fn.toUpperCase().split(".") // esempio a.c.txt -> ["a","c","txt"]
  //console.log(fn,"--",s,s[1])
  var r = s[s.length - 1]; // ultimo pezzo di array (estensione)
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
  if (r == 'CSS')  return "text/css";
  if (r == 'TXT')  return "text/plain";
  if (r == 'HTML') return "text/html";
  if (r == 'PDF')  return "application/pdf";
  if (r == 'ICO')  return "image/vnd.microsoft.icon";
  if (r == 'JPG' || r == 'JPEG')     return "image/jpeg";
  if (r == 'PNG')  return "image/png";
  return "" ; // non authorized "application/octet-stream"; // all other
}

function pollo(req, res) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
  // TEMPLATE LITERAL
  // favicon avoiding: 
  res.write(`<!DOCTYPE html><html lang="en-US">
    <head>
    <meta charset="utf-8">
    <link rel="icon" href="data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA="></link>
    <link type='text/css' rel="stylesheet" href="mio.css">
     <!--<link rel="shortcut icon" href="favicon.png" />-->
    <script>
    var music1 = new Audio();
    function playMusic(a){
      //var music = new Audio(a); //'Chicken-SoundBible.com-744739895.mp3');
      if (a) {
        music1.src=a
        music1.play();
      } else music1.pause();
      }
   </script>   
   </head>
    <body>
    <!-- <input type="button" value="sound1" onclick="playMusic('Chicken.mp3')" />-->
    <input type="button" value="sound2" onclick="playMusic('https://notification-sounds.com/soundsfiles/Chicken-noises.mp3')" />
    <input type="button" value="sound3" onclick="playMusic('https://notification-sounds.com/soundsfiles/Clucking-chicken.mp3')" />
    <input type="button" value="sound4" onclick="playMusic('https://notification-sounds.com/soundsfiles/Angry-chicken.mp3')" />
    <input type="button"  value="stop sound" onclick="playMusic()" />
    <button  class=a onclick=\"location.href='/' \"  name=b value=c> Indietro</button> Hai provato il pollo!
    METHOD: ${req.method} 
    </body></html>
 `);
  return res.end();
}

function interessi(res, post)  // BMI
{
  var retu = '';
  
var interessi=parseFloat(post.interessi)
var rata=parseFloat(post.rata)
var rate=parseInt(post.rate)
var mesi=parseInt(post.mesi)
var capitale=parseInt(post.capitale)
if (isNaN(interessi)) interessi=10; 
if (isNaN(rate)) rate=60; 
if (isNaN(rata)) rata=0; 
if (isNaN(mesi)) mesi=1; 
if (isNaN(capitale)) capitale=10000; 
if ( interessi==0 ||rate==0 || capitale==0) retu=""; 
if(post.scelta==1 && interessi > 0 && interessi < 80 )
{
    interessix = interessi/ 100 /12*mesi
    if(rate>0 && rate<240)
    {
        if(rate%6==0)
        {
            if(capitale >=5000 && capitale<= 500000 && capitale%1000==0)
            {
                //var rata =  capitale*Math.pow((1+interessix),rate);
                rata=capitale*interessix /(1-1/Math.pow(1+interessix,rate))                
                retu = "La rata è " + rata.toFixed(2);
            } 
        }
    }
}
else if (post.scelta==2 && rata>0)
  {
  fun= (interessix) => {return   capitale*interessix /(1-1/Math.pow(1+interessix,rate)) -rata   }
  var fa,fb,fx,x,eps=1e-7
  a=0.0001 ; b=.4
  if (b-a <0) [a,b]=[b,a];
  fa=fun(a) ; fb=fun(b)
  if (fa*fb>0) retu = "L interesse è ??"
  do {
    x=.5*(b+a) ; fx=fun(x) ;
    console.log( fx);    
    if (fx*fa<0)
      {b=x;fb=fx;}
    else  
      {a=x;fa=fx;}
  } while (b-a>eps)
  retu = "L interesse è " + (b*100*12/mesi) .toFixed(2);

  }
  res.writeHead(200, { 'Content-Type': 'text/html' });
  // Sting interpolation in JS  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals

  res.write(`
  <!DOCTYPE html><html lang="en-US">
    <head>
    <meta charset="utf-8">
     <link rel="stylesheet" href="mio.css" type="text/css">
     <!--<link rel="shortcut icon" href="favicon.png" />-->
     <link rel="icon" href="data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA="></link>
    <script>
    </script>   
    </head>
  <body>
    <style>input {color:Black;} </style>
    <button  onclick="location.href='/' "  name=b value=c> MAIN</button>
    <button  onclick="location.href='pollo' " title='vai a poll0' name=b value=c> POLLO </button>
    <a href='./pollo'>vai a pollo</a>
    <form method=post>  
      <a title='Calcolo interessi' href=https://it.wikipedia.org/wiki/Ammortamento_a_rate_costanti#Modalità_di_calcolo_del_piano_di_rimborso target=a> Interessi</a> 
      <input  size=4 id=interessi name=interessi value='${interessi}'>
      Rate <input size=4 name=rate value='${rate}'>
      Mesi intervallo<input title="mesi tra una rata e l'altra, tipicamente 1" size=4 name=mesi value='${mesi}'>
      Capitale <input size=4 name=capitale value='${capitale}'>
      rata <input  size=4 name=rata value='${rata}'>
      <button name=scelta value=1 class="button-17">Calcolo rata</button> 
      <button name=scelta value=2 class="button-17">Calcolo interesse</button> 
         
    </form>
    <b>${retu}</b>  
    </body></html>
  `);  
  
  return res.end();
}


function trecampi(res, post)  // BMI
{
  var retu = 'Error';
  // ricavo l'array post del form spedita dall'utente
  //var post = qs.parse(body); // post is sent in body
  //console.log( post);
  var peso = parseFloat(post.peso);  // converto in numero. funziona anche con array (toString() )
  var altezza = parseFloat(post.altezza);
  if (isNaN(peso) || isNaN(altezza) ) 
    {
  if (isNaN(peso)) 
    peso = 89; // controllo se non numero
  
  if (isNaN(altezza)) 
    altezza = 178;
    retu= " inserisci dei valori" 
    }
  else
    {  
  if (peso > 10 && altezza > 2.3) // altezza in cm
    retu = "BMI= " + (10000 * peso / altezza / altezza).toFixed(1);
  else if (post.peso > 10 && post.altezza > 0)   // altezza in m
    retu = "BMI= " + (peso / altezza / altezza).toFixed(1);
    }
  res.writeHead(200, { 'Content-Type': 'text/html' });
  // Sting interpolation in JS  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals

  res.write(`
  <!DOCTYPE html><html lang="en-US">
    <head>
    <meta charset="utf-8">
     <link rel="stylesheet" href="mio.css" type="text/css">
     <!--<link rel="shortcut icon" href="favicon.png" />-->
     <link rel="icon" href="data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA="></link>
    <script>
    </script>   
    </head>
  <body>
    <style>input {color:orange;} </style>
    <button  onclick="location.href='/' "  name=b value=c> MAIN</button>
    <button  onclick="location.href='pollo' " title='vai a poll0' name=b value=c> POLLO </button>
    <a href='./pollo'>vai a pollo</a>
    <form method=post>  
      <a title='calcolo BMI' href=https://en.wikipedia.org/wiki/Body_mass_index target=a> peso</a> 
      <input  size=4 name=peso value='${peso}'>
      Altezza <input size=4 name=altezza value='${altezza}'>
      <button class="button-17">OK</button> 
         
    </form>
    <b>${retu}</b>  
    </body></html>
  `);  
  
  return res.end();
}

function anitra(res, post) {
  var v1=0,v2=0
  if (res.session.valore_v12) // memorizzato in sessione
    {
    v1=res.session.valore_v12[0]
    v2=res.session.valore_v12[1]
    }
  // se ci sono i nuovi valori li prendo
  if (!isNaN(parseFloat(post.v1)))
    v1 =parseFloat(post.v1);  // converto in numero
  if (!isNaN(parseFloat(post.v2)))
    v2 =parseFloat(post.v2);  // converto in numero
  //var v2 = parseFloat(post.v2); if (isNaN(v2)) v2 = 0;  // converto in numero
  res.writeHead(200, { 'Content-Type': 'text/html' });
  // all file data to client     https://nodejs.org/api/all.html#http_response_write_chunk_encoding_callback
  // if (post.pippolotta==1) 
  res.write(`
   <!DOCTYPE html><html lang="en-US">
    <head>
    <meta charset="utf-8">
     <link rel="stylesheet" href="mio.css">
     <!--<link rel="shortcut icon" href="favicon.png" />-->
     <link rel="icon" href="data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA="></link>
     <script>
      function x()
        {
        var a=parseFloat(document.getElementById('v1').value) + parseFloat(document.getElementById('v2').value) ;
        alert("somma " + a);
        }
     </script>
    </head>
    <body>
  <button onclick=\"x() \" name=b value=c> bottone</button>Hai trovato l'anitra 
  <button  onclick=\"location.href='/' \"  name=b value=c> MAIN</button>
  <form method=post>
  <table border=1>
     hai pigiato ${post.pippolotta}
     <tr><td>pippo<td><input id=v1 name=v1 value='${v1}'></tr>
     <tr><td>pluto<td class=a><input id=v2 name=v2 value='${v2}'></tr>
     </table>
     ${(v1 > 0 && v2 > 0) ? "Somma: " + (v1 + v2) : "metti i valori"}
     <input name=pippolotta value=funzione1 type=submit>
     <input name=pippolotta value=funzione2 type=submit>
     <input name=pippolotta value=funzione3 type=submit>
     </form>
  </body></html>
  `);
  res.session.valore_v12=[v1,v2];
  write_session(res.session);  
  return res.end();
}

function parseCookies(cookie)
// example Session= t32yt3yt34yt ; _ga=9879=111=798 ; ecc
{ // https://stackoverflow.com/a/3409200
  const list = {};
  const cookieHeader = cookie; // request.headers.cookie
  if (!cookieHeader)
    return list;
  cookieHeader.split(`;`).forEach(function (cookie)
      {
        let[name, ...rest] = cookie.split(`=`);
        name = name.trim();
        if (!name)
          return;
        const value = rest.join(`=`).trim(); // il testo puo contenere il simbolo=
        if (!value)   
          return;
        list[name] = decodeURIComponent(value); // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
      }
  );

  return list;
}
function test_user(us,pw)
  { // ovviamente da migliorare
  user_file_name='users.json';
  var ulist={}
   if (fs.existsSync(  user_file_name))
   {
     //console.log( "file utenti aperto");
      ulist=JSON.parse(fs.readFileSync(user_file_name) );
      //console.log( ulist.pippo);
   }
  else 
    console.log( "non apro il file utenti");
  if (ulist[us] && ulist[us].password== pw) 
      {
      return ulist[us]
      }
    //if (us=="pippo" && pw=="pippo") 
    //  return "pippo"   
    return null
  }

function read_expire_date(cookie_file_name) // legge da file la data di scadenza della sessione
  {  if (fs.existsSync(  cookie_file_name))
      return Date.parse(fs.readFileSync(cookie_file_name) ) ;
      return Date.parse('01 Jan 1970 00:00:00 GMT');  }

function read_session(cookie_file_name) // legge tutto il file di sessione
  {  if (fs.existsSync(  cookie_file_name))
      return JSON.parse(fs.readFileSync(cookie_file_name) ); // into associative array
      return {};  //  array associativo vuoto  
      }
function write_session(session) // scrive
  { fs.writeFileSync(session._file,JSON.stringify(session)) ;    
      }



function generateId(len)
{ // 
  var i = 0;
  var st = '';
  while (st.length < len)
  {  st += Math.random().toString(36).slice(2, 7);  } // base 36 0.9 A.Z
  return st.slice(0, len);
}
function login(req, res, post) {
  /*
  controllo se cookie esiste su disco e valido
  manca cancellazione file scaduti
  */
  var session;
  cookiename = "sessionId"  // nome del cookie di sessione
  cookielist = parseCookies(req.headers.cookie)  // leggo tutti i cookie del browser
  if (cookiename in cookielist)  // c'e' il nostro cookie
    usercookie = cookielist[cookiename]   // prendo il valore ( nome del file su server )
  else usercookie = "";
  //console.log("..UC: "+ usercookie  );
  dirname = "tmpcookie"  // sottodirectory dei cookie
  if (!fs.existsSync(dirname)) { fs.mkdirSync(dirname); }  // creo dir se non esiste (sincrono)
  if (post.logout)  // utente vuole terminare ?
    if (fs.existsSync(dirname + '/' + usercookie + '.txt'))
      fs.unlinkSync(dirname + '/' + usercookie + '.txt')  // cancello sessione da disco (unlink=delete)
  seconds = 3000;  // durata sessione
  expires = new Date(new Date().getTime() + seconds * 1000).toUTCString() // data scadenza
  if (usercookie) {  // c'e' un cookie dal client
    //dt=read_expire_date(dirname+'/'+usercookie+'.txt')
    session = read_session(dirname + '/' + usercookie + '.txt')
    dt = session._expires ? Date.parse(session._expires) : Date.parse('01 Jan 1970 00:00:00 GMT');
    if (dt > Date.now()) {  // non e' scaduto : continuo col normale programma
      return session; // continua il programma
    }
    usercookie = ''
  }
  // TEST ASYNCH REQUEST
  // IF (q.pathname=='/ASY')
  // emit 401 
  // 
  
  cookievalue = generateId(10);  // genero un codice casuale
  {
    var us1 = post.user
    var pw1 = post.password;
    var tizio = test_user(us1, pw1) // leggo nel (database) i dati utente
    if (tizio) {  // ok: tizio registrato
      if (!usercookie) {  // messaggio benvenuto e cookie
        usercookie = cookievalue  // nuovo valore di cookie
        //console.log( dirname+'/'+usercookie+'.txt'  );
        fs.writeFileSync(dirname + '/' + usercookie + '.txt', JSON.stringify(
          {
            "_expires": expires, "_user": tizio.user,
            "_userdata":tizio,  // tutti i dati user
            "_id": usercookie, "_file": dirname + '/' + usercookie + '.txt'
          }));
        //fs.writeFileSync(dirname+'/'+usercookie+'.txt', expires)  // es: tmpcookie/hmxdcuvixo.txt  
        // Set-Cookie: header speciale  https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie  
        res.writeHead(200, {
          'Content-Type': 'text/html',
          'Set-Cookie': cookiename + '=' + cookievalue + " ; expires=" + expires
        });
        res.write(`<!DOCTYPE html><html lang="en-US"><head>  <meta charset="utf-8">
          <link rel=\"icon\" href=\"data:,\"></link>
          </head><body>
           <h3>benvenuto ${tizio.user}        </h3>
          <a href='/' >vai al main</a>
          </body></html>
          `);
        res.end();
        return false;  // non continua nel main flow
      }
      //return session; // continua com main flow
    }
    else { // tizio non registrato
      res.writeHead(200, {
        'Content-Type': 'text/html',
        'other-heading': 'set'
      });
      res.write(`<!DOCTYPE html><html lang="en-US"><head>  <meta charset="utf-8">
          <link rel=\"icon\" href=\"data:,\"></link>
          </head><body>
          <h3>LOGIN
          <form>
          <table border=2>
            <tr><td><label for="user">User:</label>
            <td><input type="text" id="user" name="user"><br>
            </tr><tr><td><label for="password">Password:</label>
            <td><input type="password" id="password" name="password"><br>
            </tr><tr><td><input type=submit name=submit value=ok>
            </tr>
          </table></form>
          </h3>
          </body></html>
         `);
      res.end();
      return false;
    }
  }

}

function solve ( a ,b ,fun )
  { // cerca soluzione (zero) a fun tra a e b. se non la trova, restituisce a
  var fa,fb,fx,x,eps=1e-7
  if (b-a <0) [a,b]=[b,a];
  fa=fun(a) ; fb=fun(b)
  if (fa*fb>0) return null;
  do {
    x=.5*(b+a) ; fx=fun(x) ;
    if (fx*fa<0)
      {b=x;fb=fx;}
    else  
      {a=x;fa=fx;}
  } while (b-a>eps)
  return b;
  }




function main(req, res) {
  res.writeHead(200, { 'Content-Type': 'text/html',
         'other-heading':'set' });
  res.write(`<!DOCTYPE html><html lang="en-US"><head>
  <meta charset="utf-8">
  <link rel=\"icon\" href=\"data:,\"></link>
</head><body>
${res.session._user}
 <h3>MAIN
  <h_1 ${res.session._user== "pippo"?"":" hidden " }>
  
  <a href=./pollo>Pollo</a></h_1> `)

  if ( res.session._userdata.disable.indexOf('anitra') ==-1)     
    res.write("<a href=anitra>anitra</a> ")
 
  //if (res.session._user!= "pippo")
   res.write(" <a   href=./trecampi>trecampi (BMI)</a> ")
   if ( res.session._userdata.disable.indexOf('tabe') ==-1)     
    res.write(" <a href=./tabe.html>tabellina</a >");
   if ( res.session._userdata.disable.indexOf('interessi') ==-1)     
    res.write(" <a href=./interessi>interessi</a >");
  //if (res.session._user!= "pippo")
  if ( res.session._userdata.disable.indexOf('tabeASY')== -1 )  
    res.write("  <a href=./tabeASY.html style=' color:coral; '>Tabellina Asincrona</a> ")
  else   
     res.write("  <a  >tabellina asincrona</a> ")
  res.write( ` <a href=/?logout=1>logout</a>
  </h3>
  </body></html>
  `);
  return res.end();
}

function tabe(n)  // somma l'eventuale valore numerico e lo mostra a utente
{  // used by ASY
  var txt
  if (n < 2 || n > 1000)
    txt = " Dati non validi"
  else {
    txt = "<table border=1><thead><tr><th>"
    for (i = 1; i <= n; i++) { txt += "<th>" + i; }
    txt += "</tr>" // fine intestazione 
    txt += "<tbody>" //<tr><td>" + 
    for (i = 1; i <= n; i++)  // righe
    {
      txt += "<tr><th>" + i;
      for (j = 1; j <= n; j++)  // colonne
      { txt += `<td title='${i}x${j}=${i * j}'> ${i * j}`; }  // backtick alt 96```
      // { txt += "<td>"+  (i * j) ; }  // backtick alt 96```
      txt += "</tr>"
    }
  }
  
  return txt;
}

function funzione_pow(nume, exp01) { // used by ASY
  return Math.pow(nume, exp01); // todo
}

// https://stackoverflow.com/questions/19739755/nodejs-callbacks-simple-example


function qry(q_name, par1, fun) { // fun : funzione da chiamare a fine estrazione

  let sql = {
    'play1': `SELECT PlaylistId id,
                  Name name
           FROM playlists
           WHERE PlaylistId  = ?`
    , // ;  // CON PARAMETRO
    'art1': `SELECT ArtistId Id ,Name name
            FROM artists
            where ArtistId =? `};
  let playlistId = 1;
  var ret = "";
  // first row only
  db.get(sql[q_name], [par1], (err, row) => {
    if (err) {
      console.error(err.message);
      ret = `<b>Error in query ${q_name}</b>`;
    }
    if (row) {
      console.log(row.id, row.name);
      //return "0";
      ret = row.name;
    }
    else {
      console.log(`No playlist found with the id ${playlistId}`);
      ret = "<b>ID not found in query</b>";
    }
    //return "0";
    fun(ret);
    //res.write("" + ret);
    //return res.end(); // termino responso per client
  });
}

function qry_json(q_name, par1, fun) { // fun : funzione da chiamare a fine estrazione
  let sql = {
    'art3': `SELECT * 
            FROM artists
            where ArtistId <= ? `,
    // altre query
  };
  let ret="-";
  db.all(sql[q_name], [par1], (err, rows) => {
     
    if (err) {
      ret = JSON.stringify("Query error for " + q_name);
      
    }
    else {
      //console.log("---"+ret); 
      ret = JSON.stringify(rows);
      //console.log(ret);
      }
  //console.log("---"+ret);  
  fun(ret);    
  })
  
}

const options_1 = {  // parametri per la richesta a air-quality.p.rapidapi.com (si veda su rapidAPI.com)
	method: 'GET',
	hostname: 'air-quality.p.rapidapi.com',
	port: null,
	path: '/history/airquality?lon=-78.638&lat=35.779',
	headers: {
		'X-RapidAPI-Key': '4be2f042cbmshd29f2b6196663d5p1ba052jsnb00e7121d920',
		'X-RapidAPI-Host': 'air-quality.p.rapidapi.com'
	}
};


function qry_indirect(par0, par1, fun) { // fun : funzione da chiamare a fine estrazione
  console.log("no2");
  options_1.path = `/history/airquality?lon=${par0}&lat=${par1}`;  // parametri utente
  const req = https.request(options_1, function (res) {  // uso https
    const chunks = [];
    console.log("no");
    res.on('data', function (chunk) {  // la risposta arriva un po alla volta
      chunks.push(chunk);
    });

    res.on('end', function () {
      const body = Buffer.concat(chunks); // unisce tutti i pezzi di stringa
      console.log(body.toString().substring(1, 200)); // solo una parte della risposta a video sul server
      fun(body); // call back per l'invio al client
    	});
});

req.end(); // send request
}


function asy_handling(req, res, post) { // asynch req, server sie
  var ret0 = ''
  // API dictionary https://api.mymemory.translated.net/get?q=german%20shepard&langpair=en|it
  // lots of api source: https://mixedanalytics.com/blog/list-actually-free-open-no-auth-needed-apis/
  let txt1 = "dato mancante"
  
  if (req.headers.tabe) // tabellina asincrona: esiste header "tabe"
  { // is a asynch req with "tabe" header
    if (post.nume)  // reperisce dato
      txt1 = tabe(post.nume)
    //console.log(qry('play1',post.nume));
    res.writeHead(200, { 'Content-Type': 'application/txt' }); // write back to client full  data
    return res.end(txt1);
  }
  else if (req.headers.pow) // tabellina asincrona: esiste header "tabe"
  { // is a asynch req with "tabe" header
    if (post.nume && post.exp)  // reperisce dato
    {
      //txt1 = funzione_pow(post.nume,post.exp).toString()
      txt1 = "" + funzione_pow(post.nume, post.exp)
    }
    res.writeHead(200, { 'Content-Type': 'application/txt' }); // write back to client full  data
    return res.end(txt1); // termino responso per client
  }
  else if (req.headers.play) // tabellina asincrona: esiste header "tabe"
  { // is a asynch req with "tabe" header
    if (post.nume)  // reperisce dato
    {
      //txt1 = funzione_pow(post.nume,post.exp).toString()
      //txt1 ="" + funzione_pow(post.nume,post.exp)
      res.writeHead(200, { 'Content-Type': 'application/txt' }); // write back to client full  data
      qry('play1', post.nume, (txt1) => {
        res.write(txt1);
        return res.end(); // termino responso per client
      });
    }
    else {
      res.write("<b>Empty code</b>");
      return res.end(); // termino responso per client
    }
  }
  else if (req.headers.artists) // tabella artisti
  { // is a asynch req with "tabe" header
  
    if (post.nume)  // reperisce dato
    {
      //txt1 = funzione_pow(post.nume,post.exp).toString()
      //txt1 ="" + funzione_pow(post.nume,post.exp)
      //console.log('artist',post.nume);
      res.writeHead(200, { 'Content-Type': 'application/txt' }); // write back to client full  data
      qry_json('art3', post.nume, (json1) => {
        res.write(json1);
        return res.end(); // termino responso per client
      });
    }
    else {
      res.write("<b>Empty code</b>");
      return res.end(); // termino responso per client
    }
  }
  else if (req.headers.airq) // tabella 
  { // is a asynch req with "tabe" header
  
    if (post.lat0)  // reperisce dato
    {
      //txt1 = funzione_pow(post.nume,post.exp).toString()
      //txt1 ="" + funzione_pow(post.nume,post.exp)
      //console.log('artist',post.nume);
      console.log("no1");
      // write back to client full  data
      qry_indirect( post.lat0,post.lon0, (json1) => {
        res.writeHead(200, { 'Content-Type': 'application/txt' }); 
        res.write(json1);  // tutto indietro al client
        return res.end(); // termino responso per client
      });
    }
    else {
      res.writeHead(200, { 'Content-Type': 'application/txt' });
      res.write("<b>Empty code</b>");
      return res.end(); // termino responso per client
    }
  }
  else  // not asynch correct  -> 401
  {
    res.writeHead(401, { 'Content-Type': 'text/html' });
    res.write("<h2>401 not auth"+req.headers.airq);
    return res.end();
  }
}

