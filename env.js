if (!process.env.NODE_ENV || process.env.NODE_ENV === 'localhost') {
  require('dotenv').config({ path: 'localhost.env' });
}
