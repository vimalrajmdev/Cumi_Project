// JWT helpers + Express middleware for the web API.
// The secret lives in .env (JWT_SECRET); tokens carry only the identity
// fields routes and the dashboard WebSocket need — never the password hash.
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set — add it to Backend/.env');
}

function signToken(user) {
  return jwt.sign(
    {
      usercode: user.usercode,
      employeename: user.employeename,
      userrole: user.userrole,
      UserStatus: user.UserStatus,
      departmentname: user.departmentname,
      branchid: user.branchid,
      BranchAccess: user.BranchAccess,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

// Sliding refresh: once a verified token is past half its lifetime, issue a
// fresh one. Active clients therefore stay logged in indefinitely; only a
// client idle past the full JWT_EXPIRES_IN has to log in again. Returns the
// new token, or null while the current one is still young.
function maybeRefreshToken(payload) {
  const now = Math.floor(Date.now() / 1000);
  if (payload.iat && payload.exp && now > (payload.iat + payload.exp) / 2) {
    return signToken(payload); // signToken copies only the identity fields
  }
  return null;
}

// Paths reachable WITHOUT a token:
// - pre-login flows: login, forgot password, first-login and expired-password
//   resets (these verify the old/temp password themselves)
// - /get-lan-ip: App.js calls it before login
// - /loginhistory: logout logging must still work when the token has expired
// - RFID geofence hardware endpoints: the devices cannot attach a JWT
// - GET download/static routes: opened via <a>/<img>, which send no headers
const PUBLIC_PATHS = new Set([
  '/',
  '/login',
  '/forgotpassword',
  '/changepassword',
  '/ExpirePasswordRest',
  '/get-lan-ip',
  '/loginhistory',
  '/RFIDJiofriends',
  '/GETRFIDJiofriends',
  '/unuploaded_data.xlsx',
]);
const PUBLIC_PREFIXES = ['/uploads/', '/download/', '/api-docs'];

function authRequired(req, res, next) {
  if (PUBLIC_PATHS.has(req.path) || PUBLIC_PREFIXES.some((p) => req.path.startsWith(p))) {
    return next();
  }

  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    req.user = verifyToken(token);
    const refreshed = maybeRefreshToken(req.user);
    if (refreshed) {
      // picked up by the frontend axios interceptor (authSetup.js);
      // CORS must expose this header or browsers cannot read it
      res.setHeader('X-Refreshed-Token', refreshed);
    }
    return next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Session expired' : 'Invalid token';
    return res.status(401).json({ error: message });
  }
}

module.exports = { signToken, verifyToken, maybeRefreshToken, authRequired };
