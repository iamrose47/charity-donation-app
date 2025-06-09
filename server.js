const express = require('express');
const sequelize = require('./config/db');
const app = express();
require('dotenv').config();
const morgan = require('morgan');

const User = require('./models/User');
const Charity = require('./models/Charity');
const Donation = require('./models/Donation');
const ImpactReport = require('./models/ImpactReport');


// Middlewares
app.use(express.json());
app.use(morgan('dev'));

// Routes
const userRoutes = require('./routes/user');
const charityRoutes = require('./routes/charity');
const donationRoutes = require('./routes/donation');
const impactReportRoutes = require('./routes/impactReport');
const adminRoutes = require('./routes/admin');


app.use('/user', userRoutes);
app.use('/charity', charityRoutes);
app.use('/donation', donationRoutes);
app.use('/impact-report',impactReportRoutes);
app.use('/admin', adminRoutes);

// Associations
User.hasMany(Donation, { foreignKey: 'userId' });
Donation.belongsTo(User, { foreignKey: 'userId' });

Charity.hasMany(Donation, { foreignKey: 'charityId' });
Donation.belongsTo(Charity, { foreignKey: 'charityId' });

Charity.hasMany(ImpactReport, { foreignKey: 'charityId' });
ImpactReport.belongsTo(Charity, { foreignKey: 'charityId' });


// Server start
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    await sequelize.sync({ alter: true }); // use force only in dev
    console.log('Database synced');

    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server running on port ${process.env.PORT || 3000}`);
    });
  } catch (err) {
    console.error('Error starting server:', err);
  }
})();
