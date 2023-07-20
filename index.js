import http2 from 'http2'
import express from 'express'
import cron from 'node-cron'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import dotenv from 'dotenv'
dotenv.config()

console.log(process.env.PRIVATE_KEY, process.env.KEY_ID)

const privateKey =
  process.env.PRIVATE_KEY || fs.readFileSync('./AuthKey.p8', 'utf8')

let token = jwt.sign(
  {
    iss: 'M5SRZY657F',
    iat: Math.floor(Date.now() / 1000)
  },
  privateKey,
  {
    header: {
      alg: 'ES256',
      kid: process.env.KEY_ID,
      typ: undefined
    }
  }
)
console.log(token)

cron.schedule('*/45 * * * *', (time) => {
  token = jwt.sign(
    {
      iss: 'M5SRZY657F',
      iat: Math.floor(Date.now() / 1000)
    },
    privateKey,
    {
      header: {
        alg: 'ES256',
        kid: process.env.KEY_ID,
        typ: undefined
      }
    }
  )
  console.log('refreshing the token: (every 45 minutes)', time, token)
})

const host = 'https://api.push.apple.com'
const path = '/3/device/'

const app = express()
app.use(express.json())
const port = process.env.PORT || 3000

const client = http2.connect(host, {})

client.on('connect', (ddd, ww) => {
  console.log('connected to APNs')
})

client.on('error', (err) => console.error('Error -> ', err))

client.on('close', () => {
  console.log('closed connection to APNs')
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/new-comment', (req, res) => {
  console.log(req.body)
  res.send('Sent notification to comment thread!')

  const body = {
    aps: {
      alert: {
        title: req.body.title,
        subtitle: req.body.subtitle,
        body: req.body.body
      },
      badge: 1,
      sound: 'default',
      'content-available': 1
    }
  }

  const headers = {
    ':method': 'POST',
    'apns-topic': 'com.Jawwaad.OurCommunity', //application bundle ID
    'apns-push-type': 'alert',
    ':scheme': 'https',
    authorization: 'bearer ' + token
  }

  req.body.devices.forEach((device) => {
    headers[':path'] = path + device
    console.log(headers)

    const request = client.request(headers)

    request.on('response', (headers, flags) => {
      for (const name in headers) {
        console.log(`${name}: ${headers[name]}`)
      }
    })

    request.setEncoding('utf8')

    let data = ''
    request.on('data', (chunk) => {
      console.log('Chunk -> ', chunk)
      data += chunk
    })
    request.write(JSON.stringify(body))
    request.on('error', (err) => console.error(err))
    request.on('end', () => {
      console.log(`\n Data -> ${data}`)
    })
    request.end()
  })
})

app.on('close', () => {
  '!!Closing connection to APNs!!'
  client.close()
})

app.listen(port, () => {
  console.log(`Push notification server listening on port ${port}`)
})
