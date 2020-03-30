require('./env');

const express = require('express');
const moment = require('moment');

const redis = require('./redis');

const app = express();

app.set('trust proxy', true);

const parseDate = str => {
  const date = new Date(str);
  let month = date.getMonth();
  let day = date.getDate();
  const year = date.getFullYear();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  month = month < 10 ? `0${month}` : month;
  day = day < 10 ? `0${day}` : day;
  hours = hours < 10 ? `0${hours}` : hours;
  minutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

app.get('/index.css', (req, res) => {
  res.sendFile(`${__dirname}/index.css`);
});

app.get('/create-link', (req, res) => {
  res.sendFile(`${__dirname}/create-link.html`);
});

app.get('/create-link.css', (req, res) => {
  res.sendFile(`${__dirname}/create-link.css`);
});

app.get('/history', (req, res) => {
  redis.smembers('history', (error, members) => {
    if (error) {
      console.error('Redis error getting list');
      return res.send('Redis error getting list');
    }
    res.send(`
<html>
<head><title>Historial de Clicks</title></head>
<body>
  <input type = 'button' value = 'VOLVER' onclick = 'window.location = "/";'>
  <h1>Historial de Clicks</h1>
  <table style = 'width: 80%;'>
    <tr>
      <th>IP de origen</th>
      <th>Fecha y hora (DMA)</th>
      <th>Link</th>
    </tr>
    ${members.map(member => `
    <tr style = 'text-align: center;'>
      ${JSON.parse(member).map(cell => `<td style = 'border-style: solid; border-width: 1px;'>${cell}</td>`).join('<br>')}
    </tr>
    `).join('<br>')}
  </table>
</body>
</html>
    `);
  });
});

app.get('/link/:link', (req, res) => {
  const link = Buffer.from(req.params.link, 'base64').toString();
  const reg = [req.ip, parseDate(moment().utcOffset('-0300').format()), link];
  redis.sadd('history', JSON.stringify(reg), (error, result) => {
    if (error) {
      return console.error('REDIS error saving history register', error);
    }
    console.log(result);
  });
  res.redirect(link);
});

app.listen(process.env.PORT, () => {
  console.log(`Listening on ${process.env.PORT} with environment ${process.env.NODE_ENV}`);
});