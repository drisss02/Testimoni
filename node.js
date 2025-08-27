const express = require('express');
const fs = require('fs');
const XLSX = require('xlsx');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const DATA_FILE = './data.json';

app.use(cors());
app.use(bodyParser.json());

// Load data from file
function loadData() {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

// Save data to file
function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Get all anggota
app.get('/api/anggota', (req, res) => {
    res.json(loadData());
});

// Add anggota
app.post('/api/anggota', (req, res) => {
    const data = loadData();
    data.push(req.body);
    saveData(data);
    res.json({ success: true });
});

// Delete all anggota
app.delete('/api/anggota', (req, res) => {
    saveData([]);
    res.json({ success: true });
});

// Download XLSX file
app.get('/api/download', (req, res) => {
    const data = loadData();
    const worksheetData = [
        ['Nama', 'Kelas', 'Jabatan', 'Jenis Kelamin'],
        ...data.map(item => [item.nama, item.kelas, item.jabatan, item.jenis_kelamin])
    ];
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Anggota Rohis");
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="data_anggota.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
