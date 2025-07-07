// IMPORTANTE: Pega aquí la URL de tu aplicación web de Apps Script.
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxdfyNOGfQT87Wa_eB1GzyWPVRz4L093jZ7tld99Tc4gLYu7L4MMhtFEdfpNAjYN_eK/exec';

const form = document.getElementById('user-form');
const tableBody = document.querySelector('#user-table tbody');
const cancelEditButton = document.getElementById('cancel-edit');

// Función para cargar los usuarios
async function loadUsers() {
    tableBody.innerHTML = '<tr><td colspan="4">Cargando...</td></tr>';
    try {
        const response = await fetch(SCRIPT_URL);
        if (!response.ok) throw new Error('Error al cargar datos');
        
        const users = await response.json();
        tableBody.innerHTML = ''; // Limpiar la tabla
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.ID}</td>
                <td>${user.Nombre}</td>
                <td>${user.Email}</td>
                <td class="actions">
                    <button onclick="editUser('${user.ID}', '${user.Nombre}', '${user.Email}')">Editar</button>
                    <button onclick="deleteUser('${user.ID}')">Borrar</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error:', error);
        tableBody.innerHTML = `<tr><td colspan="4">Error al cargar los datos. ${error.message}</td></tr>`;
    }
}

// Evento para guardar (crear o actualizar)
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('userId').value;
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    
    const action = id ? 'update' : 'create';
    const data = {
        action: action,
        data: {
            Nombre: name,
            Email: email
        }
    };
    if (id) data.data.ID = id;

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        });
        
        const result = await response.json();
        alert(result.message);

        if (result.status === 'success') {
            form.reset();
            document.getElementById('userId').value = '';
            cancelEditButton.style.display = 'none';
            loadUsers();
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ocurrió un error al guardar.');
    }
});

// Función para preparar la edición
function editUser(id, name, email) {
    document.getElementById('userId').value = id;
    document.getElementById('userName').value = name;
    document.getElementById('userEmail').value = email;
    cancelEditButton.style.display = 'inline-block';
    window.scrollTo(0, 0);
}

// Función para borrar un usuario
async function deleteUser(id) {
    if (!confirm(`¿Estás seguro de que quieres borrar el usuario con ID ${id}?`)) {
        return;
    }

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'delete', data: { ID: id } }),
            headers: { 'Content-Type': 'application/json' }
        });

        const result = await response.json();
        alert(result.message);
        if (result.status === 'success') {
            loadUsers();
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ocurrió un error al borrar.');
    }
}

// Cancelar edición
cancelEditButton.addEventListener('click', () => {
    form.reset();
    document.getElementById('userId').value = '';
    cancelEditButton.style.display = 'none';
});

// Carga inicial de usuarios
document.addEventListener('DOMContentLoaded', loadUsers);
