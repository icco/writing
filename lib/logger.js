const pinoLogger = require("pino");
const pinoStackdriver = require("pino-stackdriver-serializers");

export default pinoLogger({
  messageKey: "message",
  level: "info",
  base: null,
  prettyPrint: {
    doSomething: true,
  },
  prettifier: pinoStackdriver.sdPrettifier,
});
