const express = require('express');
const app = express();
const { Sequelize } = require('./models'); // Import Sequelize for error types

// Middleware to parse JSON bodies
app.use(express.json());

// Import db object from models
const db = require('./models');

// API Endpoints

// 1. Create a new project
app.post('/api/projects', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({ error: 'Project name is required and must be a non-empty string.' });
        }
        const project = await db.Project.create({ name: name.trim() });
        res.status(201).json(project);
    } catch (error) {
        if (error instanceof Sequelize.UniqueConstraintError) {
            return res.status(409).json({ error: 'Project name already exists.' });
        }
        if (error instanceof Sequelize.ValidationError) {
            return res.status(400).json({ error: 'Validation error', details: error.errors.map(e => e.message) });
        }
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project.' });
    }
});

// 2. Get all projects
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await db.Project.findAll();
        res.status(200).json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects.' });
    }
});

// 3. Get all unavailability records for a specific project
app.get('/api/projects/:projectId/unavailability', async (req, res) => {
    try {
        const { projectId } = req.params;
        if (isNaN(parseInt(projectId))) {
            return res.status(400).json({ error: 'Invalid project ID format.' });
        }

        const project = await db.Project.findByPk(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found.' });
        }

        const unavailabilities = await db.Unavailability.findAll({
            where: { project_id: projectId }
        });
        res.status(200).json(unavailabilities);
    } catch (error) {
        console.error('Error fetching unavailability:', error);
        res.status(500).json({ error: 'Failed to fetch unavailability.' });
    }
});

// 4. Add an unavailability record for a user in a project
app.post('/api/projects/:projectId/users/:userName/unavailability', async (req, res) => {
    try {
        const { projectId, userName } = req.params;
        const { date } = req.body;

        if (!userName || typeof userName !== 'string' || userName.trim() === '') {
            return res.status(400).json({ error: 'User name is required.' });
        }
        if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({ error: 'Date is required and must be in YYYY-MM-DD format.' });
        }
        if (isNaN(parseInt(projectId))) {
            return res.status(400).json({ error: 'Invalid project ID format.' });
        }
        
        const project = await db.Project.findByPk(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found.' });
        }

        const unavailability = await db.Unavailability.create({
            project_id: parseInt(projectId),
            user_name: userName.trim(),
            unavailable_date: date
        });
        res.status(201).json(unavailability);
    } catch (error) {
        if (error instanceof Sequelize.UniqueConstraintError) {
            return res.status(409).json({ error: 'This date is already marked as unavailable for this user in this project.' });
        }
        if (error instanceof Sequelize.ValidationError) {
            return res.status(400).json({ error: 'Validation error', details: error.errors.map(e => e.message) });
        }
        console.error('Error adding unavailability:', error);
        res.status(500).json({ error: 'Failed to add unavailability.' });
    }
});

// 5. Delete an unavailability record for a user in a project on a specific date
app.delete('/api/projects/:projectId/users/:userName/unavailability/:dateString', async (req, res) => {
    try {
        const { projectId, userName, dateString } = req.params;

        if (!userName || typeof userName !== 'string' || userName.trim() === '') {
            return res.status(400).json({ error: 'User name is required.' });
        }
        if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            return res.status(400).json({ error: 'Date string is required and must be in YYYY-MM-DD format.' });
        }
         if (isNaN(parseInt(projectId))) {
            return res.status(400).json({ error: 'Invalid project ID format.' });
        }

        const numDeleted = await db.Unavailability.destroy({
            where: {
                project_id: parseInt(projectId),
                user_name: userName.trim(),
                unavailable_date: dateString
            }
        });

        if (numDeleted === 0) {
            return res.status(404).json({ error: 'Unavailability record not found.' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting unavailability:', error);
        res.status(500).json({ error: 'Failed to delete unavailability.' });
    }
});

// 6. Get all unique participant names for a specific project
app.get('/api/projects/:projectId/participants', async (req, res) => {
    try {
        const { projectId } = req.params;
        if (isNaN(parseInt(projectId))) {
            return res.status(400).json({ error: 'Invalid project ID format.' });
        }

        const project = await db.Project.findByPk(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found.' });
        }

        const participantsRecords = await db.Unavailability.findAll({
            where: { project_id: parseInt(projectId) },
            attributes: [
                [db.Sequelize.fn('DISTINCT', db.Sequelize.col('user_name')), 'userName']
            ],
            raw: true // Ensures we get plain objects
        });
        
        const participantNames = participantsRecords.map(p => p.userName);
        res.status(200).json(participantNames);
    } catch (error) {
        console.error('Error fetching participants:', error);
        res.status(500).json({ error: 'Failed to fetch participants.' });
    }
});


// Define port
const PORT = process.env.PORT || 3001;

// Test DB connection, sync models, and start server
db.sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
    // Sync models with the database
    // { alter: true } checks the current state of the table in the database (which columns it has, what are their data types, etc),
    // and then performs the necessary changes in the table to make it match the model.
    // Avoid using { force: true } in production as it will drop tables.
    return db.sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('All models were synchronized successfully.');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database or sync models:', err);
    // Optionally, exit the process if the database connection is critical
    // process.exit(1); 
  });
