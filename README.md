
## Table of Contents
- [Description](#description)
- [How to run?](#how-to-run)

## Description
This repository is dedicated for the Hangry study case for the backend engineer intern position. The repository contains a User CRUD REST API developed with TypeScript with a runtime of Node.js. The API contains 4 routes and uses a SQLite database to store user's information. 

## How to run?
To run the Node.js application, follow these steps:

1. Make sure you have Node.js installed on your machine. You can download it from the official Node.js website.

2. Open a terminal or command prompt and navigate to the root directory of the project.

3. Install the required dependencies by running the following command:
    ```
    npm install
    ```

4. Start the application by running the following command:
    ```
    npm run dev
    ```

5. The application should now be running on `http://localhost:3000`. You can access the [API endpoints](#endpoints) using a tool like Postman or cURL.

6. To stop the application, press `Ctrl + C` in the terminal or command prompt.

## Endpoints
### GET /user/[userID]
Retrieve a user by id

#### Request
- Method: GET
- URL: `/user/[userID]`

#### Response
- Status Code: 200 OK
- Body:
    ```json
    {
        "id": 1,
        "name": "Azhra Yashna Azka",
        "email": "azhra.azka@ishangry.com",
        "date_of_birth": "2003-01-01"
    }
    ```
- Status code: 404 NOT FOUND
- Body:
    ```json
    {
        "message": "User not found"
    }
    ```

### POST /user
Create an existing user

#### Request
- Method: POST
- URL: `/user`
- Body:
    ```json
    {
        "name": "Azhra Yashna Azka",
        "email": "azhra.azka@ishangry.com",
        "date_of_birth": "2003-01-01"
    }
    ```

#### Response
- Status Code: **201 CREATED**
- Body:
    ```json
    {
        "message": "User created"
    }
    ```
- Status Code: **400 BAD REQUEST** (If one of the attribute is not specified)
- Body:
    ```json
    {
        "message" : "Missing required attributes"
    }
    ```
- Status Code: **400 BAD REQUEST** (Invalid email format)
- Body:
    ```json
    {
        "message": "Invalid email"
    }
    ```
- Status Code: **400 BAD REQUEST** (Invalid date format)
- Body:
    ```json
    {
        "message": "Invalid date of birth"
    }
    ```
- Status Code: **409 CONFLICT** (Email attribute already exists in the database)
- Body:
    ```json
    {
        "message": "Email already exists"
    }
    ```
- Status Code: **500 INTERNAL SERVER ERROR**
    ```json
    {
        "message" : "Internal server error: [error]"        
    }
    ```


### PUT /user/[userID]
Update an existing user

#### Request
- Method: PUT
- URL: `/user/[userID]`
- Body:
    ```json
    {
        "name": "Azhra Yashna Azka",
        "email": "azhra.azka@ishangry.com",
        "date_of_birth": "2003-01-01"
    }
    ```
- Note: You don't have to specify every attribute listed here. For example, you can just specify name in the body and only the name will be updated in the database

#### Response
- Status Code: **200 OK**
- Body:
    ```json
    {
        "message": "User updated"
    }
    ```
- Status Code: **400 BAD REQUEST** (If no attribute is specified)
- Body:
    ```json
    {
        "message" : "No attributes provided for update"
    }
    ```
- Status Code: **400 BAD REQUEST** (Invalid email format)
- Body:
    ```json
    {
        "message": "Invalid email"
    }
    ```
- Status Code: **400 BAD REQUEST** (Invalid date format)
- Body:
    ```json
    {
        "message": "Invalid date of birth"
    }
    ```
- Status Code: **409 CONFLICT** (Email attribute already exists in the database)
- Body:
    ```json
    {
        "message": "Email already exists"
    }
    ```
- Status Code: **500 INTERNAL SERVER ERROR**
    ```json
    {
        "message" : "Internal server error: [error]"        
    }
    ```

### DELETE /user/[userID]
Delete an existing user

#### Request
- Method: DELETE
- URL: `/user/[userID]`

#### Response
- Status Code: **200 OK**
- Body:
    ```json
    {
        "message": "User deleted"
    }
    ```
- Status Code: **404 NOT FOUND** 
- Body:
    ```json
    {
        "message" : "User deleted"
    }
    ```
- Status Code: **500 INTERNAL SERVER ERROR**
    ```json
    {
        "message" : "Internal server error: [error]"        
    }
    ```
