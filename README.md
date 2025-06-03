- create new folder and open vs code
- npm init -y
- npm i -D typescript ts-node nodemon
- npm i dotenv express cookie-parser compression cors mongoose
- npm i -D @types/express @types/cookie-parser @types/compression @types/cors @types/mongoose
- npx tsc --init
{
    "compilerOptions": {
        "forceConsistentCasingInFileNames": true,
        "strict": true,
        "module": "NodeNext",
        "moduleResolution": "nodenext",
        "baseUrl": "src",
        "outDir": "dist",
        "sourceMap": true,
        "noImplicitAny": true
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
