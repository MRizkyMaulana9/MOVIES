const express = require("express");
const cors = require("cors");
const router = require("./routes/router");
const bodyParser = require("body-parser");

require("dotenv").config();
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use("/api", router);

app.listen(port, () => {
  console.log(`Server run at http://localhost:${port}/api/pendaftaran`);
});
