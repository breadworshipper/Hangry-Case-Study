import * as http from "http"
import { parse } from "path"
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

    else if (parsedUrl.pathname?.startsWith("/user/") && req.method === "DELETE") {
      const userId = parsedUrl.pathname.split("/")[2]

      db.run(`DELETE FROM users WHERE id = ?`, [userId], (err) => {
        if (err) {
          console.error("Failed to delete user:", err)
          res.statusCode = 500
          res.setHeader("Content-Type", "application/json")
          res.end(JSON.stringify({ message: "Internal Server Error" }))
        } else {
          res.statusCode = 200
          res.setHeader("Content-Type", "application/json")
          res.end(JSON.stringify({ message: "User deleted" }))
        }
      })
    } else if (
      parsedUrl.pathname?.startsWith("/user/") &&
      req.method === "PUT"
    ) {
      const userId = parsedUrl.pathname.split("/")[2]

      let body: string = ""
      req.on("data", (chunk: string) => {
        body += chunk
      })

      req.on("end", () => {
        try {
          const parsedBody = JSON.parse(body)

          // Validate that at least one attribute is provided
          const updates: string[] = []
          const params: (string | number)[] = []

          if (parsedBody.name) {
            updates.push("name = ?")
            params.push(parsedBody.name)
          }
          if (parsedBody.email) {
            updates.push("email = ?")
            params.push(parsedBody.email)
          }
          if (parsedBody.date_of_birth) {
            updates.push("date_of_birth = ?")
            params.push(parsedBody.date_of_birth)
          }

          if (updates.length === 0) {
            res.statusCode = 400
            res.setHeader("Content-Type", "application/json")
            res.end(
              JSON.stringify({ message: "No attributes provided for update" })
            )
            return
          }

          params.push(userId)

          const sql = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`

          db.run(sql, params, (err) => {
            if (err) {
              console.error("Failed to update user:", err)
              res.statusCode = 500
              res.setHeader("Content-Type", "application/json")
              res.end(JSON.stringify({ message: "Internal Server Error" }))
            } else {
              res.statusCode = 200
              res.setHeader("Content-Type", "application/json")
              res.end(JSON.stringify({ message: "User updated" }))
            }
          })
        } catch (error) {
          console.error("Failed to parse JSON:", error)
          res.statusCode = 400
          res.setHeader("Content-Type", "application/json")
          res.end(JSON.stringify({ message: "Invalid JSON" }))
        }
      })
    } 
    
    else {
      res.statusCode = 404
      res.setHeader("Content-Type", "application/json")
      res.end(JSON.stringify({ message: "Not Found" }))
    }
  }
)

// Start the server and listen on the specified port
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

