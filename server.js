const express = require("express");
const puppeteer = require("puppeteer");
const fs = require("fs");
const app = express();
const { compress, decompress } = require("shrink-string");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

mongoose.connect("DATABASE LINK", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const schema = mongoose.Schema;

const data = new schema(
  {
    _id: String,
    ImageData: String,
  },
  { versionKey: false }
);

const Model = mongoose.model("ImageStuff", data);

async function screenshot(request, response) {
  try {
    var html = await decompress(request.query["html-data"]);
  } catch {
    var html = Buffer.from(request.query["html-data"], "base64").toString(
      "utf8"
    );
  }

  html = decodeURI(html);

  fs.writeFile("screenshot.html", html, function (err) {
    if (err) throw err;
  });

  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.goto("file:///app/screenshot.html", { waitUntil: "networkidle0" });
  await page.setViewport({
    width: 1200,
    height: 800,
  });

  let data = await page.screenshot({ fullPage: true, path: "screenshot.png" });
  var entry = new Model();
  let id = uuidv4();

  entry._id = id;
  entry.ImageData = await fs.readFileSync("screenshot.png", {
    encoding: "base64",
  });
  await entry.save();

  await browser.close();

  response.redirect(`https://YOUR DOMAIN/${id}`);
}

app.get("/", function (request, response) {
  response.sendFile("index.html", { root: "/app" });
});

app.get("/:id", async function (req, res) {
  try {
    const input = req.url.replace("/", "");
    const find = await Model.findOne({ _id: input });
    if (find == null) {
      throw new Error("Not found");
    }
    //res.send(`<img src="data:image/png;base64,${find["ImageData"]}">`);
    const image_string = `data:image/png;base64,${find["ImageData"]}`;
    const im = image_string.split(",")[1];

    const img = Buffer.from(im, "base64");

    res.writeHead(200, {
      "Content-Type": "image/png",
      "Content-Length": img.length,
    });

    res.end(img);
  } catch {
    res.send("Error");
  }
});

app.post("/", async function (request, response) {
  const data = request.query;

  try {
    const api_key = data["api-key"];

    if (api_key != "API KEY") {
      throw new Error("Error");
    } else {
      screenshot(request, response);
    }
  } catch (err) {
    response.sendFile("index.html", { root: "/app" });
  }
});

app.listen(process.env.PORT, function () {
  console.log("server started!");
});
