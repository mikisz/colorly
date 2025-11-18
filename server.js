const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const converterRegistry = require('./converters');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads (store in memory)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max file size
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

/**
 * GET /api/conversions
 * Get list of available conversions
 */
app.get('/api/conversions', (req, res) => {
  const conversions = converterRegistry.getAvailableConversions();
  res.json({
    success: true,
    conversions: conversions
  });
});

/**
 * POST /api/convert
 * Convert a file from one format to another
 *
 * Request body:
 * - file: File to convert (multipart/form-data)
 * - from: Source format (e.g., 'eps')
 * - to: Target format (e.g., 'svg')
 */
app.post('/api/convert', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const { from, to } = req.body;

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: from and to formats'
      });
    }

    // Find appropriate converter
    const converter = converterRegistry.findConverter(from, to);

    if (!converter) {
      return res.status(400).json({
        success: false,
        error: `No converter available for ${from} to ${to}`,
        availableConversions: converterRegistry.getAvailableConversions()
      });
    }

    console.log(`Converting ${req.file.originalname} from ${from} to ${to}...`);

    // Perform conversion
    const outputBuffer = await converter.convert(req.file.buffer);

    // Generate output filename
    const originalName = path.parse(req.file.originalname).name;
    const outputFilename = `${originalName}.${to}`;

    // Send converted file
    res.set({
      'Content-Type': `application/${to}`,
      'Content-Disposition': `attachment; filename="${outputFilename}"`,
      'Content-Length': outputBuffer.length
    });

    res.send(outputBuffer);

    console.log(`✓ Conversion successful: ${outputFilename}`);

  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /
 * Serve the main HTML page
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 File Converter Server running on http://localhost:${PORT}`);
  console.log(`\nAvailable conversions:`);
  converterRegistry.getAvailableConversions().forEach(conv => {
    console.log(`  • ${conv.from.toUpperCase()} → ${conv.to.toUpperCase()}`);
  });
  console.log('\n');
});

module.exports = app;
