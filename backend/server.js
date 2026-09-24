require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`MindFlow Backend API running on port ${PORT}`);
  console.log(`Healthcheck: http://localhost:${PORT}/api/health`);
});
