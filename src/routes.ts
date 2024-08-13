import { IncomingMessage, ServerResponse } from "http"
import * as url from "url"
import db from "./db"
import {
  handlePostUser,
  handleGetUser,
  handleDeleteUser,
  handlePutUser
} from "./services"
import { sendResponse } from "./utils"

export async function handleRequest(req: IncomingMessage, res: ServerResponse) {
  const parsedUrl = url.parse(req.url || "", true)

  if (res.headersSent) {
    return
  }

  if (parsedUrl.pathname?.startsWith("/user") && req.method === "POST") {
    await handlePostUser(req, res, db)
  } else if (parsedUrl.pathname?.startsWith("/user/") && req.method === "GET") {
    await handleGetUser(res, parsedUrl, db)
  } else if (
    parsedUrl.pathname?.startsWith("/user/") &&
    req.method === "DELETE"
  ) {
    await handleDeleteUser(res, parsedUrl, db)
  } else if (parsedUrl.pathname?.startsWith("/user/") && req.method === "PUT") {
    await handlePutUser(req, res, parsedUrl, db)
  } else {
    sendResponse(res, 404, { message: "Route not found" })
  }
}
