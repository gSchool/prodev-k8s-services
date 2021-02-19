import jwt from 'jsonwebtoken';
import util from 'util';

/** CREATE */

const sign = util.promisify(jwt.sign);
const makeVersions = new Map();

const unknownMakeVersion = _ => __ => {
  return Promise.reject({ message: "Unknown version of the API" });
};

makeVersions.set(1.0, secret => async ({ claims, options = {} }) => {
  const opts = {
    algorithm: 'HS256',
  };
  if (options.expiresIn) opts.expiresIn = options.expiresIn;
  if (options.id) opts.jwtid = options.id;
  if (options.notBefore) opts.notBefore = options.notBefore;
  return await sign(claims, secret, opts);
});


export const makeFactory = secret => version => {
  const creator = makeVersions.get(version) || unknownMakeVersion;
  return creator(secret);
};


/** VERIFY */

const verify = util.promisify(jwt.verify);
const verifyVersions = new Map();

const unknownVerifyVersion = version => __ => {
  return Promise.reject({ message: `Unknown version of the API: "${version}"` });
};

verifyVersions.set(1.0, secret => async token => {
  try {
    return await verify(token, secret, { algorithm: 'HS256' });
  } catch (e) {
    throw { code: 404, message: 'Invalid token', error: e };
  }
});


export const verifyFactory = secret => version => {
  const verifier = verifyVersions.get(version) || unknownVerifyVersion;
  return verifier(secret);
}
