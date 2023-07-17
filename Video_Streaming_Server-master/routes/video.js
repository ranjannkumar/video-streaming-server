const express = require("express");
const router = express.Router();
const fs = require("fs");
const videos = require("../metadata");

router.get("/", (req, res) => {
  return res.json(videos);
});
router.get("/video/:id/metadata", (req, res) => {
  const id = req.params.id;
  // console.log(id);
  const videoMeta = videos.filter((item) => item.id === id);
  res.json(videoMeta);
});
/// Here metadata in the url is compulsory to be given in the path.

router.get("/video/:id", (req, res) => {
  const videoPath = `assets/${req.params.id}.mp4`;
  const videoStat = fs.statSync(videoPath);
  const fileSize = videoStat.size;
  // console.log(req.headers);
  const videoRange = req.headers.range;

  if (videoRange) {
    // console.log(videoRange);
    const parts = videoRange.replace(/bytes=/, "").split("-");

    const start = parseInt(parts[0], 10);
    //starting byte value
    // console.log(start);
    const end = parts[1] ? parseInt(parts[1], 50) : fileSize - 1;
    // filesize -1 as index starts from 0 ownwards
    // console.log(end); // always remains same
    const chunksize = end - start + 1;
    const file = fs.createReadStream(videoPath, { start, end });

    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      //This is usual format.
      //The Content-Range response HTTP header indicates where in a full body message a partial message belongs.

      "Accept-Ranges": "bytes",

      "Content-Length": chunksize,
      //The Content-Length header indicates the size of the message body, in bytes, sent to the recipient.

      "Content-Type": "video/mp4",
    };

    res.writeHead(206, head);

    file.pipe(res);
  } else {
    // console.log("this is fired");
    const head = {
      "Content-Length": fileSize,

      "Content-Type": "video/mp4",
    };

    res.writeHead(200, head);

    fs.createReadStream(videoPath).pipe(res);
  }
});

module.exports = router;
