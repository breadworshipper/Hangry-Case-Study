import { IncomingMessage, ServerResponse } from "http"
import * as url from "url"
import {
  sendResponse,
  isValidEmail,
  isValidDate,
  postUser,
  updateUser,
  queryUserById,
  queryUserByEmail,
  deleteUser
} from "./utils"
import sqlite3 from "sqlite3"

export async function handlePostUser(
  req: IncomingMessage,
  res: ServerResponse,
  db: sqlite3.Database
) {
  let body: string = ""
  req.on("data", (chunk: string) => {
    body += chunk
  })

  req.on("end", async () => {
    try {
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

      const existingEmail = await queryUserByEmail(db, parsedBody.email)
      if (existingEmail) {
        sendResponse(res, 409, { message: "Email already exists" })
        return
      }

      await postUser(
        db,
        parsedBody.name,
        parsedBody.email,
        parsedBody.date_of_birth
      )
      sendResponse(res, 201, { message: "User created" })
    } catch (error) {
      sendResponse(res, 500, { message: `Internal server error: ${error}` })
    }
  })
}

export async function handleGetUser(
  res: ServerResponse,
  parsedUrl: url.UrlWithParsedQuery,
  db: sqlite3.Database
) {
  try {
    const userId = parsedUrl.pathname!.split("/")[2]

    const user = await queryUserById(db, userId)

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

    const user = await queryUserById(db, userId)

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
  const userId = parsedUrl.pathname!.split("/")[2]

  const user = await queryUserById(db, userId)

  if (!user) {
    sendResponse(res, 404, { message: "User not found" })
    return
  }

  let body: string = ""
  req.on("data", (chunk: string) => {
    body += chunk
  })

  req.on("end", async () => {
    try {
      const parsedBody = JSON.parse(body)

      const updates: string[] = []
      const params: (string | number)[] = []

      const existingEmail = await queryUserByEmail(db, parsedBody.email)
      if (existingEmail && existingEmail.id !== userId) {
        sendResponse(res, 409, { message: "Email already exists" })
        return
      }

      if (parsedBody.name) {
        updates.push("name = ?")
        params.push(parsedBody.name)
      }
      if (parsedBody.email) {
        if (!isValidEmail(parsedBody.email)) {
          sendResponse(res, 400, { message: "Invalid email" })
          return
        }
        updates.push("email = ?")
        params.push(parsedBody.email)
      }
      if (parsedBody.date_of_birth) {
        if (!isValidDate(parsedBody.date_of_birth)) {
          sendResponse(res, 400, { message: "Invalid date of birth" })
          return
        }
        updates.push("date_of_birth = ?")
        params.push(parsedBody.date_of_birth)
      }

      if (updates.length === 0) {
        sendResponse(res, 400, {
          message: "No attributes provided for update"
        })
        return
      }

      params.push(userId)

      updateUser(db, updates, params).then(() => {
        sendResponse(res, 200, { message: "User updated" })
      })
    } catch (error) {
      sendResponse(res, 500, { message: "Internal Server Error" })
    }
  })
}
