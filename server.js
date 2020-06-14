// node modules required
const express = require("express");
const fs = require("fs");
const path = require("path");
const util = require("util");
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

// express method put into an app const and PORT to be used specified
const app = express();
const PORT = process.env.PORT || 3300;

// express middleware to access public file for proper css and js loading
app.use(express.urlencoded({ extened: true }));
app.use(express.json());
app.use(express.static(__dirname + '/public'));
app.use(express.static('./'));

// get method returns the notes.html file
app.get("/notes", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/notes.html"));
})
// get method returns the index.html file
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
})
// reads the db.json file and returns saved notes in JSON format
app.get("/api/notes", (req, res) => {
  readFileAsync("./db/db.json", "utf-8")
    .then(data => {
      res.json(JSON.parse(data));
    })
    .catch(err => {
      throw err;
    })
});

// Receives new notes and saves them in the db.json file and then returns it back to the client
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
// Deletes the object with matching id
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
// listener for the server connection and console logs a success message
app.listen(PORT, () => {
  console.log(`App listening on PORT: ${PORT}`);
});