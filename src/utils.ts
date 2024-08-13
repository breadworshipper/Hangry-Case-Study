import { ServerResponse } from "http"

export function sendResponse(
  res: ServerResponse,
  statusCode: number,
  message: any
) {
  res.statusCode = statusCode
  res.setHeader("Content-Type", "application/json")
  res.end(JSON.stringify(message))
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidDate(date: string): boolean {
  return !isNaN(Date.parse(date))
}
