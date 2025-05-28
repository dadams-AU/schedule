const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.js')[env];

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  logging: config.logging === undefined ? (env === 'development' ? console.log : false) : config.logging,
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Define Project model
db.Project = sequelize.define('Project', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  }
  // Sequelize automatically adds id, createdAt, updatedAt
});

// Define Unavailability model
db.Unavailability = sequelize.define('Unavailability', {
  user_name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  unavailable_date: {
    type: Sequelize.DATEONLY, // Stores date as YYYY-MM-DD
    allowNull: false
  },
  project_id: { // This will be the foreign key column
     type: Sequelize.INTEGER,
     allowNull: false,
    //  references: { // Sequelize handles this via associations
    //      model: 'Projects', // Name of the target table
    //      key: 'id'
    //  }
  }
}, {
  indexes: [
    {
      unique: true,
      name: 'unique_project_user_date', // Optional: specify a name for the constraint
      fields: ['project_id', 'user_name', 'unavailable_date']
    }
  ]
});

// Associations
// Project has many Unavailability entries
db.Project.hasMany(db.Unavailability, { 
  foreignKey: {
    name: 'project_id',
    allowNull: false 
  },
  onDelete: 'CASCADE', 
  hooks: true // Enable hooks for operations like cascade delete
});

// Unavailability belongs to a Project
db.Unavailability.belongsTo(db.Project, { 
  foreignKey: {
    name: 'project_id',
    allowNull: false
  }
});
        
module.exports = db;
