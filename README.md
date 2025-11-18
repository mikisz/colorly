# Colorly File Converter

An extensible file converter with a clean web interface. Currently supports EPS to SVG conversion, with an architecture designed to easily add more format conversions in the future.

## Features

- **Extensible Architecture**: Easily add new file format converters
- **Modern Web Interface**: Clean, responsive UI with drag-and-drop support
- **RESTful API**: Simple API for programmatic conversions
- **Current Conversions**:
  - EPS → SVG (Encapsulated PostScript to Scalable Vector Graphics)

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- **Inkscape** (required for EPS to SVG conversion)

### Installing Inkscape

**macOS:**
```bash
brew install inkscape
```

**Ubuntu/Debian:**
```bash
sudo apt-get install inkscape
```

**Windows:**
Download from [https://inkscape.org/release/](https://inkscape.org/release/)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd colorly
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Start the Server

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Using the Web Interface

1. Open your browser to `http://localhost:3000`
2. Select the source and target formats (currently EPS → SVG)
3. Drag and drop your file or click "Browse Files" to select a file
4. Click "Convert File"
5. Download the converted file when ready

### Using the API

**Get Available Conversions:**
```bash
curl http://localhost:3000/api/conversions
```

**Convert a File:**
```bash
curl -X POST \
  -F "file=@input.eps" \
  -F "from=eps" \
  -F "to=svg" \
  http://localhost:3000/api/convert \
  --output converted.svg
```

## Project Structure

```
colorly/
├── converters/                 # Converter modules
│   ├── BaseConverter.js        # Abstract base class for all converters
│   ├── ConverterRegistry.js    # Registry for managing converters
│   ├── EpsToSvgConverter.js    # EPS to SVG implementation
│   └── index.js                # Exports and registers all converters
├── server.js                   # Express server
├── index.html                  # Frontend UI
├── app.js                      # Client-side JavaScript
├── style.css                   # Styles
├── package.json                # Dependencies and scripts
└── README.md                   # This file
```

## Adding New Converters

The architecture makes it easy to add new file format conversions. Here's how:

### Step 1: Create a New Converter Class

Create a new file in the `converters/` directory (e.g., `PdfToSvgConverter.js`):

```javascript
const BaseConverter = require('./BaseConverter');
const { exec } = require('child_process');
const { promisify } = require('util');

class PdfToSvgConverter extends BaseConverter {
  constructor() {
    super('pdf', 'svg');  // from format, to format
  }

  /**
   * Convert PDF buffer to SVG
   * @param {Buffer} inputBuffer - PDF file buffer
   * @param {Object} options - Conversion options
   * @returns {Promise<Buffer>} - SVG file buffer
   */
  async convert(inputBuffer, options = {}) {
    // Implement your conversion logic here
    // 1. Write inputBuffer to temp file
    // 2. Execute conversion tool
    // 3. Read and return output buffer
    // 4. Clean up temp files
  }

  getInfo() {
    return {
      ...super.getInfo(),
      description: 'Converts PDF files to SVG format',
      requirements: ['pdf2svg or similar tool'],
      options: {}
    };
  }
}

module.exports = PdfToSvgConverter;
```

### Step 2: Register the New Converter

Edit `converters/index.js` to register your new converter:

```javascript
const registry = require('./ConverterRegistry');
const EpsToSvgConverter = require('./EpsToSvgConverter');
const PdfToSvgConverter = require('./PdfToSvgConverter');  // Add this

// Register all converters
registry.register(new EpsToSvgConverter());
registry.register(new PdfToSvgConverter());  // Add this

module.exports = registry;
```

### Step 3: Update the Frontend (Optional)

If you want to add the new format to the dropdown menus, edit `index.html`:

```html
<select id="fromFormat" class="format-select">
    <option value="eps">EPS</option>
    <option value="pdf">PDF</option>  <!-- Add new formats -->
</select>
```

That's it! The server will automatically:
- Make the new conversion available via the API
- Display it in the "Available Conversions" section
- Enable conversion through the web interface

## Architecture

The converter follows the **Strategy Pattern** for maximum extensibility:

- **BaseConverter**: Abstract base class defining the converter interface
- **ConverterRegistry**: Manages all registered converters and finds the right one for each conversion
- **Specific Converters**: Implement the actual conversion logic for each format pair

This design allows you to:
- Add new converters without modifying existing code
- Support multiple conversion paths (A→B, B→C, A→C)
- Easily test converters in isolation
- Swap converter implementations without changing the API

## API Reference

### GET /api/conversions

Returns list of available conversions.

**Response:**
```json
{
  "success": true,
  "conversions": [
    {
      "from": "eps",
      "to": "svg",
      "name": "EpsToSvgConverter",
      "description": "Converts EPS files to SVG format"
    }
  ]
}
```

### POST /api/convert

Convert a file from one format to another.

**Parameters:**
- `file` (multipart/form-data): The file to convert
- `from` (string): Source format (e.g., "eps")
- `to` (string): Target format (e.g., "svg")

**Response:**
- Success: Returns the converted file as a binary download
- Error: Returns JSON with error details

## Configuration

You can configure the server port using an environment variable:

```bash
PORT=8080 npm start
```

## Troubleshooting

### "Inkscape is required" Error

Make sure Inkscape is installed and available in your PATH:

```bash
inkscape --version
```

If not found, install Inkscape (see Prerequisites section).

### File Size Limits

The default maximum file size is 50MB. To change this, edit `server.js`:

```javascript
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // Change to 100MB
  }
});
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Ideas for New Converters

- PDF → SVG
- PNG/JPG → SVG (image tracing)
- SVG → PNG/JPG (rasterization)
- DXF → SVG
- AI → SVG
- And many more!
