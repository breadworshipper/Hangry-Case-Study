import { ServerResponse } from "http"

export const sendResponse = (
  res: ServerResponse,
  statusCode: number,
  message: any
) => {
  res.statusCode = statusCode
  res.setHeader("Content-Type", "application/json")
  res.end(JSON.stringify(message))
}
