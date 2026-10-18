import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'avukat_bureau_secret_key_2026';

app.use(cors({ origin: '*' }));
app.use(express.json());

// Dosya yükleme klasörü
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

let db;
async function initDb() {
  db = await open({
    filename: path.join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database
  });

  // Tablolar (types/index.ts ile %100 Uyumlu)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      password TEXT,
      name TEXT NOT NULL,
      role TEXT NOT NULL, -- 'developer' | 'admin' | 'avukat' | 'stajyer' | 'sekreter'
      avatar TEXT,
      color TEXT
    );

    CREATE TABLE IF NOT EXISTS cases (
      id TEXT PRIMARY KEY,
      caseNumber TEXT,
      folioNumber TEXT,
      title TEXT NOT NULL,
      clientName TEXT,
      caseType TEXT,
      status TEXT DEFAULT 'aktif',
      assignedTo TEXT, -- JSON Array string
      targetDate TEXT,
      strictDate TEXT,
      priority TEXT DEFAULT 'normal',
      description TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS sub_tasks (
      id TEXT PRIMARY KEY,
      caseId TEXT,
      title TEXT NOT NULL,
      assignedTo TEXT,
      completed INTEGER DEFAULT 0,
      completedAt TEXT,
      completedBy TEXT,
      FOREIGN KEY(caseId) REFERENCES cases(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS attachments (
      id TEXT PRIMARY KEY,
      caseId TEXT,
      fileName TEXT NOT NULL,
      filePath TEXT,
      fileType TEXT,
      fileSize INTEGER,
      uploadedBy TEXT,
      uploadedAt TEXT,
      FOREIGN KEY(caseId) REFERENCES cases(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      userId TEXT,
      userName TEXT,
      action TEXT,
      targetType TEXT,
      targetId TEXT,
      targetName TEXT,
      timestamp TEXT
    );
  `);

  // 1. Kullanıcı Tohumlama (Seed Users)
  const devPasswordHash = await bcrypt.hash('dev123456', 10);
  const adminPasswordHash = await bcrypt.hash('admin123456', 10);
  const defaultPasswordHash = await bcrypt.hash('123456', 10);

  // Geliştirici (Süper Admin)
  await db.run(`
    INSERT OR IGNORE INTO users (id, username, password, name, role, avatar, color)
    VALUES ('dev1', 'dev', ?, 'Geliştirici (Dev)', 'developer', 'DEV', 'bg-purple-600')
  `, [devPasswordHash]);

  const defaultUsers = [
    { id: 'u1', username: 'ezgi', name: 'Av. Ezgi Atik', role: 'avukat', avatar: 'MD', color: 'bg-primary-500' },
    { id: 'u2', username: 'umut', name: 'Stajyer Umut Dilmaç', role: 'stajyer', avatar: 'AD', color: 'bg-emerald-500' },
    { id: 'u3', username: 'ayse', name: 'Sekreter Ayşe Bakmaz', role: 'sekreter', avatar: 'AB', color: 'bg-accent-500' },
    { id: 'u4', username: 'admin', name: 'Yönetici İbrahim Akkuş', role: 'admin', avatar: 'İA', color: 'bg-rose-500' },
  ];

  for (const u of defaultUsers) {
    const pwd = u.username === 'admin' ? adminPasswordHash : defaultPasswordHash;
    await db.run(`
      INSERT OR IGNORE INTO users (id, username, password, name, role, avatar, color)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [u.id, u.username, pwd, u.name, u.role, u.avatar, u.color]);
  }

  console.log('Veritabanı bağlantısı ve yetkilendirmeler başarıyla tamamlandı.');
}

initDb();

// JWT Kimlik Doğrulama Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Oturum açmanız gerekiyor.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Oturum süreniz dolmuş veya geçersiz.' });
    req.user = user;
    next();
  });
};

// --- API ENDPOINTS ---

// 1. Login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (!user) return res.status(400).json({ error: 'Kullanıcı bulunamadı.' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Hatalı şifre.' });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Kullanıcı İşlemleri
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const users = await db.all('SELECT id, username, name, role, avatar, color FROM users');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', authenticateToken, async (req, res) => {
  if (req.user.role !== 'developer' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Yeni kullanıcı oluşturma yetkiniz yok.' });
  }

  const { username, password, name, role, color } = req.body;
  try {
    const existing = await db.get('SELECT id FROM users WHERE username = ?', [username]);
    if (existing) return res.status(400).json({ error: 'Bu kullanıcı adı zaten alınmış.' });

    const hashedPassword = await bcrypt.hash(password || '123456', 10);
    const id = 'u_' + Date.now();
    const avatar = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    await db.run(`
      INSERT INTO users (id, username, password, name, role, avatar, color)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, username, hashedPassword, name, role, avatar, color || 'bg-primary-500']);

    res.status(201).json({ id, username, name, role, avatar, color });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', authenticateToken, async (req, res) => {
  const targetId = req.params.id;
  try {
    const targetUser = await db.get('SELECT * FROM users WHERE id = ?', [targetId]);
    if (!targetUser) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });

    // Developer herkesi silebilir, Admin ise developer ve admin dışındakileri silebilir.
    if (req.user.role === 'admin' && (targetUser.role === 'admin' || targetUser.role === 'developer')) {
      return res.status(403).json({ error: 'Yöneticiler, diğer yöneticileri veya geliştiriciyi silemez.' });
    }
    if (req.user.role !== 'developer' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Kullanıcı silme yetkiniz yok.' });
    }

    await db.run('DELETE FROM users WHERE id = ?', [targetId]);
    res.json({ message: 'Kullanıcı silindi.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Dosyaları / Davaları Getirme
app.get('/api/cases', authenticateToken, async (req, res) => {
  try {
    const cases = await db.all('SELECT * FROM cases');
    const result = [];

    for (const c of cases) {
      const subTasks = await db.all('SELECT * FROM sub_tasks WHERE caseId = ?', [c.id]);
      const attachments = await db.all('SELECT * FROM attachments WHERE caseId = ?', [c.id]);

      result.push({
        ...c,
        assignedTo: c.assignedTo ? JSON.parse(c.assignedTo) : [],
        subTasks: subTasks.map(s => ({ ...s, completed: Boolean(s.completed) })),
        attachments
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Dosya / Fotoğraf Yükleme (Mobile Camera Entegrasyonu)
app.post('/api/cases/:caseId/attachments', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { caseId } = req.params;
    if (!req.file) return res.status(400).json({ error: 'Dosya seçilmedi.' });

    const attachment = {
      id: 'a_' + Date.now(),
      caseId,
      fileName: req.file.originalname,
      filePath: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedBy: req.user.id,
      uploadedAt: new Date().toISOString()
    };

    await db.run(`
      INSERT INTO attachments (id, caseId, fileName, filePath, fileType, fileSize, uploadedBy, uploadedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [attachment.id, attachment.caseId, attachment.fileName, attachment.filePath, attachment.fileType, attachment.fileSize, attachment.uploadedBy, attachment.uploadedAt]);

    res.status(201).json(attachment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sunucuyu Başlat
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n===================================================`);
  console.log(`Backend Çalışıyor: http://localhost:${PORT}`);
  console.log(`Yerel Ağ & Mobil Bağlantı IP: http://0.0.0.0:${PORT}`);
  console.log(`===================================================\n`);
});