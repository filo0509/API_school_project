var http = require("http");
var https = require("https");
var url = require("url");
var fs = require("fs");
var qs = require("querystring");
var path = require("path");

const sqlite3 = require("sqlite3").verbose();

let db = new sqlite3.Database(
  "sqlite-sakila.db",
  sqlite3.OPEN_READWRITE,
  (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("Connected to the sqlite-sakila database.");
  }
);

console.log("  richiesta multpla EACH (funzione chiamata per ogni riga)");
db.serialize(() => {
  db.each(
    `SELECT *
           FROM actor`,
    (err, row) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log(row.actor_id + "\t" + row.first_name);
      }
    }
  );
});
// let sql = {
//   play1: `SELECT *
//            FROM film_actor
//            WHERE film_id = ?`,
//   art1: `SELECT film_id Id ,title title
//             FROM film
//             where film_id =? `,
//   art2: `SELECT film_id Id ,title title
//           FROM film
//           where film_id =? `,
//   art3: `SELECT *
//             FROM film
//             where film_id < ? `,
//   art4: `SELECT *
//             FROM film
//             where film_id < ? `,
// };
// let actor_id = 1;
// let film_id = 16;

// console.log("  richiesta multpla ALL (funzione chiamata una sola volta)");
// db.all(sql["art4"], [actor_id], (err, rows) => {
//   if (err) {
//     return console.error("Err: ", err.message);
//   }
//   if (!rows) return console.log(`No artist found with the id z  ${playlistId}`);

//   rows.forEach((row) =>
//     Object.keys(row).forEach((key) => {
//       console.log(`${row[key]}`);
//     })
//   );
// });

// console.log("  richiesta singola GET");

// db.all(sql["play1"], [film_id], (err, row) => {
//   if (err) {
//     return console.error("Err: ", err.message);
//   }
//   return row
//     ? console.log("Ciao: ", row, row.name)
//     : console.log(`No playlist found with the id ${playlistId}`);
// });

process.on("SIGINT", () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
      process.exit();
    }
    console.log("Close the database connection.");
    process.exit();
  });
});

var TT = http.createServer(function (req, res) {
  var q = url.parse(req.url, false);
  var body,
    post0 = "",
    get0 = null;
  var filename = "." + q.pathname;
  get0 = q.query || "";

  req.on("data", function (data) {
    post0 += data;
    if (post0.length > 100000) req.connection.destroy();
  });

  req.on("end", function () {
    if (post0 && get0) body = post0 + "&" + get0;
    else body = (post0 || "") + (get0 || "");

    const queryObject = qs.parse(body);

    console.log(q.pathname, JSON.stringify(queryObject));
    if (q.pathname == "/segreto") {
      res.writeHead(200, { alberto: "ciao", classe: "IVSA", 5: 7 });
      res.write("Hai trovato il Segreto!! ");
      res.write(
        "<button  onclick=\"location.href='/' \"  name=b value=c>torna a MAIN</button>"
      );
      return res.end();
    } else if (q.pathname == "/ASY") {
      asy_handling(req, res, queryObject);
    } else if (q.pathname == "/") {
      main(req, res);
    } else {
      fs.readFile(filename, function (err, data) {
        if (err) {
          res.writeHead(404, { "Content-Type": "text/html", pippo: "pluta" });
          process.stdout.write("Error 404 " + filename + "\n");
          res.write(
            "<button  onclick=\"location.href='/' \"  name=b value=c>vai a MAIN page</button><br>"
          );
          return res.end("<b>404</b>File Not Found <h2>" + filename);
        }

        var mt = get_weak_mime(filename);
        if (mt) {
          res.writeHead(200, {
            "Content-Type": mt,
            "Cache-Control": "max-age=60",
          });
          res.write(data);

          return res.end();
        } else {
          res.writeHead(401, { "Content-Type": "text/html" });
          res.write(
            "<button  onclick=\"location.href='/' \"  name=b value=c>vai a MAIN page</button>"
          );
          return res.end("<b>401</b>Unauth<h2>" + filename);
        }
      });
    }
  });
});
TT.listen(8080);

