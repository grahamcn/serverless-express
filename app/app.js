const express = require('express')
const axios = require('axios')
const app = express()

app.get('/hubs/:postcode', (req, res) => {
  const {postcode} = req.params

  const options = {}
  options.responseType = 'json'
  options.url = `https://frontend.staging.tyresonthedrive.com/api/v1/hubs?postcode=${postcode}`
  options.headers = {
    'x-otd-clientid': 'totd'
  }

  axios(options)
    .then(({ data }) =>
      res.json(data)
    ).catch(error => {
      console.log('/hubId/:postcode error', error)
      res.sendStatus(500)
    })
})


app.get('*', (req, res) => {
  res.json({
    message: 'Hello world'
  })
})

module.exports = app
