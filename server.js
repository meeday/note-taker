// node modules required
const express = require("express");
const fs = require("fs");
const path = require("path");
const util = require("util");
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

const app = express();
const PORT = process.env.PORT || 3300;

app.use(express.urlencoded({ extened: true }));
app.use(express.json());
app.use(express.static(__dirname + '/public'));
app.use(express.static('./'));


app.get("/notes", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/notes.html"));
})

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
})

app.get("/api/notes", (req, res) => {
  readFileAsync("./db/db.json", "utf-8")
    .then(data => {
      res.json(JSON.parse(data));
    })
    .catch(err => {
      throw err;
    })
});

app.post("/api/notes", async (req, res) => {
  try {
      const data = await readFileAsync("./db/db.json", "utf-8"); 

      const notes = JSON.parse(data);

      const newNote = req.body;
      const newNoteId = notes.length + 1;
      const noteData = {
          id: newNoteId,
          title: newNote.title,
          text: newNote.text
      };
  
      notes.push(noteData);
      res.json(noteData);
      console.log(noteData);
  
      await writeFileAsync("./db/db.json", JSON.stringify(notes, null, 2));
      console.log("note created!");
  } catch (err) {
      throw err;
  }
});

app.delete("/api/notes/:id", async (req, res) => {
  try {
      const noteID = req.params.id;

      const data = await readFileAsync("./db/db.json", "utf-8");

      const notes = JSON.parse(data);

      notes.forEach((element, index) => {
          if (parseInt(element.id) === parseInt(noteID)) {
              notes.splice(index, 1);
          }
      });

      const notesSTR = JSON.stringify(notes, null, 2);

      await writeFileAsync("./db/db.json", notesSTR);

      res.json(JSON.parse(notesSTR));
      console.log("note deleted!");
  } catch (err) {
      throw err;
  }
})

app.listen(PORT, () => {
  console.log(`App listening on PORT: ${PORT}`);
});