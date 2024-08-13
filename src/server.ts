import * as http from "http"
import { handleRequest } from "./routes"

const PORT: number = 3000

const server: http.Server = http.createServer(
  (req: http.IncomingMessage, res: http.ServerResponse) => {
    handleRequest(req, res)
  }
)

// Start the server and listen on the specified port
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
