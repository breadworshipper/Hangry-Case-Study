import { IncomingMessage, ServerResponse } from "http"
import * as url from "url"
import { sendResponse, isValidEmail, isValidDate } from "./utils"

export function handlePostUser(
  req: IncomingMessage,
  res: ServerResponse,
  db: any
) {
  let body: string = ""
  req.on("data", (chunk: string) => {
    body += chunk
  })

  req.on("end", () => {
    try {
      const parsedBody = JSON.parse(body)

      const requiredAttributes: boolean = parsedBody.name && parsedBody.email && parsedBody.date_of_birth
      const validEmail: boolean = isValidEmail(parsedBody.email)
      const validDate: boolean = isValidDate(parsedBody.date_of_birth)

      if (!requiredAttributes) {
        sendResponse(res, 400, { message: "Missing required attributes" })
        return
      }
    if (!validEmail) {
        sendResponse(res, 400, { message: "Invalid email" })
        return
    }
    if (!validDate) {
        sendResponse(res, 400, { message: "Invalid date of birth" })
        return
    }

      const sql: string = `INSERT INTO users (name, email, date_of_birth) VALUES (?, ?, ?)`

      db.run(
        sql,
        [parsedBody.name, parsedBody.email, parsedBody.date_of_birth],
        (err: any) => {
          if (err) {
            sendResponse(res, 500, { message: "Internal Server Error" })
          } else {
            sendResponse(res, 201, { message: "User created" })
          }
        }
      )
    } catch (error) {
      console.error("Failed to parse JSON:", error)
      sendResponse(res, 400, { message: "Invalid JSON" })
    }
  })
}

export function handleGetUser(
  req: IncomingMessage,
  res: ServerResponse,
  parsedUrl: url.UrlWithParsedQuery,
  db: any
) {
  const userId = parsedUrl.pathname!.split("/")[2]

  const sql: string = `SELECT * FROM users WHERE id = ?`

  db.get(sql, [userId], (err: any, row: any) => {
    if (err) {
      console.error("Failed to retrieve user:", err)
      sendResponse(res, 500, { message: "Internal Server Error" })
    } else if (!row) {
      sendResponse(res, 404, { message: "User not found" })
    } else {
      sendResponse(res, 200, row)
    }
  })
}

export function handleDeleteUser(
  req: IncomingMessage,
  res: ServerResponse,
  parsedUrl: url.UrlWithParsedQuery,
  db: any
) {
  const userId = parsedUrl.pathname!.split("/")[2]

  db.get(`SELECT * FROM users WHERE id = ?`, [userId], (err: any, row: any) => {
    if (err) {
      console.error("Failed to query user:", err)
      sendResponse(res, 500, { message: "Internal Server Error" })
    } else if (!row) {
      sendResponse(res, 404, { message: "User not found" })
    } else {
      db.run(`DELETE FROM users WHERE id = ?`, [userId], (err: any) => {
        if (err) {
          console.error("Failed to delete user:", err)
          sendResponse(res, 500, { message: "Internal Server Error" })
        } else {
          sendResponse(res, 200, { message: "User deleted" })
        }
      })
    }
  })
}

export function handlePutUser(
  req: IncomingMessage,
  res: ServerResponse,
  parsedUrl: url.UrlWithParsedQuery,
  db: any
) {
  const userId = parsedUrl.pathname!.split("/")[2]

  let body: string = ""
  req.on("data", (chunk: string) => {
    body += chunk
  })

  req.on("end", () => {
    try {
      const parsedBody = JSON.parse(body)

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
        sendResponse(res, 400, { message: "No attributes provided for update" })
        return
      }

      params.push(userId)

      const sql: string = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`

      db.run(sql, params, (err: any) => {
        if (err) {
          console.error("Failed to update user:", err)
          sendResponse(res, 500, { message: "Internal Server Error" })
        } else {
          sendResponse(res, 200, { message: "User updated" })
        }
      })
    } catch (error) {
      console.error("Failed to parse JSON:", error)
      sendResponse(res, 400, { message: "Invalid JSON" })
    }
  })
}