process.stdout.write("partito su porta 8080\n");

function get_weak_mime(fn) {
  var s = fn.toUpperCase().split(".");

  var r = s[s.length - 1];
  if (r == "CSS") return "text/css";
  if (r == "JS") return "text/js";
  if (r == "TXT") return "text/plain";
  if (r == "HTML") return "text/html";
  if (r == "PDF") return "application/pdf";
  if (r == "ICO") return "image/vnd.microsoft.icon";
  if (r == "JPG" || r == "JPEG") return "image/jpeg";
  if (r == "PNG") return "image/png";
  return "";
}

function login(req, res, post) {
  /*
  controllo se cookie esiste su disco e valido
  manca cancellazione file scaduti
  */
  var session;
  cookiename = "sessionId";
  cookielist = parseCookies(req.headers.cookie);
  if (cookiename in cookielist) usercookie = cookielist[cookiename];
  else usercookie = "";

  dirname = "tmpcookie";
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname);
  }
  if (post.logout)
    if (fs.existsSync(dirname + "/" + usercookie + ".txt"))
      fs.unlinkSync(dirname + "/" + usercookie + ".txt");
  seconds = 3000;
  expires = new Date(new Date().getTime() + seconds * 1000).toUTCString();
  if (usercookie) {
    session = read_session(dirname + "/" + usercookie + ".txt");
    dt = session._expires
      ? Date.parse(session._expires)
      : Date.parse("01 Jan 1970 00:00:00 GMT");
    if (dt > Date.now()) {
      return session;
    }
    usercookie = "";
  }

  cookievalue = generateId(10);
  {
    var us1 = post.user;
    var pw1 = post.password;
    var tizio = test_user(us1, pw1);
    if (tizio) {
      if (!usercookie) {
        usercookie = cookievalue;

        fs.writeFileSync(
          dirname + "/" + usercookie + ".txt",
          JSON.stringify({
            _expires: expires,
            _user: tizio.user,
            _userdata: tizio,
            _id: usercookie,
            _file: dirname + "/" + usercookie + ".txt",
          })
        );

        res.writeHead(200, {
          "Content-Type": "text/html",
          "Set-Cookie":
            cookiename + "=" + cookievalue + " ; expires=" + expires,
        });
        res.write(`<!DOCTYPE html><html lang="en-US"><head>  <meta charset="utf-8">
          <link rel=\"icon\" href=\"data:,\"></link>
          </head><body>
           <h3>benvenuto ${tizio.user}        </h3>
          <a href='/' >vai al main</a>
          </body></html>
          `);
        res.end();
        return false;
      }
    } else {
      res.writeHead(200, {
        "Content-Type": "text/html",
        "other-heading": "set",
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

function main(req, res) {
  res.writeHead(200, { "Content-Type": "text/html", "other-heading": "set" });
  //   res.write(`<!DOCTYPE html><html lang="en-US"><head>
  //   <meta charset="utf-8">
  //   <link rel=\"icon\" href=\"data:,\"></link>
  // </head><body>
  //  <h3>MAIN`);

  //   res.write(
  //     "  <a href=./tabeASY.html style=' color:coral; '>Tabellina Asincrona</a> "
  //   );
  //   res.write(
  //     "  <a href=./password_generator.html style=' color:coral; '>Generatore password</a> "
  //   );
  //   res.write(` <a href=/?logout=1>logout</a>
  //   </h3>
  //   </body></html>
  //   `);
  //   res.writeHeader(200, {"Content-Type": "text/html"});
  fs.readFile("index.html", function (error, pgResp) {
    if (error) {
      res.writeHead(404);
      res.write("Contents you are looking are Not Found");
    } else {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.write(pgResp);
    }
    res.end();
  });
}

function tabe(n) {
  var txt;
  if (n < 2 || n > 1000) txt = " Dati non validi";
  else {
    txt = "<table border=1><thead><tr><th>";
    for (i = 1; i <= n; i++) {
      txt += "<th>" + i;
    }
    txt += "</tr>";
    txt += "<tbody>";
    for (i = 1; i <= n; i++) {
      txt += "<tr><th>" + i;
      for (j = 1; j <= n; j++) {
        txt += `<td title='${i}x${j}=${i * j}'> ${i * j}`;
      }

      txt += "</tr>";
    }
  }

  return txt;
}

function funzione_pow(nume, exp01) {
  return Math.pow(nume, exp01);
}

function qry(q_name, par1, fun) {
  let sql = {
    play1: `SELECT *
           FROM film_actor
           WHERE film_id = ?`,
  };
  let playlistId = 1;
  var ret = "";

  db.all(sql[q_name], [par1], (err, row) => {
    if (err) {
      console.error(err.message);
      ret = `<b>Error in query ${q_name}</b>`;
    }
    if (row) {
      console.log(row.id, row.name);

      ret = `Play :  ${row.name}`;
    } else {
      console.log(`No playlist found with the id ${playlistId}`);
      ret = "<b>ID not found in query</b>";
    }

    fun(ret);
  });
}

function artistsFromFilm(q_name, par1, fun) {
    let sql = {
      // le prime tre query servono per trovare gli attori che recitano in un film
    play1: `SELECT actor_id, film_id
           FROM film_actor
           WHERE film_id = ?`,
    play2: `SELECT first_name as Nome, last_name as Cognome
    FROM actor
    WHERE actor_id = ?`,
    play3: `SELECT *
        FROM film
        WHERE title = ?`,
  };

  // Da sistemare la ricerca col LIKE
  db.get(sql["play3"], [par1], (err, row) => {
    if (err) {
      console.log("Err: ", err);
    } else if (row) {
      console.log("name", row);
      var ret = "-";
      var actors = [];
      // Devo trovare l'id del film
      db.all(sql[q_name], [row.film_id], (err, rows) => {
        if (err) {
          ret = JSON.stringify("Query error for " + q_name);
        } else {
          var iterations = rows.length;
          for (const row of rows) {
            db.all(sql["play2"], [row.actor_id], (err, rows1) => {
              if (err) {
                ret = JSON.stringify("Query error for " + q_name);
              } else {
                actors.push(rows1[0]);
                console.log("Ret: ", actors);
                ret = JSON.stringify(actors);
                if (!--iterations) {
                  console.log("Ciao", ret);
                  fun(ret);
                }
              }
            });
          }
        }
      });
    } else {
        var ret = [
            { Nome: 'Nessun', Cognome: 'Attore' },
          ]
        console.log("Row non contiene nulla")
      fun(JSON.stringify(ret));
    }
  });
}

const options_1 = {
  method: "GET",
  hostname: "air-quality.p.rapidapi.com",
  port: null,
  path: "/history/airquality?lon=-78.638&lat=35.779",
  headers: {
    "X-RapidAPI-Key": "4be2f042cbmshd29f2b6196663d5p1ba052jsnb00e7121d920",
    "X-RapidAPI-Host": "air-quality.p.rapidapi.com",
  },
};
const options_cane = {
  method: "get",
  hostname: "dog.ceo",
  port: null,
  path: "/api/breeds/image/random",
};

function qry_indirect(par0, par1, fun) {
  console.log("no2");
  options_1.path = `/history/airquality?lon=${par0}&lat=${par1}`;
  const req = https.request(options_1, function (res) {
    const chunks = [];
    console.log("no");
    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on("end", function () {
      const body = Buffer.concat(chunks);
      console.log(body.toString().substring(1, 200));
      fun(body);
    });
  });

  req.end();
}
function qry_indirect_cane(fun) {
  const req = https.request(options_cane, function (res) {
    const chunks = [];

    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on("end", function () {
      const body = Buffer.concat(chunks);
      fun(JSON.parse(body).message);
      console.log(body.toString());
    });
  });

  req.end();
}

function asy_handling(req, res, post) {
  var ret0 = "";
  let txt1 = "dato mancante";
  if (req.headers.tabe) {
    if (post.nume) txt1 = tabe(post.nume);

    res.writeHead(200, { "Content-Type": "application/txt" });
    return res.end(txt1);
  } else if (req.headers.pow) {
    if (post.nume && post.exp) {
      txt1 = "" + funzione_pow(post.nume, post.exp);
    }
    res.writeHead(200, { "Content-Type": "application/txt" });
    return res.end(txt1);
  } else if (req.headers.psw) {
    if (post.nume) {
      txt1 = "" + generateRandomPassword(post.nume);
    }
    res.writeHead(200, { "Content-Type": "application/txt" });
    return res.end(txt1);
  } else if (req.headers.tot) {
    if (post.nume) {
      txt1 = "" + triangleoftartaglia(post.nume);
    }
    res.writeHead(200, { "Content-Type": "application/txt" });
    return res.end(txt1);
  } else if (req.headers.play) {
    if (post.nume) {
      res.writeHead(200, { "Content-Type": "application/txt" });
      qry("play1", post.nume, (txt1) => {
        res.write(txt1);
        return res.end();
      });
    } else {
      res.write("<b>Empty code</b>");
      return res.end();
    }
  } else if (req.headers.artists) {
    if (post.nume) {
      res.writeHead(200, { "Content-Type": "application/txt" });
      artistsFromFilm("play1", post.nume, (json1) => {
        res.write(json1);
        return res.end();
      });
    } else {
      res.write("<b>Empty code</b>");
      return res.end();
    }
  } else if (req.headers.airq) {
    if (post.lat0) {
      console.log("no1");

      qry_indirect(post.lat0, post.lon0, (json1) => {
        res.writeHead(200, { "Content-Type": "application/txt" });
        res.write(json1);
        return res.end();
      });
    } else {
      res.writeHead(200, { "Content-Type": "application/txt" });
      res.write("<b>Empty code</b>");
      return res.end();
    }
  } else if (req.headers.cane) {
    if (1 > 0) {
      qry_indirect_cane((indirzzo) => {
        res.writeHead(200, { "Content-Type": "application/txt" });
        res.write(indirzzo);
        return res.end();
      });
    } else {
      res.writeHead(200, { "Content-Type": "application/txt" });
      res.write("<b>Empty code</b>");
      return res.end();
    }
  } else {
    res.writeHead(401, { "Content-Type": "text/html" });
    res.write("<h2>401 not auth" + req.headers.airq);
    return res.end();
  }
}

function generateRandomPassword(max) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&*";
  let password = "";

  for (let i = 0; i < max; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters[randomIndex];
  }

  return password;
}

/*  function triangleoftartaglia(n) {
   let n_rows = n;
   let rows = new Array(n_rows+1);
   let array = new Array(rows);
   var i, j;
   for (i=0; i<= n_rows; i++)
   rows[i] = new Array(i+1);
   for (i=0; i<= n_rows; i++) {
     rows[i][0] = 1;
     rows[i][i] = 1;
     for (j=1; j<i; j++) {
       rows[i][j] = rows[i-1][j-1] + rows[i-1][j];
      array[rows];
     } 
   }

  return array;
} */

function calcolaTriangoloTartaglia(numeroRighe) {
  const triangolo = [];

  for (let i = 0; i < numeroRighe; i++) {
    triangolo[i] = [];

    for (let j = 0; j <= i; j++) {
      if (j == 0 || j == i) {
        triangolo[i][j] = 1;
      } else {
        triangolo[i][j] = triangolo[i - 1][j - 1] + triangolo[i - 1][j];
      }
    }
  }

  return triangolo;
}

function stampaTriangoloTartaglia(triangolo) {
  const numeroRighe = triangolo.length;

  for (let i = 0; i < numeroRighe; i++) {
    const riga = triangolo[i];
    const spaziBianchi = " ".repeat(numeroRighe - i - 1);
    const rigaFormattata = riga.join(" ");

    console.log(spaziBianchi + rigaFormattata);
  }

  if (numeroRighe >= 2 && numeroRighe <= 10) {
    const triangoloTartaglia = calcolaTriangoloTartaglia(numeroRighe);
    stampaTriangoloTartaglia(triangoloTartaglia);
  } else {
    cout << "numero righe invalido";
  }
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
