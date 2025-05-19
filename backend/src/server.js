const app = require('./app');
const db = require('./models');

// Set port
const PORT = process.env.PORT || 3000;

// Sync database tables
db.sequelize.sync()
  .then(() => {
    console.log('Database synchronized successfully.');
    
    // Start the server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}.`);
    });
  })
  .catch((err) => {
    console.error('Failed to synchronize database:', err);
  });
