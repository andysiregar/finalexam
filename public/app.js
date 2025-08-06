class EmployeeManager {
    constructor() {
        this.baseURL = '/api/employees';
        this.currentEditId = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadEmployees();
    }

    bindEvents() {
        const form = document.getElementById('employeeForm');
        const searchInput = document.getElementById('searchInput');
        const cancelBtn = document.getElementById('cancelBtn');

        form.addEventListener('submit', (e) => this.handleSubmit(e));
        searchInput.addEventListener('input', (e) => this.handleSearch(e));
        cancelBtn.addEventListener('click', () => this.cancelEdit());
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const employeeData = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            department: formData.get('department'),
            email: formData.get('email'),
            position: formData.get('position')
        };

        try {
            if (this.currentEditId) {
                await this.updateEmployee(this.currentEditId, employeeData);
            } else {
                await this.createEmployee(employeeData);
            }
            
            this.resetForm();
            this.loadEmployees();
        } catch (error) {
            this.showError('Failed to save employee: ' + error.message);
        }
    }

    async createEmployee(employeeData) {
        const response = await fetch(this.baseURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(employeeData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create employee');
        }

        this.showSuccess('Employee added successfully!');
        return response.json();
    }

    async updateEmployee(id, employeeData) {
        const response = await fetch(`${this.baseURL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(employeeData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update employee');
        }

        this.showSuccess('Employee updated successfully!');
        return response.json();
    }

    async deleteEmployee(id) {
        if (!confirm('Are you sure you want to delete this employee?')) {
            return;
        }

        try {
            const response = await fetch(`${this.baseURL}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete employee');
            }

            this.showSuccess('Employee deleted successfully!');
            this.loadEmployees();
        } catch (error) {
            this.showError('Failed to delete employee: ' + error.message);
        }
    }

    async loadEmployees() {
        this.showLoading(true);
        
        try {
            const response = await fetch(this.baseURL);
            
            if (!response.ok) {
                throw new Error('Failed to fetch employees');
            }

            const employees = await response.json();
            this.renderEmployees(employees);
        } catch (error) {
            this.showError('Failed to load employees: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    renderEmployees(employees) {
        const tbody = document.getElementById('employeeTableBody');
        
        if (employees.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <h3>No employees found</h3>
                        <p>Add your first employee using the form on the left.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = employees.map(employee => `
            <tr>
                <td>${employee.id}</td>
                <td>${this.escapeHtml(employee.name)}</td>
                <td>${this.escapeHtml(employee.phone)}</td>
                <td>${this.escapeHtml(employee.department)}</td>
                <td>${employee.email ? this.escapeHtml(employee.email) : '-'}</td>
                <td>${employee.position ? this.escapeHtml(employee.position) : '-'}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="employeeManager.editEmployee(${employee.id})">
                        Edit
                    </button>
                    <button class="action-btn delete-btn" onclick="employeeManager.deleteEmployee(${employee.id})">
                        Delete
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async editEmployee(id) {
        try {
            const response = await fetch(`${this.baseURL}/${id}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch employee');
            }

            const employee = await response.json();
            this.populateForm(employee);
            this.currentEditId = id;
            
            document.getElementById('submitBtn').textContent = 'Update Employee';
            document.getElementById('cancelBtn').style.display = 'inline-block';
            
            document.querySelector('.add-employee h2').textContent = 'Edit Employee';
        } catch (error) {
            this.showError('Failed to load employee: ' + error.message);
        }
    }

    populateForm(employee) {
        document.getElementById('name').value = employee.name || '';
        document.getElementById('phone').value = employee.phone || '';
        document.getElementById('department').value = employee.department || '';
        document.getElementById('email').value = employee.email || '';
        document.getElementById('position').value = employee.position || '';
    }

    cancelEdit() {
        this.resetForm();
    }

    resetForm() {
        document.getElementById('employeeForm').reset();
        this.currentEditId = null;
        document.getElementById('submitBtn').textContent = 'Add Employee';
        document.getElementById('cancelBtn').style.display = 'none';
        document.querySelector('.add-employee h2').textContent = 'Add New Employee';
    }

    handleSearch(e) {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#employeeTableBody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const shouldShow = text.includes(searchTerm);
            row.style.display = shouldShow ? '' : 'none';
        });
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        const table = document.getElementById('employeeTableContainer');
        
        if (show) {
            loading.style.display = 'block';
            table.style.display = 'none';
        } else {
            loading.style.display = 'none';
            table.style.display = 'block';
        }
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showMessage(message, type) {
        const existingMessage = document.querySelector('.error-message, .success-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `${type}-message`;
        messageDiv.textContent = message;
        
        const form = document.getElementById('employeeForm');
        form.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

const employeeManager = new EmployeeManager();