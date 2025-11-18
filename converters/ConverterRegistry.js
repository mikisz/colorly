/**
 * Registry for managing all available file converters
 * Follows the Strategy pattern for extensibility
 */
class ConverterRegistry {
  constructor() {
    this.converters = [];
  }

  /**
   * Register a new converter
   * @param {BaseConverter} converter - Converter instance
   */
  register(converter) {
    this.converters.push(converter);
    console.log(`Registered converter: ${converter.fromFormat} -> ${converter.toFormat}`);
  }

  /**
   * Find appropriate converter for the given formats
   * @param {string} from - Source format
   * @param {string} to - Target format
   * @returns {BaseConverter|null}
   */
  findConverter(from, to) {
    return this.converters.find(converter => converter.supports(from, to)) || null;
  }

  /**
   * Get all available conversions
   * @returns {Array<Object>}
   */
  getAvailableConversions() {
    return this.converters.map(converter => converter.getInfo());
  }

  /**
   * Check if a conversion is supported
   * @param {string} from - Source format
   * @param {string} to - Target format
   * @returns {boolean}
   */
  isSupported(from, to) {
    return this.findConverter(from, to) !== null;
  }
}

module.exports = new ConverterRegistry();
