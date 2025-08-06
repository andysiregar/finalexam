const express = require('express');
const router = express.Router();
const redisClient = require('../config/redis');
const { requireAuthAPI } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(requireAuthAPI);

router.get('/', async (req, res) => {
    try {
        const db = req.app.locals.db;
        const cacheKey = 'employees:all';
        const cached = await redisClient.get(cacheKey);
        
        if (cached) {
            return res.json(JSON.parse(cached));
        }

        const [rows] = await db.execute('SELECT * FROM employees ORDER BY created_at DESC');
        
        await redisClient.setEx(cacheKey, 300, JSON.stringify(rows));
        
        res.json(rows);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { id } = req.params;
        const cacheKey = `employee:${id}`;
        const cached = await redisClient.get(cacheKey);
        
        if (cached) {
            return res.json(JSON.parse(cached));
        }

        const [rows] = await db.execute('SELECT * FROM employees WHERE id = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        await redisClient.setEx(cacheKey, 300, JSON.stringify(rows[0]));
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching employee:', error);
        res.status(500).json({ error: 'Failed to fetch employee' });
    }
});

router.post('/', async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { name, phone, department, email, position } = req.body;
        
        if (!name || !phone || !department) {
            return res.status(400).json({ error: 'Name, phone, and department are required' });
        }

        const [result] = await db.execute(
            'INSERT INTO employees (name, phone, department, email, position) VALUES (?, ?, ?, ?, ?)',
            [name, phone, department, email || null, position || null]
        );

        await redisClient.del('employees:all');

        res.status(201).json({ 
            id: result.insertId, 
            message: 'Employee created successfully' 
        });
    } catch (error) {
        console.error('Error creating employee:', error);
        res.status(500).json({ error: 'Failed to create employee' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { id } = req.params;
        const { name, phone, department, email, position } = req.body;
        
        if (!name || !phone || !department) {
            return res.status(400).json({ error: 'Name, phone, and department are required' });
        }

        const [result] = await db.execute(
            'UPDATE employees SET name = ?, phone = ?, department = ?, email = ?, position = ? WHERE id = ?',
            [name, phone, department, email || null, position || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        await redisClient.del('employees:all');
        await redisClient.del(`employee:${id}`);

        res.json({ message: 'Employee updated successfully' });
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({ error: 'Failed to update employee' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { id } = req.params;

        const [result] = await db.execute('DELETE FROM employees WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        await redisClient.del('employees:all');
        await redisClient.del(`employee:${id}`);

        res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ error: 'Failed to delete employee' });
    }
});

module.exports = router;