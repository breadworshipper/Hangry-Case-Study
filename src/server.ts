import * as http from "http"
import * as sqlite3 from "sqlite3"
import * as url from 'url'

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

const PORT: number = 3000

const server: http.Server = http.createServer(
    (req: http.IncomingMessage, res: http.ServerResponse) => {
      const parsedUrl = url.parse(req.url || "", true)

    if (res.headersSent) {
      return
    }

    if (req.url === "/user" && req.method === "POST") {
      // Read body of the request
      let body: string = ""
      req.on("data", (chunk: string) => {
        body += chunk
      })

      req.on("end", () => {
        try {
          const parsedBody = JSON.parse(body)

          // Validate required attributes
          if (
            !parsedBody.name ||
            !parsedBody.email ||
            !parsedBody.date_of_birth
          ) {
            res.statusCode = 400
            res.setHeader("Content-Type", "application/json")
            res.end(JSON.stringify({ message: "Missing required attributes" }))
            return
          }

          db.run(
            `INSERT INTO users (name, email, date_of_birth) VALUES (?, ?, ?)`,
            [parsedBody.name, parsedBody.email, parsedBody.date_of_birth],
            (err) => {
              if (err) {
                console.error("Failed to insert user:", err)
              } else {
                res.statusCode = 201
                res.setHeader("Content-Type", "application/json")
                res.end(JSON.stringify({ message: "User created" }))
              }
            }
          )
        } catch (error) {
          console.error("Failed to parse JSON:", error)
        }
      })
    } 
    
    else if (
      parsedUrl.pathname?.startsWith("/user/") &&
      req.method === "GET"
    ) {
      const userId = parsedUrl.pathname.split("/")[2]

      db.get(`SELECT * FROM users WHERE id = ?`, [userId], (err, row) => {
        if (err) {
          console.error("Failed to retrieve user:", err)
          res.statusCode = 500
          res.setHeader("Content-Type", "application/json")
          res.end(JSON.stringify({ message: "Internal Server Error" }))
        } else if (!row) {
          res.statusCode = 404
          res.setHeader("Content-Type", "application/json")
          res.end(JSON.stringify({ message: "User not found" }))
        } else {
          res.statusCode = 200
          res.setHeader("Content-Type", "application/json")
          res.end(JSON.stringify(row))
        }
      })
    }
  }
)

// Start the server and listen on the specified port
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

