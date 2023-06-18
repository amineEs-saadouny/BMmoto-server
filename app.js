const express = require("express");
const multer = require("multer");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config();

const dBService = require("./dbService");

app.use(cors());
app.use(express.json());
app.use(express.static("Imgs"));
app.use("/Imgs", express.static(path.join(__dirname, "Imgs")));

// CREATE
app.post("/insert", (request, response) => {
  const db = dBService.getDbServiceInstance();
  const result = db.insertProduct(request.body);
  result
    .then((data) => response.json({ success: true }))
    .catch((err) => console.log(err));
});

const storage = multer.diskStorage({
  destination: function (request, file, callback) {
    callback(null, __dirname + "/Imgs");
  },
  filename: function (request, file, callback) {
    callback(null, file.originalname);
  },
});

const uploads = multer({ storage: storage });

app.post("/getfile", uploads.array("file"), (request, response) => {
  console.log(request.body);
  console.log(request.files);
  response.json({ status: "file is received!" });
});

// READ

app.post("/images/", (req, res) => {
  console.log(req.body.img);
  res.sendFile(__dirname + "/Imgs/" + req.body.img);
});

app.get("/getBrands", (request, response) => {
  const db = dBService.getDbServiceInstance();
  const result = db.getBrands();
  result
    .then((data) => response.json({ data: data }))
    .catch((err) => console.log(err));
});

app.post("/getMotos", (request, response) => {
  const db = dBService.getDbServiceInstance();
  const result = db.getMotos(
    request.body.whatToGet,
    request.body.brandName,
    request.body.excludedId
  );
  result
    .then((data) => response.json({ data: data }))
    .catch((err) => console.log(err));
});

app.post("/search", (request, response) => {
  const db = dBService.getDbServiceInstance();
  const result = db.search(request.body.searchFor);

  result
    .then((data) => response.json({ data: data }))
    .catch((err) => console.log(err));
});

app.post("/getProduct", (request, response) => {
  const db = dBService.getDbServiceInstance();
  const result = db.getProduct(request.body.id);
  result
    .then((data) => response.json({ data: data }))
    .catch((err) => console.log(err));
});
// UPDATE
app.patch("/update", (request, response) => {
  const id = request.body.id;
  const nameValue = request.body.nameValue;
  const db = dBService.getDbServiceInstance();
  const result = db.updateRow(nameValue, id);
  result
    .then((data) => response.json({ success: true }))
    .catch((err) => console.log(err));
});
// DELETE
app.delete("/delete", (request, response) => {
  const id = request.body.id;

  const db = dBService.getDbServiceInstance();
  const result = db.deleteRow(id);
  result
    .then((data) => response.json({ success: true }))
    .catch((err) => console.log(err));
});

app.listen(process.env.PORT, () => console.log("server is runing"));
