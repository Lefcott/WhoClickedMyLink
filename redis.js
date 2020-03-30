require('./env');

const redis = require('redis').createClient(process.env.REDISCLOUD_URL);

redis.on('error', err => {
  console.error(`Redis error: ${err}`);
});

redis.on('end', () => {
  console.log('Redis connection closed');
});

redis.on('connect', () => {
  console.log('Connected to REDIS!');
});

module.exports = redis;
