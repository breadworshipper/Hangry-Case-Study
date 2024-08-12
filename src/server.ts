import * as http from "http"
import * as sqlite3 from "sqlite3"

let db = new sqlite3.Database(
  "./db/hangry.db",
  sqlite3.OPEN_READWRITE,
  (err) => {
    if (err) {
      console.error(err.message)
    }
    console.log("Connected to the database.")
  }
)

const PORT: number = Number(process.env.PORT);

const server: http.Server = http.createServer(
    (req: http.IncomingMessage, res: http.ServerResponse) => {

    if (res.headersSent) {
      return
    }
  }
)

// Start the server and listen on the specified port
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

