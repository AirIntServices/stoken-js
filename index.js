const securid = require("./lib/securid");

const api = { initialized : false};

const wrapFunction = () => {
  api.stoken_compute_code = securid.cwrap("stoken_compute_code", "string", [
    "string",
    "string"
  ]);
  api.initialized = true;
}

securid["onRuntimeInitialized"] = wrapFunction;

const generateCode = (token, pin) => {
  const code = api.stoken_compute_code(token, pin);

      switch (code) {
        case "ERR_TOKEN_GARBLED":
          throw new Error("Token string provided is garbled");
        case "ERR_TOKEN_FAILED_SIZEOF":
          throw new Error("Failed to allocate memory for token.");
        case "ERR_TOKEN_DECRYPT_FAILED":
          throw new Error("error while decrypting token.");

        default:
          return code;
      }
}

exports.computeCode = (token, pin) => {

  if(api.initialized) {
    return Promise.resolve(generateCode(token, pin));
  }

  return new Promise((resolve, reject) => {
    securid["onRuntimeInitialized"] = _ => {
      wrapFunction();
      try {
        const code = generateCode(token, pin);
        resolve(code);
      } catch(err) {
        reject(err);
      }
    }
  });

};
