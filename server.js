require("@google-cloud/trace-agent").start();
require("@google-cloud/debug-agent").start(
  Object.assign({ allowExpressions: true })
);
const express = require("express");
const swig = require("swig");
const path = require("path");
const favicon = require("serve-favicon");
const multer = require("multer");
const logger = require("./logger");
const vision = require("@google-cloud/vision");

const client = new vision.ImageAnnotatorClient();

const features = [{ type: 1 }, { type: 4 }, { type: 5 }];

// express setup
const app = express();
const upload = multer();
app.set("views", path.join(__dirname, "views"));
app.engine("html", swig.renderFile);
app.set("view engine", "html");
app.use(favicon(__dirname + "/public/favicon.ico"));
app.use(express.static(path.join(__dirname, "public")));

// show the index page
app.get("/", (req, res, next) => {
  res.render("index");
});

// find objects in the picture with the cloud vision API
app.post("/sendpic", upload.array(), async (req, res, next) => {
  // grab the base64 encoded image from the request and save to disk
  const picBase64 = req.body.pic.split("data:image/png;base64,")[1];
  const image = Buffer.from(picBase64, "base64");

  // use the cloud vision API to find stuff
  logger.info("analyzing the image...");
  const [detections] = await client.annotateImage({ image, features });

  logger.info("Image analysis complete!");
  logger.info(detections);

  // return the results to the browser
  res.json(detections);
});

// Start the server
const server = app.listen(process.env.PORT || 3000, "0.0.0.0", () => {
  console.log(
    "App listening at http://%s:%s",
    server.address().address,
    server.address().port
  );
  console.log("Press Ctrl+C to quit.");
});
