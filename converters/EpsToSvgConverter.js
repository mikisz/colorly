const BaseConverter = require('./BaseConverter');
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

const execAsync = promisify(exec);

/**
 * Converter for EPS to SVG format
 * Uses Inkscape command-line tool for conversion
 */
class EpsToSvgConverter extends BaseConverter {
  constructor() {
    super('eps', 'svg');
  }

  /**
   * Check if Inkscape is available on the system
   * @returns {Promise<boolean>}
   */
  async isInkscapeAvailable() {
    try {
      await execAsync('inkscape --version');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Convert EPS buffer to SVG using Inkscape
   * @param {Buffer} inputBuffer - EPS file buffer
   * @param {Object} options - Conversion options
   * @returns {Promise<Buffer>} - SVG file buffer
   */
  async convert(inputBuffer, options = {}) {
    const inkscapeAvailable = await this.isInkscapeAvailable();

    if (!inkscapeAvailable) {
      throw new Error(
        'Inkscape is required for EPS to SVG conversion. ' +
        'Please install Inkscape: https://inkscape.org/release/'
      );
    }

    // Create temporary files
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'eps-converter-'));
    const inputPath = path.join(tempDir, 'input.eps');
    const outputPath = path.join(tempDir, 'output.svg');

    try {
      // Write input buffer to temporary file
      await fs.writeFile(inputPath, inputBuffer);

      // Execute Inkscape conversion
      // Inkscape 1.0+ uses different command syntax
      const command = `inkscape "${inputPath}" --export-filename="${outputPath}" --export-type=svg`;

      await execAsync(command, { maxBuffer: 10 * 1024 * 1024 }); // 10MB buffer

      // Read converted file
      const svgBuffer = await fs.readFile(outputPath);

      return svgBuffer;
    } catch (error) {
      throw new Error(`EPS to SVG conversion failed: ${error.message}`);
    } finally {
      // Clean up temporary files
      try {
        await fs.unlink(inputPath).catch(() => {});
        await fs.unlink(outputPath).catch(() => {});
        await fs.rmdir(tempDir).catch(() => {});
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }
  }

  /**
   * Get converter information
   * @returns {Object}
   */
  getInfo() {
    return {
      ...super.getInfo(),
      description: 'Converts EPS (Encapsulated PostScript) files to SVG format',
      requirements: ['Inkscape (https://inkscape.org/)'],
      options: {}
    };
  }
}

module.exports = EpsToSvgConverter;
