import { IncomingMessage, ServerResponse } from "http"
import * as url from "url"
import {
  sendResponse,
  isValidEmail,
  isValidDate,
  postUser,
  updateUser,
  queryUser,
  deleteUser
} from "./utils"
import sqlite3 from "sqlite3"

export async function handlePostUser(
  req: IncomingMessage,
  res: ServerResponse,
  db: sqlite3.Database
) {
  try {
    let body: string = ""
    req.on("data", (chunk: string) => {
      body += chunk
    })

    req.on("end", () => {
      const parsedBody = JSON.parse(body)

      const requiredAttributes: boolean =
        parsedBody.name && parsedBody.email && parsedBody.date_of_birth
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

      postUser(
        db,
        parsedBody.name,
        parsedBody.email,
        parsedBody.date_of_birth
      ).then(() => {
        sendResponse(res, 201, { message: "User created" })
      })
    })
  } catch (error) {
    sendResponse(res, 500, { message: "Internal server error" })
  }
}

export async function handleGetUser(
  res: ServerResponse,
  parsedUrl: url.UrlWithParsedQuery,
  db: sqlite3.Database
) {
  try {
    const userId = parsedUrl.pathname!.split("/")[2]

    const user = await queryUser(db, userId)

    if (!user) {
      sendResponse(res, 404, { message: "User not found" })
      return
    }
    sendResponse(res, 200, user)
  } catch (error) {
    sendResponse(res, 500, { message: "Internal Server Error" })
  }
}

export async function handleDeleteUser(
  res: ServerResponse,
  parsedUrl: url.UrlWithParsedQuery,
  db: sqlite3.Database
) {
  try {
    const userId = parsedUrl.pathname!.split("/")[2]

    const user = await queryUser(db, userId)

    if (!user) {
      sendResponse(res, 404, { message: "User not found" })
      return
    }

    await deleteUser(db, userId)
    sendResponse(res, 200, { message: "User deleted" })
  } catch (error) {
    sendResponse(res, 500, { message: "Internal Server Error" })
  }
}

export async function handlePutUser(
  req: IncomingMessage,
  res: ServerResponse,
  parsedUrl: url.UrlWithParsedQuery,
  db: sqlite3.Database
) {
  try {
    const userId = parsedUrl.pathname!.split("/")[2]

    const user = await queryUser(db, userId)

    if (!user) {
      sendResponse(res, 404, { message: "User not found" })
      return
    }

    let body: string = ""
    req.on("data", (chunk: string) => {
      body += chunk
    })

    req.on("end", () => {
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

      updateUser(db, userId, updates, params).then(() => {
        sendResponse(res, 200, { message: "User updated" })
      })
    })
  } catch (error) {
    sendResponse(res, 500, { message: "Internal Server Error" })
  }
}
