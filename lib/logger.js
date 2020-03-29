const pinoLogger = require("pino");
const pinoStackdriver = require("@icco/pino-stackdriver-serializers");

module.exports = {
  logger: pinoLogger({
    messageKey: "message",
    level: "info",
    formatters: pinoStackdriver.sdFormatter,
  }),
};
