function crea_tabella_da_query_sqlite_json(json0) {
  // json0: text . esempio [{"ArtistId":1,"Name":"AC/DC"},...,...] array di oggetti
  // se c'e' almeno una riga, leggo le intestazioni
  let tbl = JSON.parse(json0);
  let t = "<table class='table' border=1><tr>";
  if (tbl.length > 0) {
    campi = Object.keys(tbl[0]);
    for (c = 0; c < campi.length; c++) t += `<th>${campi[c]}`;
    t += "</tr>";
    // ora le linee

    for (
      let l = 0;
      l < tbl.length;
      l++ // ogni linea restituita dalla query
    ) {
      t += "<tr>";
      for (c = 0; c < campi.length; c++) t += `<td>${tbl[l][campi[c]]}</td>`;
      t += "</tr>";
    }
    // COME SOPRA: alternativa con foreach()
    /*
    tbl.forEach( element=> { // element e' la singola riga di array  es {"ArtistId":1,"Name":"AC/DC"}
      t+='<tr>'  
      campi.forEach(fie=>  t+=`<td>${element[ fie ]}` )
      t+='</tr>'  
      })
*/

    t += "</table>";
    //
    return t;
  }
  return "";
}

var xhttp = new XMLHttpRequest();

function get_info(o1, var0, dst) {
  // if pending, abort else initiate a new one
  dst1 = dst;
  xhttp.onreadystatechange = function (o1, dst, var0) {
    //dst1=dst
    if (xhttp.readyState == 4 && this.status == 200) {
      document.getElementById(dst1).innerHTML = xhttp.responseText; //"txt"
      //xhttp.abort();
    }
  };
  site = "ASY"; // header per indicare  richiesta asincrona
  he00 = "tabe";
  ky = "nume=" + document.getElementById(var0).value; // nume=7
  xhttp.open("POST", site, true); // "ASY?pro="+o1.value, true);
  xhttp.setRequestHeader(he00, "ON"); // // trick to insulate HTTP standard requests
  xhttp.setRequestHeader("Accept", null);
  //xhttp.send(); // if GET request is in URL
  xhttp.send(ky); // if POST request is  payload
}

function get_pow(o1, var0, var1, dst) {
  // if pending, abort else initiate a new one
  dst1 = dst;
  xhttp.onreadystatechange = function (o1, dst, var0, var1) {
    //dst1=dst
    if (xhttp.readyState == 4 && this.status == 200) {
      var temp = xhttp.responseText;
      document.getElementById(dst1).innerHTML = temp; //"txt"
      //xhttp.abort();
    }
  };
  site = "ASY"; // header per indicare  richiesta asincrona
  he00 = "pow";
  ky = "nume=" + document.getElementById(var0).value; // nume=7
  ky += "&exp=" + document.getElementById(var1).value; // nume=7
  xhttp.open("POST", site, true); // "ASY?pro="+o1.value, true);
  xhttp.setRequestHeader(he00, "ON"); // // trick to insulate HTTP standard requests
  xhttp.setRequestHeader("Accept", null);
  //xhttp.send(); // if GET request is in URL
  xhttp.send(ky); // if POST request is  payload
}

