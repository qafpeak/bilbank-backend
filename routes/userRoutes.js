const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

// POST /users - kullanıcı kaydı
router.post('/', async (req, res) => {
  const { email, password } = req.body;

  try {
    // E-posta zaten kayıtlı mı?
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Bu e-posta zaten kayıtlı.' });
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({ message: 'Kayıt başarılı', userId: newUser._id });
  } catch (err) {
    console.error('Kayıt hatası:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;

// PUT /users/:id - kullanıcıyı güncelle (ad/soyad)
router.put('/:id', async (req, res) => {
  const { name, surname, username } = req.body;

  const updateFields = {};
  if (name) updateFields.name = name;
  if (surname) updateFields.surname = surname;
  if (username) updateFields.username = username;

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    res.status(200).json({ message: 'Kullanıcı bilgileri güncellendi', user });
  } catch (err) {
    console.error('Güncelleme hatası:', err);

    if (err.code === 11000 && err.keyPattern.username) {
      return res.status(409).json({ error: 'Username zaten kullanılıyor.' });
    }

    res.status(500).json({ error: 'Sunucu hatası' });
  }
});


// GET /users/check-username?username=xxx - username kontrol
router.get('/check-username', async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Username gerekli.' });
  }

  try {
    const user = await User.findOne({ username });
    res.status(200).json({ exists: !!user });
  } catch (err) {
    console.error('Username kontrol hatası:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});


//Authentication - Kimlik Doğrulama
router.post('/login', async (req, res) => {
  const { emailOrUsername, password } = req.body;

  try {
    // E-posta ya da kullanıcı adına göre kullanıcıyı bul
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
    });

    if (!user) {
      return res.status(401).json({ error: 'Geçersiz bilgiler' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Şifre yanlış' });
    }

    // Giriş başarılı
    res.status(200).json({
      message: 'Giriş başarılı',
      userId: user._id,
      username: user.username,
      name: user.name,
    });
  } catch (err) {
    console.error('Giriş hatası:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});