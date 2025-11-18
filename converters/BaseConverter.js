/**
 * Base class for all file converters
 * Implement this interface to add new conversion formats
 */
class BaseConverter {
  /**
   * @param {string} fromFormat - Source format (e.g., 'eps')
   * @param {string} toFormat - Target format (e.g., 'svg')
   */
  constructor(fromFormat, toFormat) {
    if (this.constructor === BaseConverter) {
      throw new Error("BaseConverter is abstract and cannot be instantiated directly");
    }
    this.fromFormat = fromFormat.toLowerCase();
    this.toFormat = toFormat.toLowerCase();
  }

  /**
   * Check if this converter supports the given conversion
   * @param {string} from - Source format
   * @param {string} to - Target format
   * @returns {boolean}
   */
  supports(from, to) {
    return this.fromFormat === from.toLowerCase() && this.toFormat === to.toLowerCase();
  }

  /**
   * Convert file from one format to another
   * Must be implemented by subclasses
   * @param {Buffer} inputBuffer - Input file buffer
   * @param {Object} options - Conversion options
   * @returns {Promise<Buffer>} - Converted file buffer
   */
  async convert(inputBuffer, options = {}) {
    throw new Error("convert() must be implemented by subclass");
  }

  /**
   * Get converter metadata
   * @returns {Object}
   */
  getInfo() {
    return {
      from: this.fromFormat,
      to: this.toFormat,
      name: this.constructor.name
    };
  }
}

module.exports = BaseConverter;
