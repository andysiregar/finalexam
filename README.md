# Employee Management System

A simple web application for managing employee data using Node.js, MySQL, and Redis.

## Features

- Add new employees with name, phone, department, email, and position
- View all employees in a searchable table
- Edit existing employee information
- Delete employees
- Redis caching for improved performance
- Responsive web interface

## Prerequisites

Before running this application, make sure you have:

- Node.js (v14 or higher)
- MySQL server
- Redis server

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up MySQL database:**
   - Start your MySQL server
   - Run the SQL script to create the database and table:
   ```bash
   mysql -u root -p < database.sql
   ```

3. **Configure environment variables:**
   - Copy `.env` file and update the database credentials:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=employee_management
   REDIS_HOST=localhost
   REDIS_PORT=6379
   PORT=3000
   ```

4. **Start Redis server:**
   ```bash
   redis-server
   ```

5. **Run the application:**
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

6. **Access the application:**
   Open your browser and go to `http://localhost:3000`

## API Endpoints

- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

## Technology Stack

- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Caching:** Redis
- **Frontend:** HTML, CSS, JavaScript (Vanilla)

## Remote Server Deployment

### Quick Deployment Steps:

1. **Upload files to your server:**
   ```bash
   scp -r . user@your-server-ip:/path/to/app/
   ```

2. **SSH into your server:**
   ```bash
   ssh user@your-server-ip
   cd /path/to/app/
   ```

3. **Run the deployment script:**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

### Manual Deployment Steps:

1. **Install Node.js on server:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Install MySQL:**
   ```bash
   sudo apt install -y mysql-server
   sudo systemctl start mysql
   sudo systemctl enable mysql
   ```

3. **Install Redis:**
   ```bash
   sudo apt install -y redis-server
   sudo systemctl start redis-server
   sudo systemctl enable redis-server
   ```

4. **Set up the application:**
   ```bash
   npm install
   cp .env.example .env
   # Edit .env with your database credentials
   mysql -u root -p < database.sql
   ```

5. **Install PM2 and start app:**
   ```bash
   sudo npm install -g pm2
   pm2 start ecosystem.config.js --env production
   pm2 save
   pm2 startup
   ```

6. **Configure firewall:**
   ```bash
   sudo ufw allow 3000/tcp
   sudo ufw allow ssh
   sudo ufw enable
   ```

### PM2 Commands:
- View status: `pm2 status`
- View logs: `pm2 logs employee-management`
- Restart: `pm2 restart employee-management`
- Stop: `pm2 stop employee-management`
- Monitor: `pm2 monit`

### Access Your App:
- Open: `http://your-server-ip:3000`

## Project Structure

```
├── config/
│   ├── database.js     # MySQL connection
│   └── redis.js        # Redis connection
├── routes/
│   └── employees.js    # Employee API routes
├── public/
│   ├── index.html      # Main HTML file
│   ├── styles.css      # CSS styling
│   └── app.js          # Frontend JavaScript
├── database.sql        # Database schema
├── server.js           # Main server file
├── package.json        # Dependencies
├── ecosystem.config.js # PM2 configuration
├── deploy.sh          # Deployment script
├── .env               # Environment variables
└── .env.example       # Environment template
```