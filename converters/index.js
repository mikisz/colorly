/**
 * Main entry point for converter modules
 * Import and register all converters here
 */
const registry = require('./ConverterRegistry');
const EpsToSvgConverter = require('./EpsToSvgConverter');

// Register all converters
registry.register(new EpsToSvgConverter());

// TODO: Add more converters here as needed
// Example:
// const PdfToSvgConverter = require('./PdfToSvgConverter');
// registry.register(new PdfToSvgConverter());

module.exports = registry;
