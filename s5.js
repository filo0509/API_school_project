var http = require("http"); 
var https = require("https");
///
var url = require("url");
var fs = require("fs");

var qs = require("querystring");

const sqlite3 = require("sqlite3").verbose();
//
let db = new sqlite3.Database(
  "../DB/chinook.db",
  sqlite3.OPEN_READWRITE,
  (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("Connected to the chinook database.");
  }
);

console.log("  richiesta multpla EACH (funzione chiamata per ogni riga)");
db.serialize(() => {
  db.each(
    `SELECT PlaylistId as id,
                  Name as name
           FROM playlists where PlaylistId< 14`,
    (err, row) => {
      if (err) {
        console.error(err.message);
      }
      console.log(row.id + "\t" + row.name);
    }
  );
});
let sql = {
  play1: `SELECT PlaylistId id,
                  Name name
           FROM playlists
           WHERE PlaylistId  = ?`,
  art1: `SELECT ArtistId Id ,Name name
            FROM artists
            where ArtistId =? `,
  art2: `SELECT ArtistId Id ,Name name
            FROM artists
            where ArtistId < ? `,
  art3: `SELECT * 
            FROM artists
            where ArtistId < ? `,
  art4: `SELECT * 
            FROM artists
            where ArtistId < ? `,
};
let playlistId = 1;
let artistId = 16;

console.log("  richiesta multpla ALL (funzione chiamata una sola volta)");
db.all(sql["art4"], [artistId], (err, rows) => {
  if (err) {
    return console.error(err.message);
  }
  if (!rows) return console.log(`No artist found with the id z  ${playlistId}`);

  rows.forEach((row) =>
    Object.keys(row).forEach((key) => {
      console.log(`${row[key]}`);
    })
  );
});

console.log("  richiesta singola GET");

db.get(sql["play1"], [playlistId], (err, row) => {
  if (err) {
    return console.error(err.message);
  }
  return row
    ? console.log(row.id, row.name)
    : console.log(`No playlist found with the id ${playlistId}`);
});

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
  if (r == "TXT") return "text/plain";
  if (r == "HTML") return "text/html";
  if (r == "PDF") return "application/pdf";
  if (r == "ICO") return "image/vnd.microsoft.icon";
  if (r == "JPG" || r == "JPEG") return "image/jpeg";
  if (r == "PNG") return "image/png";
  return "";
}

function main(req, res) {
  res.writeHead(200, { "Content-Type": "text/html", "other-heading": "set" });
  res.write(`<!DOCTYPE html><html lang="en-US"><head>
  <meta charset="utf-8">
  <link rel=\"icon\" href=\"data:,\"></link>
</head><body>
 <h3>MAIN`);

  res.write(
    "  <a href=./tabeASY.html style=' color:coral; '>Tabellina Asincrona</a> "
  );
  res.write(` <a href=/?logout=1>logout</a>
  </h3>
  </body></html>
  `);
  return res.end();
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
    play1: `SELECT PlaylistId id,
                  Name name
           FROM playlists
           WHERE PlaylistId  = ?`,
    art1: `SELECT ArtistId Id ,Name name
            FROM artists
            where ArtistId =? `,
  };
  let playlistId = 1;
  var ret = "";

  db.get(sql[q_name], [par1], (err, row) => {
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

function qry_json(q_name, par1, fun) {
  let sql = {
    art3: `SELECT * 
            FROM artists
            where ArtistId <= ? `,
  };
  let ret = "-";
  db.all(sql[q_name], [par1], (err, rows) => {
    if (err) {
      ret = JSON.stringify("Query error for " + q_name);
    } else {
      ret = JSON.stringify(rows);
    }

    fun(ret);
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
      qry_json("art3", post.nume, (json1) => {
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
