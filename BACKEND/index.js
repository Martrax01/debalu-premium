const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');

const app = express();
app.use(cors());
app.use(express.json());

// ================= CONEXIÓN A BASE DE DATOS =================
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'debalu_db'
});

db.connect((err) => {
  if (err) return console.error('❌ Error BD:', err.message);
  console.log('✅ Conectado a MySQL');

  //Tabla Sabores
  db.query(`CREATE TABLE IF NOT EXISTS sabores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price VARCHAR(50) NOT NULL,
    image VARCHAR(255) NOT NULL,
    is_deleted BOOLEAN DEFAULT 0
  )`, () => {
    db.query("SHOW COLUMNS FROM sabores LIKE 'is_deleted'", (err, results) => {
      if (results && results.length === 0) {
        db.query('ALTER TABLE sabores ADD COLUMN is_deleted BOOLEAN DEFAULT 0');
      }
    });
  });

  //Tabla Usuarios
  db.query(`CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'empleado'
  )`, () => {
    
    db.query("SHOW COLUMNS FROM usuarios LIKE 'role'", (err, results) => {
      if (results && results.length === 0) {
        db.query("ALTER TABLE usuarios ADD COLUMN role VARCHAR(50) DEFAULT 'empleado'", () => {
          console.log('🔧 Tabla "usuarios" reparada: Columna de roles inyectada.');
          db.query("UPDATE usuarios SET role = 'gerente' WHERE username = 'admin'");
        });
      } else {
        db.query("UPDATE usuarios SET role = 'gerente' WHERE username = 'admin'");
      }
    });

    db.query("SELECT * FROM usuarios WHERE username = 'admin'", async (err, results) => {
      if (!err && results.length === 0) {
        const hash = await bcrypt.hash('admin123', 10);
        db.query('INSERT INTO usuarios (username, password_hash, role) VALUES (?, ?, ?)', ['admin', hash, 'gerente']);
        console.log('🔐 Cuenta Gerente Principal Creada: admin | admin123');
      }
    });
  });

  //Tabla Logs
  db.query(`CREATE TABLE IF NOT EXISTS logs_acceso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100),
    ip VARCHAR(50),
    browser VARCHAR(255),
    event VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  //Tabla Ventas
  db.query(`CREATE TABLE IF NOT EXISTS ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sabor_nombre VARCHAR(255) NOT NULL,
    cantidad INT NOT NULL,
    total_bs DECIMAL(10,2) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM usuarios WHERE username = ?', [username], async (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ error: 'Usuario no encontrado' });
    const match = await bcrypt.compare(password, results[0].password_hash);
    if (match) {
      db.query('INSERT INTO logs_acceso (username, ip, browser, event) VALUES (?, ?, ?, ?)', [username, req.ip || req.connection.remoteAddress, req.headers['user-agent'], 'Ingreso']);
      res.json({ message: 'Login exitoso', username: results[0].username, role: results[0].role });
    } else res.status(401).json({ error: 'Contraseña incorrecta' });
  });
});

app.post('/api/register', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    db.query('INSERT INTO usuarios (username, password_hash, role) VALUES (?, ?, ?)', [username, hash, role || 'empleado'], (err) => {
      if (err) return res.status(400).json({ error: 'El nombre de usuario ya está ocupado' });
      res.json({ message: 'Usuario registrado con éxito' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

app.get('/api/usuarios', (req, res) => {
  db.query('SELECT id, username, role FROM usuarios', (err, results) => {
    if (err) res.status(500).json({ error: 'Error al traer usuarios' });
    else res.json(results);
  });
});

app.delete('/api/usuarios/:id', (req, res) => {
  db.query('DELETE FROM usuarios WHERE id = ?', [req.params.id], (err) => {
    if (err) res.status(500).json({ error: 'No se pudo eliminar al usuario' });
    else res.json({ message: 'Usuario removido del sistema con éxito' });
  });
});

app.post('/api/logout', (req, res) => {
  db.query('INSERT INTO logs_acceso (username, ip, browser, event) VALUES (?, ?, ?, ?)', [req.body.username, req.ip || req.connection.remoteAddress, req.headers['user-agent'], 'Salida']);
  res.json({ message: 'Logout registrado' });
});

app.get('/api/sabores', (req, res) => {
  db.query('SELECT * FROM sabores WHERE is_deleted = 0', (err, results) => {
    if (err) res.status(500).json({ error: 'Error' });
    else res.json(results);
  });
});

app.post('/api/sabores', (req, res) => {
  db.query('INSERT INTO sabores (name, price, image) VALUES (?, ?, ?)', [req.body.name, req.body.price, req.body.image], (err, results) => {
    if (err) res.status(500).json({ error: 'Error' });
    else res.json({ id: results.insertId });
  });
});

app.delete('/api/sabores/:id', (req, res) => {
  db.query('UPDATE sabores SET is_deleted = 1 WHERE id = ?', [req.params.id], (err) => {
    if (err) res.status(500).json({ error: 'Error' });
    else res.json({ message: 'Eliminado con éxito' });
  });
});

app.post('/api/ventas', (req, res) => {
  req.body.items.forEach(item => {
    const totalItem = (parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0) * item.quantity;
    db.query('INSERT INTO ventas (sabor_nombre, cantidad, total_bs) VALUES (?, ?, ?)', [item.name, item.quantity, totalItem]);
  });
  res.json({ message: 'Ventas registradas' });
});

app.get('/api/estadisticas', (req, res) => {
  db.query('SELECT sabor_nombre as name, SUM(cantidad) as Ventas FROM ventas GROUP BY sabor_nombre ORDER BY Ventas DESC', (err, results) => {
    if (err) res.status(500).json({ error: 'Error BD' });
    else res.json(results); 
  });
});

app.get('/api/logs', (req, res) => {
  db.query('SELECT * FROM logs_acceso ORDER BY timestamp DESC LIMIT 20', (err, results) => {
    if (err) res.status(500).json({ error: 'Error BD' });
    else res.json(results);
  });
});

app.listen(3000, () => console.log('🚀 Servidor Full-Secure listo en puerto 3000'));
app.post('/api/register', [
  check('username', 'El nombre de usuario es obligatorio').notEmpty(),
  check('password', 'La contraseña debe tener mínimo 6 caracteres').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { username, password, role } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    db.query('INSERT INTO usuarios (username, password_hash, role) VALUES (?, ?, ?)', [username, hash, role || 'empleado'], (err) => {
      if (err) return res.status(400).json({ error: 'El usuario ya existe' });
      res.json({ message: 'Usuario registrado con éxito' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

app.post('/api/sabores', [
  check('name', 'El nombre no puede ir vacío').notEmpty(),
  check('price', 'El precio es obligatorio').notEmpty()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  db.query('INSERT INTO sabores (name, price, image) VALUES (?, ?, ?)', [req.body.name, req.body.price, req.body.image], (err, results) => {
    if (err) res.status(500).json({ error: 'Error al guardar' });
    else res.json({ id: results.insertId });
  });
});