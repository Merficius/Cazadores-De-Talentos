const express = require("express");
const app = express();
const db = require("./database");
const PORT = 3000;
app.use(express.static("public"));
app.use(express.json());

app.get("/", function (request, response) {
  response.sendFile(__dirname + "/index.html");
});

// DB ROUTES AND QUERIES
app.post("/login", function (req, res, next) {
  console.log(req.body);
  const email = req.body.email;
  const password = req.body.password;
  var sqlTalento = `SELECT *, NULL AS contrasena, estrellas as totalEstrellas FROM talento WHERE correo = '${email}' AND contrasena = '${password}';`;
  var sqlCazador = `SELECT cazador.nombre, cazador.correo, cazador.lugar, cazador.permisos, NULL AS contrasena, SUM(estrellasObtenidasCazador)/count(proyecto.nombre) as totalEstrellas, count(proyecto.nombre) as totalProyectos, SUM(contrato.puntosContrato) as totalPuntos FROM contrato, proyecto, cazador WHERE contrato.idProyecto = proyecto.idProyecto AND proyecto.cazador = cazador.idCazador AND contrato.talento = 1 AND cazador.correo = '${email}' AND cazador.contrasena = '${password}';`;
  db.query(sqlTalento, function (err, data) {
    if (err) {
      res.send(JSON.stringify({ status: false }));
    }
    valueTalento = JSON.stringify(data);
    // If talento does not exists, look for cazador
    if (valueTalento === "[]") {
      db.query(sqlCazador, function (errCazador, dataCazador) {
        if (errCazador) {
          res.send(JSON.stringify({ status: false }));
        }
        //valueCazador = JSON.stringify(dataCazador);
        console.log(dataCazador);
        if (dataCazador === "[]") {
          console.log(1);
        }
        if (dataCazador.nombre == dataCazador.permisos) {
          console.log(dataCazador.nombre, dataCazador.permisos);
        } else {
          res.send(JSON.stringify({ status: false }));
          res.send(dataCazador);
        }
      });
    } else {
      res.send(valueTalento);
    }
  });
});

app.post("/signup", function (req, res, next) {
  const nombre = req.body.nombre;
  const email = req.body.email;
  const password = req.body.password;
  const lugar = req.body.lugar;
  const rol = req.body.rol;
  var query = ``;
  if (rol === "talento") {
    const capacidades = req.body.capacidades;
    const actividadProfesional = req.body.actividadProfesional;
    const costo = req.body.costo;
    const horarioInicio = req.body.horarioInicio;
    const horarioFin = req.body.horarioFin;
    query = `insert into talento (nombre, correo, contrasena, capacidades, actividadProfesional, lugar, costoHora, disponibilidadHoraInicio, disponibilidadHoraFin) VALUES ("${nombre}", "${email}", "${password}", "${capacidades}", "${actividadProfesional}", "${lugar}", ${costo}, ${horarioInicio}, ${horarioFin});`;
  } else {
    query = `insert into cazador (nombre, correo, contrasena, lugar) VALUES ("${nombre}", "${email}", "${password}", "${lugar}");`;
  }
  db.query(query, function (err, data) {
    if (err) {
      res.send(JSON.stringify({ status: false }));
    } else {
      res.send(JSON.stringify({ status: true }));
    }
  });
});

app.post("/modifyProfile", function (req, res, next) {
  const idTalento = req.body.idTalento;
  const costoHora = req.body.costoHora;
  const lugar = req.body.lugar;
  const capacidades = req.body.capacidades;
  const actividadProfesional = req.body.actividadProfesional;

  const query = `UPDATE talento SET costoHora=${costoHora}, lugar = "${lugar}", capacidades = "${capacidades}", actividadProfesional = "${actividadProfesional}" WHERE idTalento = ${idTalento};`;

  db.query(query, function (err, data) {
    if (err) {
      res.send(JSON.stringify({ status: false }));
    } else {
      res.send(JSON.stringify({ status: true }));
    }
  });
});

app.get("/getProjects", function (req, res, next) {
  const query = `SELECT proyecto.nombre, proyecto.descripcion, proyecto.tipo, proyecto.vacantes FROM contrato, proyecto, cazador WHERE contrato.idProyecto = proyecto.idProyecto AND proyecto.cazador = cazador.idCazador AND proyecto.vacantes > 0 group by nombre;`;
  db.query(query, function (err, data) {
    if (err) {
      res.send(JSON.stringify({ status: false }));
    } else {
      res.send(JSON.stringify(data));
    }
  });
});

app.post("/getProjectsCazador", function (req, res, next) {
  const idCazador = req.body.idCazador;
  const query = `SELECT proyecto.nombre, proyecto.descripcion, proyecto.tipo, proyecto.vacantes, proyecto.idProyecto FROM contrato, proyecto, cazador WHERE contrato.idProyecto = proyecto.idProyecto AND proyecto.cazador = cazador.idCazador AND proyecto.cazador = ${idCazador} group by nombre;`;
  db.query(query, function (err, data) {
    if (err) {
      res.send(JSON.stringify({ status: false }));
    } else {
      res.send(JSON.stringify(data));
    }
  });
});

app.post("/modifyProject", function (req, res, next) {
  const idProyecto = req.body.idProyecto;
  const tipoProyecto = req.body.tipoProyecto;
  const nombreProyecto = req.body.nombreProyecto;
  const numeroVacantes = req.body.numeroVacantes;
  const descripcion = req.body.descripcion;
  const query = `UPDATE proyecto SET tipo="${tipoProyecto}", nombre = "${nombreProyecto}", vacantes = ${numeroVacantes}, descripcion = "${descripcion}" 
  WHERE idProyecto = ${idProyecto};`;
  db.query(query, function (err, data) {
    if (err) {
      res.send(JSON.stringify({ status: false }));
    } else {
      res.send(JSON.stringify({ status: true }));
    }
  });
});

app.post("/createProject", function (req, res, next) {
  const tipoProyecto = req.body.tipoProyecto;
  const nombreProyecto = req.body.nombreProyecto;
  const numeroVacantes = req.body.numeroVacantes;
  const descripcion = req.body.descripcion;
  const query = `INSERT INTO proyecto (cazador, nombre, tipo, vacantes, descripcion) VALUES (10, "${nombreProyecto}", "${tipoProyecto}", ${numeroVacantes}, "${descripcion}");" 
  WHERE idProyecto = ${idProyecto};`;
  db.query(query, function (err, data) {
    if (err) {
      res.send(JSON.stringify({ status: false }));
    } else {
      res.send(JSON.stringify({ status: true }));
    }
  });
});

// PORT
app.listen(PORT, function () {
  console.log(`Server is listening to port ${PORT}`);
});