function get_play(o1, var0, dst) {
  // if pending, abort else initiate a new one
  dst1 = dst;
  xhttp.onreadystatechange = function (o1, dst, var0, var1) {
    //dst1=dst
    if (xhttp.readyState == 4 && this.status == 200) {
      var temp = xhttp.responseText;
      document.getElementById(dst1).innerHTML = temp; //"txt"
      //xhttp.abort();
    }
  };
  site = "ASY"; // header per indicare  richiesta asincrona
  he00 = "play";
  ky = "nume=" + document.getElementById(var0).value; // nume=7
  //ky+="&exp="+document.getElementById(var1).value; // nume=7
  xhttp.open("POST", site, true); // "ASY?pro="+o1.value, true);
  xhttp.setRequestHeader(he00, "ON"); // // trick to insulate HTTP standard requests
  xhttp.setRequestHeader("Accept", null);
  //xhttp.send(); // if GET request is in URL
  xhttp.send(ky); // if POST request is  payload
}
function get_artists(o1, var0, dst) {
  // if pending, abort else initiate a new one
  dst1 = dst;
  xhttp.onreadystatechange = function (o1, dst, var0, var1) {
    //dst1=dst
    if (xhttp.readyState == 4 && this.status == 200) {
      var temp = xhttp.responseText;
      temp = crea_tabella_da_query_sqlite_json(temp);
      document.getElementById(dst1).innerHTML = temp; //"txt"
      //xhttp.abort();
    }
  };

  site = "ASY"; // header per indicare  richiesta asincrona
  he00 = "artists";
  ky = "nume=" + document.getElementById(var0).value; // nume=7
  //ky+="&exp="+document.getElementById(var1).value; // nume=7
  xhttp.open("POST", site, true); // "ASY?pro="+o1.value, true);
  xhttp.setRequestHeader(he00, "ON"); // // trick to insulate HTTP standard requests
  xhttp.setRequestHeader("Accept", null);
  //xhttp.send(); // if GET request is in URL
  xhttp.send(ky); // if POST request is  payload
}
function get_films(o1, var0, dst) {
  // if pending, abort else initiate a new one
  dst1 = dst;
  xhttp.onreadystatechange = function (o1, dst, var0, var1) {
    //dst1=dst
    if (xhttp.readyState == 4 && this.status == 200) {
      var temp = xhttp.responseText;
      temp = crea_tabella_da_query_sqlite_json(temp);
      document.getElementById(dst1).innerHTML = temp; //"txt"
      //xhttp.abort();
    }
  };
  site = "ASY"; // header per indicare  richiesta asincrona
  he00 = "films";
  ky = "nume=" + document.getElementById(var0).value; // nume=7
  //ky+="&exp="+document.getElementById(var1).value; // nume=7
  xhttp.open("POST", site, true); // "ASY?pro="+o1.value, true);
  xhttp.setRequestHeader(he00, "ON"); // // trick to insulate HTTP standard requests
  xhttp.setRequestHeader("Accept", null);
  //xhttp.send(); // if GET request is in URL
  xhttp.send(ky); // if POST request is  payload
}

function get_air_quality(o1, var0, var1, dst) {
  // questa richiesta' e' indiretta: server chiede ad altra api e manda la risposta
  dst1 = dst;
  xhttp.onreadystatechange = function (o1, dst, var0, var1) {
    //dst1=dst
    if (xhttp.readyState == 4 && this.status == 200) {
      var temp = JSON.parse(xhttp.responseText);
      //temp=crea_tabella_da_query_sqlite_json(temp)
      res =
        "Citta:  " +
        temp["city_name"] +
        "  inquinante NO2:  " +
        temp["data"][0]["no2"] +
        " alle:  " +
        temp["data"][0]["datetime"] +
        ":00    " + // ci sono solo le ore
        temp["timezone"];
      document.getElementById(dst1).innerHTML =
        res +
        "<br>JSON:  " +
        xhttp.responseText.substring(1, 200) +
        "  ecc. ecc."; //"txt"
      //xhttp.abort();
    }
  };
  site = "ASY"; // header per indicare  richiesta asincrona
  he00 = "airq";
  ky = "lat0=" + document.getElementById(var1).value; // nume=7
  ky += "&lon0=" + document.getElementById(var0).value; // nume=7
  xhttp.open("POST", site, true); // "ASY?pro="+o1.value, true);
  xhttp.setRequestHeader(he00, "ON"); // // trick to insulate HTTP standard requests
  xhttp.setRequestHeader("Accept", null);
  //xhttp.send(); // if GET request is in URL
  xhttp.send(ky); // if POST request is  payload
}

function traduci_con_api(vocabolo, dst) {
  // questa richiesta' e' diretta: client  chiede ad altra api e scrive la risposta
  let dst1 = dst;
  xhttp.onreadystatechange = function (o1, dst, var0, var1) {
    //dst1=dst
    if (xhttp.readyState == 4 && this.status == 200) {
      var temp = JSON.parse(xhttp.responseText);
      //temp=crea_tabella_da_query_sqlite_json(temp)
      res = temp.translatedText;
      document.getElementById(dst1).innerHTML += xhttp.responseText;
    }
    if (xhttp.readyState == 4 && this.status == 400) {
      // no api key
      var temp = JSON.parse(xhttp.responseText);
      //temp=crea_tabella_da_query_sqlite_json(temp)
      res = temp.translatedText;
      document.getElementById(dst1).innerHTML += xhttp.responseText;
      //xhttp.abort();
    }
  };
  site = "https://libretranslate.com/translate"; // header per indicare  richiesta asincrona
  //he00="airq"
  let body = JSON.stringify({
    q: vocabolo,
    source: "en", // auto
    target: "it",
    format: "text",
    api_key: "",
  });

  xhttp.open("POST", site, true); // "ASY?pro="+o1.value, true);
  xhttp.setRequestHeader("Content-Type", "application/json"); // //
  //xhttp.setRequestHeader("Accept",null);
  //xhttp.send(); // if GET request is in URL
  xhttp.send(body); // if POST request is  payload
}

