import { ServerResponse } from "http"
import sqlite3 from "sqlite3"

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

export function postUser(
  db: sqlite3.Database,
  name: string,
  email: string,
  dateOfBirth: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO users (name, email, date_of_birth) VALUES (?, ?, ?)`,
      [name, email, dateOfBirth],
      (err: any) => {
        if (err) {
          reject(new Error(`Failed to create user: ${err.message}`))
        } else {
          resolve()
        }
      }
    )
  })
}

export function queryUserById(db: sqlite3.Database, userId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT * FROM users WHERE id = ?`,
      [userId],
      (err: any, row: any) => {
        if (err) {
          reject(new Error(`Failed to query user: ${err.message}`))
        } else if (!row) {
          resolve(null)
        } else {
          resolve(row)
        }
      }
    )
  })
}

export function queryUserByEmail(db: sqlite3.Database, email: string): Promise<any> {
    return new Promise((resolve, reject) => {
        db.get(
        `SELECT * FROM users WHERE email = ?`,
        [email],
        (err: any, row: any) => {
            if (err) {
            reject(new Error(`Failed to query user: ${err.message}`))
            } else if (!row) {
            resolve(null)
            } else {
            resolve(row)
            }
        }
        )
    })
}

export function deleteUser(
  db: sqlite3.Database,
  userId: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM users WHERE id = ?`, [userId], (err: any) => {
      if (err) {
        reject(new Error(`Failed to delete user: ${err.message}`))
      } else {
        resolve()
      }
    })
  })
}

export function updateUser(
  db: sqlite3.Database,
  updates: string[],
  params: (string | number)[]
): Promise<void> {
  return new Promise((resolve, reject) => {
    const sql: string = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`

    db.run(sql, params, (err: any) => {
      if (err) {
        reject(new Error(`Failed to update user: ${err.message}`))
      } else {
        resolve()
      }
    })
  })
}
