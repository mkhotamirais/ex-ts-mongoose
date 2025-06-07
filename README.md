# About This Project
## How to build rest-api with typescript in this project
- create new folder and open vs code
npm init -y
- npm i -D typescript ts-node nodemon
- npm i dotenv express cookie-parser compression cors mongoose
- npm i -D @types/express @types/cookie-parser @types/compression @types/cors @types/mongoose
- npx tsc --init
{
    "compilerOptions": {
        /* Projects */

        /* Language and Environment */

        /* Modules */
        "module": "NodeNext",
        "moduleResolution": "nodenext",
        "baseUrl": "src",

      
        /* JavaScript Support */
        
        /* Emit */
        "sourceMap": true,
        "outDir": "dist",


        /* Interop Constraints */
        "forceConsistentCasingInFileNames": true,

        /* Type Checking */
        "strict": true,
        "noImplicitAny": true
        
        /* Completeness */
    },
    "include": [
        "src/**/*"
    ]
}
- optional create: nodemon.json
{
    "watch": ["src"],
    "ext": ".ts, .js",
    "exec": "ts-node ./src/index.ts"
}
- tambah pada file: package.json
  "scripts": {
    "start": "nodemon",
  },
- npm start

## How to run this project
### Prerequisite
Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/en/) (v14 or higher)
- [npm](https://www.npmjs.com/get-npm) (comes with Node.js)
- Project uses [TypeScript](https://www.typescriptlang.org/), which will be installed with dependencies.
- [MongoDB](https://www.mongodb.com/) (local installation or MongoDB Atlas for cloud database)

### Installation
1. **Clone the repository**   
Clone the project to your local machine by running:

  ```bash
  git clone https://github.com/mkhotamirais/ex-ts-mongoose.git
  ```
2. **Navigate into the project direction**  
  ```
  cd job-hst-be
  ```
3. **Install dependencies**   
  ```
  npm install
  ```
### Create the .env file
  ```
  PORT=3001
  MONGO_URI=mongodb://127.0.0.1:27017/task-db?retryWrites=true&w=majority
  ```
### Running the development server   
  ```
  npm start
  ```
The project should now be running at:

  ```
  http://localhost:3001
  ```