function get_cagnaccio_a_caso(o1, dst, d_name) {
  // questa richiesta' e' indiretta: server chiede ad altra api e manda la risposta
  let dst1 = dst;
  let d_name1 = d_name;
  xhttp.onreadystatechange = function (o1, dst, var0, var1) {
    //https://images.dog.ceo/breeds/terrier-yorkshire/n02094433_2596.jpg
    if (xhttp.readyState == 4 && this.status == 200) {
      //var temp=JSON.parse(xhttp.responseText)  ;
      var temp = xhttp.responseText;
      const regex = /breeds\/(.*)\//; // https://medium.com/factory-mind/regex-tutorial-a-simple-cheatsheet-by-examples-649dc1c3f285
      const found = temp.match(regex);
      let res = "";
      if (found) {
        let vocabolo = found[1];
        traduci_con_api(vocabolo, d_name1);
        res = `<b>${vocabolo} </b><br>`;
      }
      //res += "<img width=300 src="+temp+">"

      document.getElementById(d_name1).innerHTML = res;
      document.getElementById(dst1).innerHTML =
        "<img width=300 src=" + temp + ">";
      //xhttp.abort();
    }
  };
  site = "ASY"; // header per indicare  richiesta asincrona
  he00 = "cane";
  //ky="lat0="+document.getElementById(var1).value; // nume=7
  //ky+="&lon0="+document.getElementById(var0).value; // nume=7
  xhttp.open("POST", site, true); // "ASY?pro="+o1.value, true);
  xhttp.setRequestHeader(he00, "ON"); // // trick to insulate HTTP standard requests
  xhttp.setRequestHeader("Accept", null);
  //xhttp.send(); // if GET request is in URL
  xhttp.send(""); // if POST request is  payload
}
function trovaFilm(nome){
  dst=selectRowsFilmId(id);
  dst1=selectName(dst);
}
function trovaActor(nome){
  dst=selectRowsActorId(id);
  dst1=selectFirstName(dst);
}


function passwordView(o1, var0, dst) {
  // if pending, abort else initiate a new one
  dst1 = dst;
  xhttp.onreadystatechange = function (o1, dst, var0) {
    //dst1=dst
    if (xhttp.readyState == 4 && this.status == 200) {
      var temp = xhttp.responseText;
      document.getElementById(dst1).innerHTML = temp; //"txt"
      //xhttp.abort();
    }
  };
  site = "ASY"; // header per indicare  richiesta asincrona
  he00 = "psw";
  ky = "nume=" + document.getElementById(var0).value; // nume=7
  // ky += "&exp=" + document.getElementById(var1).value; // nume=7
  xhttp.open("POST", site, true); // "ASY?pro="+o1.value, true);
  xhttp.setRequestHeader(he00, "ON"); // // trick to insulate HTTP standard requests
  xhttp.setRequestHeader("Accept", null);
  //xhttp.send(); // if GET request is in URL
  xhttp.send(ky); // if POST request is  payload
}

function printTriangleTartaglia(o1, rows, dst) {
  // if pending, abort else initiate a new one
  dst1 = dst;
  xhttp.onreadystatechange = function (o1, dst, rows) {
    //dst1=dst
    if (xhttp.readyState == 4 && this.status == 200) {
      var temp = xhttp.responseText;
      document.getElementById(dst1).innerHTML = temp; //"txt"
      //xhttp.abort();
    }
  };
  site = "ASY"; // header per indicare  richiesta asincrona
  he00 = "row";
  kz = "linee=" + document.getElementById(rows).value; // nume=7
  // ky += "&exp=" + document.getElementById(var1).value; // nume=7
  xhttp.open("POST", site, true); // "ASY?pro="+o1.value, true);
  xhttp.setRequestHeader(he00, "ON"); // // trick to insulate HTTP standard requests
  xhttp.setRequestHeader("Accept", null);
  //xhttp.send(); // if GET request is in URL
  xhttp.send(kz); // if POST request is  payload
}
