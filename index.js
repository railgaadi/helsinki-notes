const express = require("express");
const cors = require("cors");
const app = express();

require("dotenv").config();

const Note = require("./models/notes");

app.use(express.static("build"));
app.use(cors());
app.use(express.json());

//Root

app.get("/", (req, res) => {
  res.send("Hello World");
});

//Get all

app.get("/api/notes", (req, res) => {
  Note.find({}).then((notes) => {
    res.json(notes);
  });
});

//Get one

app.get("/api/notes/:id", (request, response, next) => {
  Note.findById(request.params.id)
    .then((note) => {
      if (note) {
        response.json(note);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

//Delete

app.delete("/api/notes/:id", (req, res, next) => {
  Note.findByIdAndRemove(req.params.id)
    .then((result) => res.statusCode(204).end())
    .catch((error) => next(error));
});

//Update
app.put("/api/notes/:id", (req, res, next) => {
  const body = req.body;
  const note = {
    content: body.content,
    important: body.important,
  };
  Note.findByIdAndUpdate(req.params.id, note, { new: true })
    .then((updatedNote) => res.json(updatedNote.toJSON()))
    .catch((error) => next(error));
});

//Post

app.post("/api/notes", (req, res, next) => {
  const body = req.body;

  if (!body.content) {
    return res.status(400).json({
      error: "content is missing",
    });
  }
  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
  });
  note
    .save()
    .then((savedNote) => savedNote.toJSON())
    .then((savedAndFormattedNote) => {
      res.json(savedAndFormattedNote);
    })
    .catch((error) => next(error));
});

// unknownEndpoint
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

// errorHandler
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError" && error.kind === "ObjectId") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).send({ error: error.message });
  }
  next(error);
};

app.use(errorHandler);

// Listen

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("Server is on");
});

// const generateID = () => {
//   const maxID = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) : 0;
//   return maxID + 1;
// };

//HTTP requesting below

// // const http = require("http");

// // let notes = [
// //   {
// //     id: 1,
// //     content: "HTML is easy",
// //     date: "2019-05-30T17:30:31.098Z",
// //     important: true,
// //   },
// //   {
// //     id: 2,
// //     content: "Browser can execute only Javascript",
// //     date: "2019-05-30T18:39:34.091Z",
// //     important: false,
// //   },
// //   {
// //     id: 3,
// //     content: "GET and POST are the most important methods of HTTP protocol",
// //     date: "2019-05-30T19:20:14.298Z",
// //     important: true,
// //   },
// // ];
// // const app = http.createServer((request, response) => {
// //   response.writeHead(200, { "Content-Type": "application/json" });
// //   response.end(JSON.stringify(notes));
// // });

// // const PORT = 3001;
// // app.listen(PORT);
// // console.log(`Server started on ${PORT}`);
