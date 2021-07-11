#!/usr/bin/env node

var TownshipClient = require('township-client')

var email = process.argv.splice(2)[0]
var password = 'dogsandcats'
if (!email) {
  console.error('populate.js <email-address>')
  process.exit(1)
}

var dat = {
  name: 'more-tweets-more-votes',
  title: 'More Tweets More Votes',
  description: "Is social media a valid indicator of political behavior? There is considerable debate about the validity of data extracted from social media for studying offline behavior. To address this issue, we show that there is a statistically significant association between tweets that mention a candidate for the U.S. House of Representatives and his or her subsequent electoral performance. We demonstrate this result with an analysis of 542,969 tweets mentioning candidates selected from a random sample of 3,570,054,618, as well as Federal Election Commission data from 795 competitive races in the 2010 and 2012 U.S. congressional elections. This finding persists even when controlling for incumbency, district partisanship, media coverage of the race, time, and demographic variables such as the district's racial and gender composition. Our findings show that reliable data about political behavior can be extracted from social media",
  url: 'dat://587db7de5a030b9b91ddcb1882cf0e4b67b4609568997eee0d4dfe74ce31d198',
  keywords: 'hi, bye'
}

var township = TownshipClient({
  server: 'http://localhost:8080/api/v1'
})

township.register({ username: 'admin', password: password, email: email }, function (err, resp, json) {
  if (err && err.message.indexOf('exists') === -1) throw new Error(err.message)
  console.log('logging in', email, password)
  township.login({ email: email, password: password }, function (err, resp, json) {
    if (err) throw new Error(err.message)
    township.secureRequest({ url: '/dats', method: 'POST', body: dat, json: true }, function (err, resp, json) {
      if (err) throw new Error(err.message)
      console.log('created dat', dat)
    })
  })
})
