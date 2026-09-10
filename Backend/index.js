const express = require("express");
const cors = require("cors");

const compression = require("compression");

const server = express();

const http = require('http');

// The Express app is wrapped in an http.Server so the dashboard WebSocket
// (see the Dashboard section) can share port 3601 with the REST API.
const httpServer = http.createServer(server);

const { WebSocketServer } = require('ws');

const multer = require('multer');

const xlsx = require('xlsx');

const fs = require('fs');

const util = require('util');

const os = require('os');

const { exec } = require('child_process');

const axios = require('axios');

const FormData = require('form-data');

const path = require('path');

const upload = multer({ storage: multer.memoryStorage() });

const PORT = process.env.PORT || 3601;

const nodemailer = require("nodemailer");

const dotenv = require('dotenv')

const bcrypt = require('bcryptjs');

dotenv.config()

// exposedHeaders lets the browser read the sliding-refresh token header
server.use(cors({ exposedHeaders: ['X-Refreshed-Token'] }));

// gzip every response above ~1KB — large JSON payloads (e.g. the 5MB
// registered-assets list) shrink ~97%. Browsers/axios decompress
// transparently, so no client change is needed.
server.use(compression());

server.use(express.json({ limit: '100mb' }));
server.use(express.urlencoded({ limit: '100mb', extended: true }));

// JWT auth: every route below requires a valid Bearer token except the
// public allowlist in auth.js (pre-login flows, RFID hardware endpoints,
// GET download/static routes). Must be required after dotenv.config().
const { signToken, verifyToken, maybeRefreshToken, authRequired } = require('./auth');
server.use(authRequired);

// Swagger UI — auto-generated API docs at /api-docs.
// The spec is scanned from this file's routes; after adding or changing
// routes, refresh it with:  node swagger.js
const swaggerUi = require('swagger-ui-express');
try {
  const swaggerDoc = require('./swagger-output.json');
  server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
} catch (err) {
  console.warn('swagger-output.json missing — run "node swagger.js" to enable /api-docs');
}
// Image Upload Start
const { API_URL } = require("./api");

const IMAGES_ROOT = path.join(__dirname, 'uploads'); // Define the root for images

server.use('/uploads', express.static(IMAGES_ROOT));

server.post('/api/upload', (req, res) => {
  upload1(req, res, function (err) {
    if (err) {
      return res.status(400).json({ success: false, message: 'File upload error', error: err.message });
    }
    // Return the relative file path
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      file: { path: `uploads/${req.file.filename}` } // Send the relative file path
    });
  });
});

server.get('/get-lan-ip', (req, res) => {
  const interfaces = os.networkInterfaces()
  let lanIp = null

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip over internal (i.e. 127.0.0.1) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        lanIp = iface.address
        break
      }
    }
    if (lanIp) break
  }

  res.json({ ip: lanIp || 'Not found' })
})
const uploadFolder = path.join(path.join(__dirname, 'uploads'));

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Specify the 'uploads' folder as the destination
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + Date.now() + path.extname(file.originalname)); // e.g., image1736633398309.jpg
  }
});

const upload1 = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB size limit
}).single('image');


const uploadPath = path.join(__dirname, "uploads/assetAttachments");

// Create folder if not exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage1 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;

    cb(null, filename);
  }
});

const uploadFile = multer({ storage: storage1 }); // ✅ FIXED

// Image Upload END
const readFile = util.promisify(fs.readFile);

const writeFile = util.promisify(fs.writeFile);

const printerSharePath = process.env.PRINTER_SHARE_PATH;

const printerDeviceName = process.env.PRINTER_DEVICE_NAME;

// console.log(printerSharePath, " ", printerDeviceName);

const db = require('./db');
const { sql, connect } = require('./db');


db.connect().then(() => {
  console.log('Connected to the database');
}).catch(err => {
  console.error('Database connection failed:', err);

  logErrorToFile('Database connection failed:', err)
});



server.get('/', async (req, res) => {
  try {
    res.json('🍎 Apple Asset Tracking API On Live 🍎')
  } catch (err) {
    console.log(err);
    res.status(500).json('Internal Server Error ')
  }
});
server.get('/download/:filename', (req, res) => {
  // path.basename strips any ../ segments so only files that live directly
  // in the backend folder (the generated unuploaded_*.xlsx reports) can be
  // downloaded — never arbitrary files elsewhere on the server.
  const safeName = path.basename(req.params.filename);
  if (!/^[\w.-]+\.xlsx$/i.test(safeName)) {
    return res.status(400).json({ message: 'Invalid file name' });
  }
  const filePath = path.join(__dirname, safeName);
  res.download(filePath, (err) => {
    if (err) {
      console.log('Error downloading file:', err);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error downloading file' });
      }
    } else {
      fs.unlink(filePath, () => { }); // Clean up the file after download
    }

  });
});

/// LOGIN
{


  server.post('/login', async (req, res) => {
    /* #swagger.tags = ['Auth']
       #swagger.summary = 'User login'
       #swagger.description = 'Validates the employee code + password and returns the JWT (token), the user profile (send) and the per-screen permissions (pagedata). Use the token for every other endpoint: Authorize with "Bearer <token>". Wrong password increments the login-attempt counter; the account locks after the configured attempt count.'
       #swagger.security = []
       #swagger.parameters['body'] = {
           in: 'body',
           description: 'Login credentials. ipAddress is recorded in the login history.',
           schema: { username: 'EMP001', password: 'MyPassword@123', ipAddress: '192.168.1.10' }
       }
       #swagger.responses[200] = { description: 'Login success — token, user profile, page permissions' }
       #swagger.responses[400] = { description: 'Invalid credentials or account locked' }
       #swagger.responses[404] = { description: 'User not found' } */
    try {
      const { username, password, ipAddress } = req.body;

      const query = db.q`exec dbo.userlogin ${username}`;

      const response = await db.query(query);

      const user = response.recordset[0];


      const Pagedata = response.recordsets[1]

      if (user.Result === 404) {
        console.log('User not found');
        return res.status(404).json({ error: 'User not found' });
      }

      let loginattemptCount = user.loginattempt

      const isMatch = await bcrypt.compare(password, user.password); // this user password db password check true or false
      const attemptCount = db.q`EXEC SP_GeneralSetting '','','','','','',${user.branchid},'attemptCount',''`
      const attemptCountResponse = await db.query(attemptCount)
      const LoginAttempCount = attemptCountResponse.recordset[0].LoginAttempCount

      if (user.UserStatus.toLowerCase() !== 'sa' && loginattemptCount >= LoginAttempCount) {

        res.status(400).json({ error: 'Your Password is locked, Please wait for Administrative Approval' });

        const status = 'pl'

        await sendPasswordEmail(username, user.email, user.employeename, password, status, user.branchid);

        return

      } else {

        if (!isMatch) {   /// password match check

          loginattemptCount++

          if (user.UserStatus.toLowerCase() !== 'sa') {

            const query = db.q`update UserMainMaster set loginattempt = ${loginattemptCount} where employeecode = ${username}`
            const response = await db.query(query)

          }

          return res.status(400).json({ error: `Invalid credentials Attempt ${loginattemptCount}` });

        } else {

          const query = db.q`sp_loginhistory ${username},${user.employeename},'login',${ipAddress},${'I'},${user.branchid}`

          const response = await db.query(query)

          if (response.rowsAffected) {
            // never send the password (hash or plaintext) back to the client
            const { password: _passwordHash, ...safeUser } = user;
            const send = { ...safeUser, usercode: username }

            const formattedData = Pagedata.reduce((acc, item) => {
              acc[item.Screenid] = {
                Screenid: item.status,
                EditStatus: item.EditStatus,
                ViewStatus: item.ViewStatus,
                ApprovalStatus: item.ApprovalStatus,
                AddStatus: item.AddStatus,
                DeleteStatus: item.DeleteStatus
              };
              return acc;
            }, {});
            // console.log('formattedData', formattedData)
            const token = signToken(send);
            res.status(200).json({ token, send, pagedata: formattedData || null, message: "Login Successfully", navigation: Pagedata || null });

          }

        }
      }

    } catch (err) {

      console.error(err);
      logErrorToFile(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })


  server.post('/loginhistory', async (req, res) => {
    try {
      const { usercode,
        username,
        status,
        ipAddress,
        mood,
        branchid } = req.body

      const query = db.q`EXEC sp_loginhistory ${usercode},${username},${status},${ipAddress},${mood},${branchid}`

      const response = await db.query(query)

      res.status(200).send(response.recordset)

    } catch (error) {
      console.error(error);
      logErrorToFile(error)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })


  server.post('/changepassword', async (req, res) => {
    /* #swagger.tags = ['Auth']
       #swagger.summary = 'Change password (first login / voluntary change)'
       #swagger.description = 'Verifies the old password and stores the new one (bcrypt-hashed). Used by the first-time-login screen. Public: it authenticates via the old password itself.'
       #swagger.security = []
       #swagger.parameters['body'] = {
           in: 'body',
           schema: { usercode: 'EMP001', oldpassword: 'OldPass@123', newpassword: 'NewPass@123', confirmpassword: 'NewPass@123' }
       } */
    try {
      const { usercode, oldpassword, newpassword, confirmpassword } = req.body


      const query = db.q`SELECT ISNULL((SELECT password FROM UserMainMaster WITH (NOLOCK) WHERE employeecode = ${usercode}), CAST(0 AS int)) AS password`


      const response = await db.query(query)

      const data = response.recordset[0]


      if (data.password === '0') {
        console.log('User code not found');
        return res.status(404).json({ error: 'User code not found' });

      }

      const isMatch = await bcrypt.compare(oldpassword, data.password);

      if (!isMatch) {
        return res.status(400).json({ error: 'Old Password Not Match' });
      }

      if (isMatch) {

        const hashedPassword = await bcrypt.hash(confirmpassword, 10)  /// encrypt password

        const query = db.q`update UserMainMaster set temppassword = ${hashedPassword},password = ${hashedPassword},firstlogin = ${0},expireddate = getdate() where employeecode = ${usercode}`

        const response = await db.query(query)

        if (response.rowsAffected) {

          res.json({ message: 'Password Changed Successfully' })
        }

      }

    } catch (err) {

      console.error(err);
      logErrorToFile(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }

  })


  server.post('/ResetPassword', async (req, res) => {
    try {

      const { id, employeecode, employeename, email, branchid } = req.body;

      const DefaultPassword = db.q`Exec SP_GeneralSetting '','','','','','',${branchid},'getPw',''`
      const passwordResponse = await db.query(DefaultPassword)
      const DefaultPass = passwordResponse.recordset[0].DefaultPassword;
      // console.log('DefaultPass', DefaultPass);

      const temppassword = DefaultPass;


      const hashedPassword = await bcrypt.hash(temppassword, 10)  /// encrypt password

      const query = db.q`update UserMainMaster set temppassword = ${hashedPassword},password = ${hashedPassword},firstlogin = ${1},expireddate = getdate() where empid =${id}`

      const response = await db.query(query)

      if (response.rowsAffected) {

        res.status(200).send()

        const status = 're'

        await sendPasswordEmail(employeecode, email, employeename, temppassword, status, branchid);
      }


    } catch (error) {

      console.error(error);
      logErrorToFile(error)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })


  server.post('/forgotpassword', async (req, res) => {
    /* #swagger.tags = ['Auth']
       #swagger.summary = 'Forgot password — reset to default and mail it'
       #swagger.description = 'Verifies employee code + date of joining + email; on match, resets the password to the branch default and emails it to the user. Public (pre-login).'
       #swagger.security = []
       #swagger.parameters['body'] = {
           in: 'body',
           schema: { usercode: 'EMP001', dateofjoin: '2024-01-15', email: 'user@company.com' }
       } */
    try {

      const { usercode, dateofjoin, email } = req.body

      const query = db.q`select COUNT(*)as count from UserMainMaster where employeecode= ${usercode} and DateofJoining = cast(${dateofjoin} as date) and 
    email = ${email}`

      const response = await db.query(query)

      // console.log(response.recordset);

      if (response.recordset[0].count === 0) {

        res.status(400).json({ error: 'Please Check The Data' })
      } else {

        const Branchid = await db.query(db.q`SELECT branchid,employeename FROM UserMainMaster WHERE employeecode = ${usercode}
                      AND DateofJoining = CAST(${dateofjoin} AS DATE)  AND email = ${email}`)

        const branchid = Branchid.recordset[0].branchid


        const DefaultPassword = db.q`Exec SP_GeneralSetting '','','','','','',${branchid},'getPw',''`
        const passwordResponse = await db.query(DefaultPassword)
        const DefaultPass = passwordResponse.recordset[0].DefaultPassword;
        // console.log('DefaultPass', DefaultPass);

        const temppassword = DefaultPass;


        const hashedPassword = await bcrypt.hash(temppassword, 10)  /// encrypt password

        const query = db.q`update UserMainMaster set temppassword = ${hashedPassword},password = ${hashedPassword},firstlogin = ${1} where employeecode =${usercode}`

        const response = await db.query(query)

        if (response.rowsAffected) {

          const status = 're'

          const employeename = Branchid.recordset[0].employeename

          await sendPasswordEmail(usercode, email, employeename, temppassword, status, branchid);

          res.status(200).json({ message: 'Password Forgot Success' })
        }


      }

    } catch (error) {

      console.error(error);
      logErrorToFile(error)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })


  server.post('/ExpirePasswordRest', async (req, res) => {
    try {

      const { usercode, oldpassword, newpassword, confirmpassword } = req.body


      const query = db.q`SELECT ISNULL((SELECT password FROM UserMainMaster WITH (NOLOCK) WHERE employeecode = ${usercode}), CAST(0 AS int)) AS password;`

      const response = await db.query(query)

      const data = response.recordset[0]


      if (data.password === '0') {
        console.log('User code not found');
        return res.status(404).json({ error: 'User code not found' });
      }

      const isMatch = await bcrypt.compare(oldpassword, data.password);

      if (!isMatch) {
        return res.status(400).json({ error: 'Old Password Not Match' });
      }

      if (isMatch) {

        const hashedPassword = await bcrypt.hash(confirmpassword, 10)  /// encrypt password

        const query = db.q`update UserMainMaster set temppassword = ${hashedPassword},password = ${hashedPassword},firstlogin = ${0},expireddate = getdate() where employeecode = ${usercode}`

        const response = await db.query(query)

        if (response.rowsAffected) {

          res.json({ message: 'Password Reseted Successfully' })
        }

      }


    } catch (error) {

      console.error(error);
      logErrorToFile(error)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })

  /// user Role Master start

  server.post('/UserroleMaster', async (req, res) => {
    try {

      const { id, userrole, createdby, updateby, branchid, mode } = req.body

      const query = db.q`exec sp_Userrolemaster ${id},${userrole},${createdby},${updateby},${branchid},${mode}`

      const response = await db.query(query)

      res.status(200).send(response.recordset)

    } catch (err) {
      console.error(err);
      logErrorToFile(err)
      res.status(500).json('Internal Server Error ')
    }
  });


  /// user Role Master End


  /// user department Master start

  // [retired 26-Aug-2026] /DepartmentMaster removed — sp_Userdepartmentmaster
  // does not exist in the DB and the only caller (usercreation/config/
  // Department.js, hidden legacy screen) was deleted. Departments are managed
  // via /FetchDepartment + /AddDepartment + /UpdateDepartment.

  /// user department Master End

  server.post('/UserMainmasterRegister', async (req, res) => {
    try {

      const { id, createdby, updateby, branchid, mode, employeecode, employeename, email, dateofjoin, UserStatus, userrole, department, branchName } = req.body;

      const trimString = (value) => {
        return typeof value === 'string' ? value.trim() : value;
      };

      const trimedemployeecode = trimString(employeecode);
      const trimedemployeename = trimString(employeename);
      const trimedemail = trimString(email);


      // const generatePassword = (length) => {
      //   const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      //   let password = '';
      //   for (let i = 0; i < length; i++) {
      //     password += chars.charAt(Math.floor(Math.random() * chars.length));
      //   }
      //   return password;
      // };

      const DefaultPassword = db.q`Exec SP_GeneralSetting '','','','','','',${branchid},'getPw',''`
      const passwordResponse = await db.query(DefaultPassword)
      const DefaultPass = passwordResponse.recordset[0].DefaultPassword;
      // console.log('DefaultPass', DefaultPass);

      const temppassword = DefaultPass;

      const hashedPassword = await bcrypt.hash(temppassword, 10)  /// encrypt password


      const InsertQuery = db.q`exec sp_UserMainMaster ${id},${trimedemployeecode}, ${trimedemployeename}, ${trimedemail}, ${hashedPassword}, ${hashedPassword}, 
        ${dateofjoin}, '', ${userrole}, ${department},${createdby},${updateby},${branchid},${mode},${branchName}`;

      // console.log(InsertQuery);

      const response = await db.query(InsertQuery)

      // console.log(response.rowsAffected);

      if (response.rowsAffected) {

        // const status = 'ur'

        // await sendPasswordEmail(employeecode, trimedemail, trimedemployeename, temppassword, status, branchid);

        res.status(200).json({ message: `User registration successful. Your Temp Password is ${temppassword}` });


      }
      else {
        res.status(500).json('User registration failed.');
      }


    } catch (error) {
      res.status(500).send("An error occurred while processing your request.");
      console.error(error);
      logErrorToFile(error)
    }
  })


  server.post('/userMainMasterSelect', async (req, res) => {
    try {

      const { id, updateby, branchid, mode, BranchAccess } = req.body

      const Query = db.q`exec sp_UserMainMaster ${id},'', '', '', '', '','', '', 0,0,0,${updateby},${branchid},${mode},''`;

      const response = await db.query(Query)

      res.status(200).send(response.recordset);


    } catch (error) {
      console.error(error);
      logErrorToFile(error)
      res.status(500).send("An error occurred while processing your request.");
    }
  });


  server.post('/userMainMasterUpdate', async (req, res) => {
    try {

      const { updateddby, mode, id, employeecode, employeename, email, dateofjoin, UserStatus, userrole, department, branchName, branchid } = req.body

      const Query = db.q`exec sp_UserMainMaster ${id},${employeecode}, ${employeename}, ${email}, '', '',${dateofjoin}, ${UserStatus},${userrole},${department},0,${updateddby},${branchid},${mode},${branchName}`;

      const response = await db.query(Query)

      res.status(200).send(response.rowsAffected);


    } catch (error) {
      console.error(error);
      logErrorToFile(error)
      res.status(500).send("An error occurred while processing your request.");
    }
  });



  async function sendPasswordEmail(employeecode, email, employeename, password, status, branchid) {
    try {

      const response = await db.query(db.q`SELECT * FROM EmailSendContent where status = ${status}`)

      const maildata = await response.recordset[0]

      const Frommail = await db.query(`select * FROM EmailConfig`)

      const frommdaildata = await Frommail.recordset[0]


      let smtpTransport = nodemailer.createTransport({
        service: `${frommdaildata.ServiceName}`,
        host: `${frommdaildata.HostName}`,
        port: `${frommdaildata.PortNo}`,
        secure: false,
        auth: {
          user: `${frommdaildata.frommail}`,
          pass: `${frommdaildata.apppassword}`,
        },
      });

      const emailContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Created</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
          .title { color: #333; font-size: 20px; margin-bottom: 20px; }
          .content { font-size: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2 class="title">${maildata.bodyHead}</h2>
          <p class="content">${maildata.bodyContent1} ${employeename},</p>
          <p class="content">${maildata.bodyContent2}</p>

          <p class="content"><strong>${maildata.bodymain1} ${employeecode}</strong></p>
          <p class="content"><strong>${maildata.bodymain2} ${password}</strong></p>


          <p class="content">${maildata.bodyFooter1}</p>
          <p class="content">${maildata.bodyFooter}<br/>Granules</p>
        </div>
      </body>
      </html>
    `;


      await smtpTransport.sendMail({
        from: `${frommdaildata.frommail}`,
        to: email,
        subject: `${maildata.subject}`,
        html: emailContent,
      });

      console.log("Email sent successfully.");
    } catch (error) {
      console.error('Error sending email:', error);
      logErrorToFile('Error sending email:', error)
    }
  }


  // employeemaster entry 

  // [retired 26-Aug-2026] /employeemaster removed — "exec sp_employeemaster"
  // resolves (case-insensitively) to SP_EmployeeMaster, whose parameter list
  // changed (@Photo etc.), and the only caller (usercreation/Employee.js,
  // hidden legacy screen) was deleted. Employees are managed via
  // /EmployeeConfig (Configure > Employee Master).



  server.post('/pagemaster', async (req, res) => {
    try {
      const { pageid, pagename, createby, updateby, mood, branchid } = req.body;

      // Ensure the query is constructed properly
      const query = db.q`exec sp_PageMaster @pageid=${pageid}, @pagename=${pagename}, @createby=${createby}, @updateby=${updateby}, @mood=${mood}, @branchid=${branchid}`;
      // console.log("Page Master", query); // This logs the query being executed

      const response = await db.query(query);

      res.status(200).send(response.recordset);
    } catch (err) {
      console.error(err); // Log the error to help with debugging
      res.status(500).send('Server Error'); // Send an appropriate error message
    }
  });


  server.post('/RoleMapping', async (req, res) => {
    try {
      const { pageid, roleid, createby, mood, branchid } = req.body;

      // console.log("Request body received:", req.body);

      if (mood === 'SD') {
        // Fetch data for 'SD' mood (Screen Details)
        const sdQuery = db.q`exec sp_RoleMapping '', ${roleid}, ${createby}, ${mood}, ${branchid}`;
        const result = await db.query(sdQuery);
        // console.log("result",result);

        res.status(200).json(result.recordset); // Return the fetched data
      } else if (Array.isArray(pageid) && pageid.length > 0) {
        // Process each page in the array
        for (const data of pageid) {
          const { Screenid, EditStatus, screenAccess, DeleteStatus, AddStatus, ApprovalStatus } = data;
          // console.log("data", data);
          // Handle Edit Access
          const editQuery = db.q`exec sp_RoleMapping ${Screenid}, ${roleid}, ${createby}, ${EditStatus === 'a' ? 'E' : 'DE'}, ${branchid}`;
          await db.query(editQuery);
          // console.log("editQuery", editQuery);
          // Handle View Access
          const viewQuery = db.q`exec sp_RoleMapping ${Screenid}, ${roleid}, ${createby}, ${screenAccess === 'a' ? 'V' : 'DV'}, ${branchid}`;
          await db.query(viewQuery);
          // console.log("viewQuery", viewQuery);
          // Handle Add Access
          const AddQuery = db.q`exec sp_RoleMapping ${Screenid}, ${roleid}, ${createby}, ${AddStatus === 'a' ? 'I' : 'DI'}, ${branchid}`;
          await db.query(AddQuery);
          // console.log("AddQuery", AddQuery);
          // Handle Delete
          const DeleteQuery = db.q`exec sp_RoleMapping ${Screenid}, ${roleid}, ${createby}, ${DeleteStatus === 'a' ? 'D' : 'DD'}, ${branchid}`;
          await db.query(DeleteQuery);
          // console.log("DeleteQuery", DeleteQuery);

          const ApprovalQuery = db.q`exec sp_RoleMapping ${Screenid}, ${roleid}, ${createby}, ${ApprovalStatus === 'a' ? 'A' : 'DA'}, ${branchid}`;
          await db.query(ApprovalQuery);
        }

        res.status(200).json({ message: 'Role mapping updated successfully.' });
      } else {
        // If pageid is not an array or is empty, return an error
        res.status(400).json({ error: 'Invalid pageid format or empty array.' });
      }
    } catch (error) {
      console.error('Error in /RoleMapping route:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

}

// DASHBOARD
{
  //// Dashborad Notification 
  {
    server.post('/Notification', async (req, res) => {
      try {

        const { id, mood, branchid } = req.body

        const query = db.q`exec dbo.sp_Notification ${id},${mood},${branchid}`

        const response = await db.query(query)

        const count = response.recordsets?.[0]?.[0]?.loginAttemptCount ?? 0

        const PasswordAlertData = response.recordsets?.[1] ?? []

        res.status(200).json({ count, PasswordAlertData })

      } catch (error) {
        logErrorToFile(error)
        console.log(error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Internal Server Error' });
        }
      }
    })

    server.post('/ApprovalPendingNotification', async (req, res) => {
      try {
        const { id, mood, branchid } = req.body;
        const query = db.q`exec dbo.sp_Notification ${id},${mood},${branchid}`;
        const response = await db.query(query);
        // response.recordsets → array of all result sets
        res.status(200).json({
          ExternalLocationTransfer: response.recordsets[0] || [],
          InternalLocationTransfer: response.recordsets[1] || [],
          InwardAsset: response.recordsets[2] || [],
          PaymentHistory: response.recordsets[3] || [],
          InwardPending: response.recordsets[4] || [],
          MaintenanceDone: response.recordsets[5] || [],
          ExternalLocationTransferCount: response.recordsets[6]?.[0]?.ExternalLocationTransferCount || 0,
          InternalLocationTransferCount: response.recordsets[6]?.[0]?.InternalLocationTransferCount || 0,
          InwardAssetCount: response.recordsets[6]?.[0]?.InwardAssetCount || 0,
          PaymentHistoryCount: response.recordsets[6]?.[0]?.PaymentHistoryCount || 0,
          InwardPendingCount: response.recordsets[6]?.[0]?.InwardPendingCount || 0,
          MaintenanceDoneCount: response.recordsets[6]?.[0]?.MaintenanceDoneCount || 0
        });
      } catch (error) {
        logErrorToFile(error);
        console.error('ApprovalPendingNotification Error:', error);
        res.status(500).json({
          success: false,
          message: 'An error occurred while processing the request.',
          error: error.message,
        });
      }
    });

    server.post('/NotificationUpdate', async (req, res) => {
      try {

        const { id, mood, branchid } = req.body

        const query = db.q`exec dbo.sp_Notification ${id},${mood},${branchid}`

        const response = await db.query(query)
        res.status(200).json(response.recordset)

      } catch (error) {
        logErrorToFile(error)
        console.log(error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Internal Server Error' });
        }
      }
    })


    server.post('/ReminderNotification', async (req, res) => {
      try {
        const { id, mood, branchid } = req.body;
        const query = db.q`exec dbo.sp_Notification ${id},${mood},${branchid}`;
        const response = await db.query(query);
        res.status(200).json({
          reminderCount: response.recordsets[0] || [],
          reminderData: response.recordsets[1] || []
        });
      } catch (error) {
        logErrorToFile(error);
        console.error('Reminder Notification Error:', error);
        res.status(500).json({
          success: false,
          message: 'An error occurred (Reminder Notification) while processing the request.',
          error: error.message,
        });
      }
    });

  }

  /// Dashboard Count
  {
    server.post('/DashboradDatas', async (req, res) => {
      try {

        const { branchid } = req.query

        const query = db.q`exec sp_MHEDashboardCount ${branchid}`

        const response = await db.query(query)

        const Topcard = response.recordsets[0][0]

        const firstCardChart = response.recordsets[1][0]

        const SecondCardChart = response.recordsets[2][0]

        const ThirdCardChart = response.recordsets[3][0]

        const FourthCardChart = response.recordsets[4][0]

        res.status(200).json({ Topcard, firstCardChart, SecondCardChart, ThirdCardChart, FourthCardChart })

      } catch (error) {
        logErrorToFile(error)
        console.log('error in dashboard', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Internal Server Error' });
        }
      }
    })

    server.post('/DashbordModelData', async (req, res) => {
      try {

        const { mood, branchid } = req.body

        const query = db.q`exec DashbordModelData ${mood},${branchid}`

        console.log(query);

        const response = await db.query(query)

        res.status(200).send(response.recordset)

      } catch (error) {
        logErrorToFile(error)
        console.log('error in dashboard', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Internal Server Error' });
        }
      }
    })




    server.post('/Help-Desk-Mail', async (req, res) => {
      try {

        const { Name, EmailId, Comments, ToMail, branchid } = req.body

        const status = 'Sm'

        console.log(Name, EmailId, Comments, ToMail, status, branchid);


        sendSupportEmail(Name, EmailId, Comments, ToMail, status, branchid)
          .then((result) => {
            console.log(result);
          }).catch((err) => {
            console.log(err);
          })

        res.status(200).json('Mail Sended SuccessFully')



      } catch (error) {

        console.error('Error sending email:', error);
        logErrorToFile('Error sending email:', error)
        if (!res.headersSent) {
          res.status(500).json({ error: 'Internal Server Error' });
        }
      }
    })


    async function sendSupportEmail(Name, EmailId, Comments, ToMail, status, branchid) {
      try {

        const response = await db.query(db.q`SELECT * FROM EmailSendContent where status = ${status}`)

        const maildata = await response.recordset[0]

        const Frommail = await db.query(db.q`select * FROM EmailConfig where branchid = ${branchid}`)

        const frommdaildata = await Frommail.recordset[0]


        let smtpTransport = nodemailer.createTransport({
          service: `${frommdaildata.ServiceName}`,
          host: `${frommdaildata.HostName}`,
          port: `${frommdaildata.PortNo}`,
          secure: false,
          auth: {
            user: `${frommdaildata.frommail}`,
            pass: `${frommdaildata.apppassword}`,
          },
        });

        const emailContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Created</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
          .title { color: #333; font-size: 20px; margin-bottom: 20px; }
          .content { font-size: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2 class="title">${maildata.bodyHead}</h2>
          <p class="content">${maildata.bodyContent1} ,</p>
          <p class="content">${maildata.bodyContent2}</p>
           
          <p class="content"><strong>Name : ${Name}</strong></p>
          <p class="content"><strong>EmailId : ${EmailId}</strong></p>
          <p class="content"><strong>Reason : </strong></p>
          <br/>
          <p class="content"><strong>Reason ${Comments}</strong></p>
          <p class="content">${maildata.bodyFooter1}</p>
          <p class="content">${maildata.bodyFooter}<br/>Granules</p>
        </div>
      </body>
      </html>
    `;


        await smtpTransport.sendMail({
          from: `${frommdaildata.frommail}`,
          to: ToMail,
          subject: `${maildata.subject}`,
          html: emailContent,
        });


        console.log("Email sent successfully.");
      } catch (error) {
        console.error('Error sending email:', error);
        logErrorToFile('Error sending email:', error)
      }
    }

  }
}
// BRANCHMASTER 
{
  server.post('/BranchMaster', async (req, res) => {
    try {

      const { id, branchName, ContactPerson, ContactNumber, EmailId, Address, City, State, Pincode,
        Country, GSTNumber, PANNumber, BankName, AccountNumber, IFSCCode, createdby, updateby, mode, } = req.body

      const query = db.q`exec sp_BranchMaster ${id},${branchName},${Address || ''},${ContactPerson || ''},${ContactNumber || ''},${City || ''},${State || ''},${Country || ''},${Pincode || ''},${EmailId || ''},${GSTNumber || ''},${PANNumber || ''},${BankName || ''},${AccountNumber || ''},${IFSCCode || ''},${createdby},${updateby},${mode}`


      const response = await db.query(query)

      res.status(200).send(response.recordset)

    } catch (error) {

      logErrorToFile(error)
      console.log(error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })
}

// ASSET TRACKING VIMAL START
{


  // Asset Register

  server.post('/NewRegister', async (req, res) => {
    /* #swagger.tags = ['Asset Register']
       #swagger.summary = 'Register a new asset'
       #swagger.description = 'Creates an asset via the AssetRegisterMaster stored procedure. mode "I" inserts. Dates are dd-mm-yyyy or ISO strings; PCost is the purchase cost; AssetImg is the uploaded image path from POST /api/upload.'
       #swagger.parameters['body'] = {
           in: 'body',
           schema: { mode: 'I', AssetID: 'AST-0001', AssetName: 'Dell Latitude 5440', Brand: 'Dell', Model: 'Latitude 5440', Category: 'Laptop', SubCategory: 'Workstation', Department: 'IT', AssetType: 'IT Asset', AssetGroupName: 'Computers', PackageName: 'Standard', VendorName: 'ABC Suppliers', PhoneNumber: '9876543210', InvoiceNumber: 'INV-2026-101', PDate: '2026-01-15', PCost: 85000, WType: 'Warranty', WPeriod: '36', WEndDate: '2029-01-15', Description: 'Developer laptop', AssetImg: 'uploads/image1736633398309.jpg', Movement: 'Reg WithOut RFID', LinkID: '', LocationRFID: '', MaintainById: '', DepreciationType: 'SLM', DepreciationMode: 'Yearly', DepreciationValue: 10, CreatedBy: 'EMP001', CreatedDate: '2026-08-26', branchid: 1 }
       } */
    try {

      const { AssetGroupName, MaintainById, AssetID, Brand, Model, Category, SubCategory, Department, CreatedBy, PDate, PCost, CreatedDate, WType, WPeriod, WEndDate, Description, AssetImg, Movement, InvoiceNumber, AssetName, mode, branchid, VendorName, PhoneNumber, LinkID, AssetType, LocationRFID, PackageName, DepreciationType, DepreciationMode, DepreciationValue } = req.body;

      const query = db.q` EXEC AssetRegisterMaster '',${AssetID},${AssetName},${InvoiceNumber},${Brand},${Model},${Category},${SubCategory},${Department},${VendorName},${PhoneNumber},${PDate},${PCost},${CreatedDate},${WType},${WPeriod},${WEndDate},${Description},'',${LinkID},${LocationRFID},${AssetImg},${CreatedBy},'','','','','',${Movement},'','','','','','',${AssetType},${mode},'',${branchid},'',${AssetGroupName},${MaintainById},${PackageName},${DepreciationType},${DepreciationMode},${DepreciationValue}`;

      const response = await db.query(query);

      res.status(200).send(response.recordset);


    } catch (err) {
      console.error('Error in login:', err);
      res.status(500).json({ error: 'Internal Server Error ' });
    }


  })



  server.post('/RegisterAssetInfo', async (req, res) => {
    /* #swagger.tags = ['Asset Register']
       #swagger.summary = 'Full registered-asset list'
       #swagger.description = 'Returns every registered asset for the branch (assetInfo stored procedure). Large payload — the response is gzip-compressed.'
       #swagger.parameters['body'] = {
           in: 'body',
           schema: { branchid: 1, BranchAccess: 'All' }
       } */
    try {
      const { branchid, BranchAccess } = req.body;
      const DetailsQuery = db.q`EXEC assetInfo ${branchid},${BranchAccess}`

      const response = await db.query(DetailsQuery)
      const senddata = response.recordset;
      res.status(200).json({ senddata });
    } catch (err) {
      console.error('Error in RegisterAssetInfo:', err);
      logErrorToFile(err)
      res.status(500).json({ error: 'Internal Server Error' });
    }
  })


  server.post('/UpdateRegister', async (req, res) => {
    try {

      const { id, AssetID, AssetName, Brand, Model, Category, SubCategory, Department, PDate, PCost, CreatedDate, WType, WPeriod, WEndDate, Description, UpdatedBy, mode, InvoiceNumber, AssetImg, VendorName, PhoneNumber, AssetType, AssetGroupName, PackageName, MaintainById, DepreciationType, DepreciationMode, DepreciationValue } = req.body;
      const query = db.q`EXEC AssetRegisterMaster ${id},${AssetID},${AssetName},${InvoiceNumber},${Brand},${Model},${Category},${SubCategory},${Department},${VendorName},${PhoneNumber},${PDate},${PCost},${CreatedDate},${WType},${WPeriod},${WEndDate},${Description},'','','',${AssetImg},'',${UpdatedBy},'','','','','','','','','','','',${AssetType},${mode},'','','',${AssetGroupName},${MaintainById},${PackageName},${DepreciationType},${DepreciationMode},${DepreciationValue}`;
      const response = await db.query(query)
      const send = response.recordset
      res.status(200).json({ send })

    } catch (err) {
      console.error('Error in login:', err);
      res.status(500).json({ error: 'Internal Server Error ' });
    }


  })

  // VIEW
  server.post('/ViewRegister', async (req, res) => {
    /* #swagger.tags = ['Asset Register']
       #swagger.summary = 'View registered assets'
       #swagger.description = 'Fetches registered asset rows via AssetRegisterMaster. mode "S" lists; pass an id to fetch a single asset (id "" for all).'
       #swagger.parameters['body'] = {
           in: 'body',
           schema: { id: '', mode: 'S', branchid: 1, BranchAccess: 'All' }
       } */
    try {
      const { id, mode, branchid, BranchAccess } = req.body;
      const query = db.q`EXEC AssetRegisterMaster ${id},'','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','',${mode},'',${branchid},${BranchAccess},'','','','','',''`;

      const response = await db.query(query);
      const send = response.recordset
      res.status(200).json({ send })
    }
    catch (err) {
      console.error('Error in login:', err);
      res.status(500).json({ error: 'Internal Server Error ' });
    }
  });
  // Defect Asset Register
  server.post('/DefectAsset', async (req, res) => {
    try {
      const { SerialNumber, Brand, Model, Category, Vendors, Defect, Condition, POnumber, CreatedBy } = req.body;
      const query = db.q`INSERT INTO DefectassetRegister(SerialNumber, Brand, Model, Category, Vendors,Defect,Condition,POnumber,InspectedBy) VALUES(${SerialNumber},${Brand},${Model},${Category},${Vendors},${Defect},${Condition},${POnumber},${CreatedBy});`
      const response = await db.query(query)
      res.status(200).send(response.recordset)
    } catch (err) {
      console.error('Error in login:', err);
      res.status(500).json({ error: 'Internal Server Error ' });
    }
  })

  server.post('/DefectAssetInfo', async (req, res) => {
    try {
      const DetailsQuery = "SELECT  * FROM DefectassetRegister";
      const response = await db.query(DetailsQuery)
      if (response.recordset.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      const senddata1 = response.recordset;
      res.status(200).json({ senddata1 });
    } catch (err) {
      console.error('Error in DefectAssetInfo:', err);
      logErrorToFile(err)
      res.status(500).json({ error: 'Internal Server Error' });
    }
  })
  // Map Asset to RFID
  server.post('/MapRfidtoAsset', async (req, res) => {
    try {
      const { id } = req.body;
      const query = db.q`SELECT * FROM assetRegister WHERE id=${id}`;
      const response = await db.query(query);
      res.status(200).send(response.recordset)
    }
    catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })
  // Re-Mapped Asset to RFID
  server.post('/ReMapRfidtoAsset', async (req, res) => {
    try {
      const { id } = req.body;
      const query = db.q`SELECT * FROM assetRegister WHERE id=${id}`;
      const response = await db.query(query);
      const send = response.recordset
      res.status(200).json({ send })
    }
    catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })

  // HandleMap WITH RFID
  server.post('/UpdateRfid', async (req, res) => {
    try {
      const { Activity, RFIDnumber, RFID, id, Movement, AssetMappedBy, Status, AssetID, mode, branchid } = req.body;

      const query = db.q` EXEC AssetRegisterMaster ${id},${AssetID},'','','','','','','','','','','','','','','','',${Activity},'','','',${AssetMappedBy},'','',${RFIDnumber},${RFID},'',${Movement},'','','','','','','',${mode},${Status},${branchid},'','','','','','',''`;

      const response = await db.query(query)
      res.status(200).send(response.recordset)
    }
    catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })

  // HandleMap WITH OUT RFID
  server.post('/UpdateWithoutRFID', async (req, res) => {
    try {
      const { Activity, id, Movement, AssetMappedBy, Status, AssetID, mode, branchid } = req.body;
      // console.log(req.body);

      const query = db.q` EXEC AssetRegisterMaster ${id},${AssetID},'','','','','','','','','','','','','','','','',${Activity},'','','','',${AssetMappedBy},'','','','',${Movement},'','','','','','','',${mode},${Status},${branchid},'','','','','','',''`;

      const response = await db.query(query)
      res.status(200).send(response.recordset)
    }
    catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })

  // RemappedRfid
  server.post('/RemappedRfid', async (req, res) => {
    try {
      const { RFIDnumber, id, mode, AssetID, Movement, branchid } = req.body;

      const queryForDuplicate = db.q`exec Sp_RFIDDuplicateCheck ${RFIDnumber},${branchid}`
      const response = await db.query(queryForDuplicate)
      const [data] = response.recordset

      if (data.Count === 0) {
        const query = db.q`EXEC AssetRegisterMaster ${id},${AssetID},'','','','','','','','','','','','','','','','','','','','','','','',${RFIDnumber},'','',${Movement},'','','','','','','',${mode},'',${branchid},'','','','','','',''`;
        const response1 = await db.query(query)
        const send = response1.recordset
        res.status(200).json({ send })
      }
      else {
        res.status(250).json({ message: 'Already in Table' })
      }
    }
    catch (err) {
      console.log('Error in Remapped Asset', err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })

  // Enrolled AssetINFO
  server.post('/EnrolledAssetInfo', async (req, res) => {
    try {
      const { departmentname, mode, branchid, BranchAccess } = req.body
      const query = db.q`EXEC EnrolledInfo ${departmentname},${mode},${branchid},${BranchAccess}`;
      const response = await db.query(query)
      const send = response.recordset;
      res.status(200).json({ send });
    } catch (err) {
      console.error('Error in EnrolledAssetInfo:', err);
      logErrorToFile(err)
      res.status(500).json({ error: 'Internal Server Error' });
    }
  })

  // Server-side paginated version of the With/Without RFID list.
  // Returns { rows: [...one page...], total } so the grid loads 50 rows at a
  // time instead of all ~6,500. The old /EnrolledAssetInfo above is untouched.
  server.post('/EnrolledAssetInfoPaged', async (req, res) => {
    try {
      // Coerce every parameter to its exact expected type so a stray object /
      // number / undefined from the client can never reach mssql as a bad value.
      const mode = String(req.body.mode ?? 'WithRFID');
      const departmentname = String(req.body.departmentname ?? 'All') || 'All';
      const branchid = parseInt(req.body.branchid, 10) || 0;
      const BranchAccess = String(req.body.BranchAccess ?? '');
      const startRow = parseInt(req.body.startRow, 10) || 0;
      const pageSize = parseInt(req.body.pageSize, 10) || 50;
      const sortCol = String(req.body.sortCol ?? 'CreatedDate') || 'CreatedDate';
      const sortDir = req.body.sortDir === 'asc' ? 'asc' : 'desc';
      const search = String(req.body.search ?? '');
      // per-column filters as a JSON string; '' when none (the SP treats a
      // non-JSON value as "no filter")
      let filters = '';
      if (req.body.filters && typeof req.body.filters === 'object' && Object.keys(req.body.filters).length)
        filters = JSON.stringify(req.body.filters);
      else if (typeof req.body.filters === 'string')
        filters = req.body.filters;

      const query = db.q`EXEC dbo.EnrolledInfo_Paged ${mode},${departmentname},${branchid},${BranchAccess},${startRow},${pageSize},${sortCol},${sortDir},${search},${filters}`;
      const response = await db.query(query)
      const rows = response.recordsets[0] || [];
      const total = (response.recordsets[1] && response.recordsets[1][0]) ? response.recordsets[1][0].TotalRows : rows.length;
      res.status(200).json({ rows, total });
    } catch (err) {
      console.error('Error in EnrolledAssetInfoPaged:', err);
      logErrorToFile(err)
      res.status(500).json({ error: 'Internal Server Error' });
    }
  })

  server.post('/ViewEnrolledAssets', async (req, res) => {
    try {
      const { departmentname, mode, branchid, BranchAccess } = req.body
      const query = db.q`EXEC dbo.SP_EnrolledAssets ${departmentname},${branchid},${BranchAccess}`;
      const response = await db.query(query)
      const send = response.recordset;
      res.status(200).json({ send });
    } catch (err) {
      console.error('Error in ViewEnrolledAssets:', err);
      logErrorToFile(err)
      res.status(500).json({ error: 'Internal Server Error' });
    }
  })

  // [retired 23-Aug-2026] Cluster A employee-asset-mapping endpoints removed — dead code (userregister /
  // UnAssignedAssetTable / MappedAssets tables + assetRegister.AssetMapped column missing; no live caller):
  //   /userDetailsWithNull, /handleEnter, /handleEnterforEMP, /UnAssignedDetails
  // [retired 23-Aug-2026] /HandleClickforMapEmp removed — Cluster A dead code (MappedAssets / UnAssignedAssetTable missing; no live caller)
  // [retired 23-Aug-2026] /HandleEnterforReleasedAsset + /handleClickReleasedAsset removed —
  // Cluster A dead code (MappedAssets / UnAssignedAssetTable missing; no live caller)
  server.post('/HandleEnterforReleasedAndMaintenace', async (req, res) => {
    try {
      const { RFIDnumber, AssetMapped, MaintenanceDetails, MappedBy } = req.body
      const query = db.q`DELETE FROM MappedAssets WHERE RFIDnumber=${RFIDnumber}`
      const QueryForReleased = db.q`UPDATE assetRegister SET AssetMapped=${AssetMapped},MaintenanceDetails=${MaintenanceDetails} WHERE RFIDnumber=${RFIDnumber}`
      const response = await db.query(QueryForReleased);
      console.log(query)
      console.log(QueryForReleased)
      const responseforDelete = await db.query(query)
      res.send(responseforDelete.recordset)
      res.send(response.recordset)


    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }


  })
  server.post('/PendingAssetMaintenanceSearch', async (req, res) => {
    try {
      const { RFIDnumber, mode, branchid } = req.body
      const query = db.q`EXEC MaintenanceInfo ${RFIDnumber},'','','','','','','','','','','','',${mode},'','','','','','',${branchid},'','',''`

      const response = await db.query(query)
      res.status(200).send(response.recordset)

    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })


  async function sendMaintenanceNotification(RFIDnumber, AssetID, AssetName, MaintenanceType, RegisteredBy, DCNo, VendorID, DueDate, branchid) {
    try {
      // Fetch email template
      const response = await db.query(`SELECT * FROM EmailSendContent WHERE status = 'MA'`);
      const maildata = response.recordset[0];
      const RegisterInfo = await db.query(db.q`SELECT employeename FROM UserMainMaster WHERE Empid=${RegisteredBy}`);
      const Register = RegisterInfo.recordset[0].employeename;

      if (!maildata) {
        throw new Error('No email template found for status "MA"');
      }

      // Fetch sender email configuration
      const fromMailResult = await db.query(db.q`SELECT * FROM EmailConfig WHERE branchid = ${branchid}`);
      const fromMailData = fromMailResult.recordset[0];
      if (!fromMailData) {
        throw new Error(`No email configuration found for branchid ${branchid}`);
      }

      // Fetch recipient email
      const toEmailResult = await db.query(db.q`SELECT frommail FROM ToEmail WHERE branchid = ${branchid}`);
      const toEmail = toEmailResult.recordset[0]?.frommail;
      if (!toEmail) {
        throw new Error(`No recipient email found for branchid ${branchid}`);
      }

      // Set up Nodemailer transport
      let smtpTransport = nodemailer.createTransport({
        service: fromMailData.ServiceName,
        host: fromMailData.HostName,
        port: fromMailData.PortNo,
        secure: fromMailData.PortNo === 465, // Use secure: true for port 465, false for others
        auth: {
          user: fromMailData.frommail,
          pass: fromMailData.apppassword,
        },
      });

      // Email content (unchanged)
      const emailContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Maintenance Notification</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
          .title { color: #333; font-size: 20px; margin-bottom: 20px; }
          .content { font-size: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2 class="title">${maildata.bodyHead}</h2>
          <p class="content">${maildata.bodyContent1} sir/Mam,</p>
          <p class="content">${maildata.bodyContent2}</p>
          <p class="content"><strong>${maildata.bodymain1} ${AssetID}</strong></p>
          <p class="content"><strong>${maildata.bodymain2} ${RFIDnumber}</strong></p>
          <p class="content"><strong>Registered By: ${Register}</strong></p>
          <p class="content"><strong>DC No: ${DCNo}</strong></p>
          <p class="content"><strong>Vendor ID: ${VendorID}</strong></p>
          <p class="content">${maildata.bodyFooter1}</p>
          <p class="content">${maildata.bodyFooter}<br/>Granules</p>
        </div>
      </body>
      </html>
    `;

      // Send email
      await smtpTransport.sendMail({
        from: fromMailData.frommail,
        to: toEmail, // Use the extracted email address
        subject: maildata.subject,
        html: emailContent,
      });

      console.log('Email sent successfully.');
    } catch (error) {
      console.error('Error sending email:', error);
      logErrorToFile('Error sending email:', error);
      throw error; // Rethrow to handle in the calling function
    }
  }
  // Update Maintenance Register
  server.post('/UpdateMaintenanceReg', async (req, res) => {
    try {
      const { RFIDnumber, id, Activity, VendorID, MaintenanceType, Status, ScrapRegDate, Description, MaintenanceDetails, RegisteredBy, AssetID, AssetName, mode, Movement, Remarks, branchid, DueDate, DCNo } = req.body


      const QueryUM = db.q`EXEC MaintenanceInfo ${RFIDnumber},${MaintenanceDetails},${Movement},${id},${AssetID},${AssetName},${Activity},${VendorID},${MaintenanceType},${Status},${ScrapRegDate},${Remarks},${RegisteredBy},${mode},'','','','','','',${branchid},'',${DueDate},${DCNo}`;


      const response = await db.query(QueryUM)
      if (response.rowsAffected[0] === 1) {
        const QueryUM = db.q`EXEC MaintenanceInfo ${RFIDnumber},${MaintenanceDetails},${Movement},${id},${AssetID},${AssetName},${Activity},${VendorID},${MaintenanceType},${Status},${ScrapRegDate},${Remarks},${RegisteredBy},'print','','','','','','',${branchid},'',${DueDate},${DCNo}`;

        const response = await db.query(QueryUM);

        await sendMaintenanceNotification(RFIDnumber, AssetID, AssetName, MaintenanceType, RegisteredBy, DCNo, VendorID, DueDate, branchid);

      }

      res.status(200).send(response.recordset)


    } catch (err) {
      console.log("Error On upadte Maintenance Register Backend", err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  });
  server.post('/PrintMaintenanceAsset', async (req, res) => {
    try {
      const { RFIDnumber, id, Activity, VendorID, MaintenanceType, Status, ScrapRegDate, Description, MaintenanceDetails, RegisteredBy, AssetID, AssetName, mode, Movement, Remarks, branchid, DueDate, DCNo } = req.body


      const QueryUM = db.q`EXEC MaintenanceInfo ${RFIDnumber},${MaintenanceDetails},${Movement},${id},${AssetID},${AssetName},${Activity},${VendorID},${MaintenanceType},${Status},${ScrapRegDate},${Remarks},${RegisteredBy},${mode},'','','','','','',${branchid},'',${DueDate},${DCNo}`;

      const response = await db.query(QueryUM)

      res.status(200).send(response.recordset)


    } catch (err) {
      console.log("Error On upadte Maintenance Register Backend", err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })
  // Move To Scrap
  server.post('/MovetoScrap', async (req, res) => {
    try {
      const { RFIDnumber, AssetID, AssetName, RegisteredBy, mode, Movement, branchid, Remarks } = req.body;


      // Query For Insert Data to Scrap Asset Table
      const queryforMoveScrap = db.q`EXEC MaintenanceInfo ${RFIDnumber},'',${Movement},'',${AssetID},${AssetName},'','','','','',${Remarks},${RegisteredBy},${mode},'','','','','','',${branchid},'','',''`
      console.log("🚀 ~ queryforMoveScrap:", queryforMoveScrap)

      const response = await db.query(queryforMoveScrap)
      res.status(200).send(response.recordset)



    } catch (err) {
      console.log("Error On Move To Scrap", err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })

  // Under Maintenance Start

  // Search Under Maintenance 
  server.post("/SearchUnderMaintenance", async (req, res) => {
    try {
      const { RFIDnumber, mode, branchid } = req.body
      const query = db.q`EXEC MaintenanceInfo ${RFIDnumber},'','','','','','','','','','','','',${mode},'','','','','','',${branchid},'','',''`
      const response = await db.query(query);
      res.status(200).send(response.recordset)

    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })
  server.post("/UnderMaintenance", async (req, res) => {
    try {
      const { mode, departmentname, branchid, BranchAccess } = req.body
      const query = db.q`EXEC MaintenanceInfo ${departmentname},'','','','','','','','','','','','',${mode},'','','','','','',${branchid},${BranchAccess},'',''`
      // console.log(query);

      const response = await db.query(query);
      const send = response.recordset
      res.status(200).json({ send })

    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })
  // Update Maintenance Done 
  server.post('/MaintenanceDoneReg', async (req, res) => {
    try {
      const { RFIDnumber, id, Status, Vendors, MaintenanceInvoiceNumber, MaintenanceCost, Activity, BranchName, PhysicalLocation, Description, MaintenanceID, MaintenanceRegDate, MaintenanceDetails, RegisteredBy, mode, AssetID, AssetName, Movement, LocationRFID, Remarks, branchid, DCNo } = req.body

      const query = db.q`EXEC MaintenanceInfo ${RFIDnumber},${MaintenanceDetails},${Movement},${id},${AssetID},${AssetName},${Activity},${Vendors},'',${Status},'',${Remarks},${RegisteredBy},${mode},${MaintenanceInvoiceNumber},${MaintenanceCost},${BranchName},${PhysicalLocation},${MaintenanceRegDate},${LocationRFID},${branchid},'','',${DCNo}`

      const response = await db.query(query)
      res.status(200).send(response.recordset)

    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })

  // Configiration Start
  // Company Master
  server.post('/CompanyRegister', async (req, res) => {
    try {
      const { CompanyName, IndustryType, PostalCode, CompanyUrl, City, State, CompanyAddress } = req.body
      const query = db.q`INSERT INTO CompanyMasterTable(CompanyName,IndustryType,PostalCode,CompanyUrl,City,State,CompanyAddress) VALUES(${CompanyName},${IndustryType},${PostalCode},${CompanyUrl},${City},${State},${CompanyAddress})`
      const response = await db.query(query)
      res.status(200).send(response.recordset)
    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })

  server.post('/FetchCompanyInfo', async (req, res) => {
    try {
      const queryselect = `SELECT * FROM CompanyMasterTable`
      const response = await db.query(queryselect)
      const send = response.recordset;
      res.status(200).json({ send })

    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })


  // Location Master Start
  server.post('/LocationRegister', async (req, res) => {
    /* #swagger.tags = ['Masters']
       #swagger.summary = 'Location master — create / update / list'
       #swagger.description = 'Manages RFID-tagged physical locations (building + floor + room + location tag). Common modes: I = insert, U = update, getLocation = list locations for dropdowns.'
       #swagger.parameters['body'] = {
           in: 'body',
           schema: { mode: 'getLocation', Building: 'Main Block', Floor: '3rd Floor', Room: 'Server Room', LocationRFID: 'E28011700000020F', LinkID: '', Createdby: 'EMP001', Updatedby: '', branchid: 1, BranchAccess: 'All' }
       } */
    try {
      const { Building, Floor, Room, LocationRFID, mode, branchid, Createdby, LinkID, BranchAccess, Updatedby } = req.body;
      const query = db.q`EXEC [Master].[SP_LinkLocation] ${LinkID},${Building},${Floor},${Room},${LocationRFID},${mode},${Createdby},${Updatedby},${branchid},${BranchAccess}`
      const response = await db.query(query)
      res.status(200).send(response.recordset)

    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })
  // Fetch LocationList
  server.post('/fetchLocationList', async (req, res) => {
    const { mode, branchid, BranchAccess } = req.body; // Get branch name from the request body
    try {
      const query = db.q`EXEC [Master].[SP_LinkLocation] '','','','','',${mode},'','',${branchid},${BranchAccess}`;
      const result = await db.query(query); // Use parameterized queries to prevent SQL injection
      const send = result.recordset;
      res.status(200).json({ send });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'An error occurred' });
    }

  })
  // Search Given data for Edit
  server.post('/SearchEditDetails', async (req, res) => {
    const { mode, branchid, ID } = req.body; // Get branch name from the request body
    try {
      const query = db.q`EXEC [Master].[SP_LinkLocation] ${ID},'','','','',${mode},'','',${branchid},''`;
      // console.log(query);

      const result = await db.query(query); // Use parameterized queries to prevent SQL injection
      const send = result.recordset;
      res.status(200).json({ send });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'An error occurred' });
    }
  })
  server.post('/UpdateLocation', async (req, res) => {
    try {
      const { branchName, LocationRFID, Location, mode, ID, branchid } = req.body
      const queryselect = db.q`EXEC  [dbo].[SP_UpdateLocationMasterInfo] ${ID},${branchName},${Location},${LocationRFID},${mode},${branchid}`
      const response = await db.query(queryselect)
      res.status(200).send(response.recordset)


    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })

  // Room Master Start
  server.post('/RoomRegister', async (req, res) => {
    try {
      const { Location, Room } = req.body;
      const query = db.q`INSERT INTO PhysicalLocation(Location,Room) VALUES(${Location},${Room})`
      const response = await db.query(query)
      res.status(200).send(response.recordset)

    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })
  // Fetch Room List
  server.post('/fetchRoomList', async (req, res) => {
    try {
      const queryselect = `SELECT * FROM PhysicalLocation`
      const response = await db.query(queryselect)
      const send = response.recordset;
      res.status(200).json({ send })

    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })
  server.post('/FetchCategory', async (req, res) => {
    try {
      const { mode, branchid, BranchAccess } = req.body
      const queryselect = db.q`EXEC CategoryMasterInfo '','','',${mode},'','',${branchid},${BranchAccess}`

      const response = await db.query(queryselect)
      const send = response.recordset;
      res.status(200).json({ send })

    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })
  // INSERT DATA TO CATEGORY TABLE
  server.post('/AddCategory', async (req, res) => {
    try {
      const { Category, SubCategory, mode, Createdby, branchid } = req.body
      const InsertQuery = db.q`EXEC CategoryMasterInfo ${Category},${SubCategory},'',${mode},${Createdby},'',${branchid},''`
      const response = await db.query(InsertQuery);
      res.status(200).send(response.recordset)

    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })
  // Fetch GIVEN Category
  server.post('/FetchGivenData', async (req, res) => {
    try {
      const { CategoryID, mode, branchid } = req.body
      const queryselect = db.q`EXEC CategoryMasterInfo '','',${CategoryID},${mode},'','',${branchid},''`
      const response = await db.query(queryselect)
      const send = response.recordset;
      res.status(200).send({ send })

    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })
  // Edit DATA TO CATEGORY TABLE
  server.post('/UpdateCategory', async (req, res) => {
    try {
      const { Category, SubCategory, mode, oldCategory, oldSubCategory, Updatedby, branchid } = req.body
      const UpdateQuery = db.q`EXEC [dbo].[SP_UpdateCategoryMasterInfo] ${Category},${SubCategory},${oldCategory},${oldSubCategory},${mode},${Updatedby},${branchid}`
      // console.log(UpdateQuery);

      const response = await db.query(UpdateQuery)
      res.status(200).send(response.recordset)
    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })


  // Fetch INDUSTRY
  server.post('/FetchDepartment', async (req, res) => {
    try {
      const { mode, branchid, BranchAccess } = req.body
      const queryselect = db.q`EXEC DepartmentMasterInfo '','',${mode},'','',${branchid},${BranchAccess}`
      const response = await db.query(queryselect)
      const send = response.recordset;
      res.status(200).json({ send })

    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })
  // INSERT DATA TO INDUSTRY TABLE
  server.post('/AddDepartment', async (req, res) => {
    try {
      const { Department, mode, Createdby, branchid } = req.body
      const InsertQuery = db.q`EXEC DepartmentMasterInfo ${Department},'',${mode},${Createdby},'',${branchid},''`
      const response = await db.query(InsertQuery);
      res.status(200).send(response.recordset)

    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })
  // Fetch GIVEN Department Data
  server.post('/FetchGivenDataDepartment', async (req, res) => {
    try {
      const { DepartmentID, mode, branchid } = req.body
      const queryselect = db.q`EXEC DepartmentMasterInfo '',${DepartmentID},${mode},'','',${branchid},''`
      const response = await db.query(queryselect)
      const send = response.recordset;
      res.status(200).json({ send })

    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })
  // Edit DATA TO Department TABLE
  server.post('/UpdateDepartment', async (req, res) => {
    try {
      const { DepartmentID, Department, mode, oldDepartment, Updatedby, branchid } = req.body
      const UpdateQuery = db.q`EXEC [dbo].[SP_UpdateDepartmentMasterInfo] ${Department},${oldDepartment},${mode},${Updatedby},${branchid}`
      const response = await db.query(UpdateQuery)
      res.status(200).send(response.recordset)
    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })



  // Fetch Maintenance
  server.post('/fetchMaintenance', async (req, res) => {
    try {
      const { Createdby, branchid, mode, BranchAccess } = req.body;
      const queryselect = db.q`EXEC [dbo].[MaintenanceMasterInfo] '','',${mode},'','',${branchid},${BranchAccess}`
      const response = await db.query(queryselect)
      const send = response.recordset;
      res.status(200).json({ send })


    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })
  // INSERT DATA TO Maintenance TABLE
  server.post('/AddMaintenance', async (req, res) => {
    try {
      const { MaintenanceType, branchid, mode, Createdby } = req.body
      const queryselect = db.q`EXEC [dbo].[MaintenanceMasterInfo] ${MaintenanceType},'',${mode},${Createdby},'',${branchid},''`
      console.log(queryselect);

      const response = await db.query(queryselect)
      res.status(200).send(response.recordset)

    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })
  // Fetch GIVEN Maintenance
  server.post('/FetchGivenDataMaintenance', async (req, res) => {
    try {

      const { MaintenanceID, Createdby, branchid, mode } = req.body;
      const queryselect = db.q`EXEC [dbo].[MaintenanceMasterInfo] '',${MaintenanceID},${mode},'','',${branchid},''`
      const response = await db.query(queryselect)
      const send = response.recordset;
      res.status(200).json({ send })

    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })
  // Edit DATA TO Maintenance TABLE
  server.post('/UpdateMaintenance', async (req, res) => {
    try {
      const { MaintenanceID, Updatedby, branchid, mode, MaintenanceType } = req.body;
      const queryselect = db.q`EXEC [dbo].[MaintenanceMasterInfo] ${MaintenanceType},${MaintenanceID},${mode},'',${Updatedby},${branchid},''`
      const response = await db.query(queryselect)
      res.status(200).send(response.recordset)
    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })


  // Fetch Vendors
  server.post('/FetchVendors', async (req, res) => {
    try {
      const { branchid, mode, BranchAccess } = req.body;
      const queryselect = db.q`EXEC [dbo].[VendorsMasterInfo] '','','','','','','','','','',
      '','','','',${mode},'','',${branchid},${BranchAccess}`
      const response = await db.query(queryselect)
      const send = response.recordset;
      res.status(200).json({ send })

    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })
  // INSERT DATA TO VENDORS TABLE
  server.post('/SaveVendors', async (req, res) => {
    try {
      const { Address, BankAccountNo, City, ContactPerson, Country, Createdby, Email, GSTNumber, IFSC, PAN, PhoneNumber, PostalCode, State, VendorID, VendorName, branchid, mode } = req.body;
      const queryselect = db.q`EXEC [dbo].[VendorsMasterInfo] '',${VendorName},${PhoneNumber},${Address},${BankAccountNo},${City},${ContactPerson},${Country},${Email},${GSTNumber},
      ${IFSC},${PAN},${PostalCode},${State},${mode},${Createdby},'',${branchid},''`
      const response = await db.query(queryselect)
      res.status(200).send(response.recordset)

    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })
  // Fetch GIVEN VENDORS
  server.post('/FetchGivenVendors', async (req, res) => {
    try {
      const { VendorID, branchid, mode } = req.body;
      const queryselect = db.q`EXEC [dbo].[VendorsMasterInfo] ${VendorID},'','','','','','','','','',
      '','','','',${mode},'','',${branchid},''`
      const response = await db.query(queryselect)
      const send = response.recordset;
      res.status(200).json({ send })

    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })
  // Edit DATA TO VENDORS TABLE
  server.post('/UpdateVendors', async (req, res) => {
    try {
      const { Address, BankAccountNo, City, ContactPerson, Country, Updatedby, Email, GSTNumber, IFSC, PAN, PhoneNumber, PostalCode, State, VendorID, VendorName, branchid, mode } = req.body;
      const queryselect = db.q`EXEC [dbo].[VendorsMasterInfo] ${VendorID},${VendorName},${PhoneNumber},${Address},${BankAccountNo},${City},${ContactPerson},${Country},${Email},${GSTNumber},
      ${IFSC},${PAN},${PostalCode},${State},${mode},'',${Updatedby},${branchid},''`
      const response = await db.query(queryselect)
      res.status(200).send(response.recordset)
    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })


  // [retired 26-Aug-2026] /FetchRole, /SaveRole, /FetchGivenRole, /UpdateRole
  // removed — RoleMasterTable does not exist in the DB and the only caller
  // (Configure/Role.jsx, never routed) was deleted. Roles are managed via
  // /UserroleMaster.
  server.post('/Readerstatus', async (req, res) => {
    try {
      const { Id, ReaderIP, Status, LogTime, mode } = req.body
      const query = db.q`exec [dbo].[Sp_ReaderStatusLog] @Id=${Id},@ReaderIp=${ReaderIP},@Status=${Status},@LogTime=${LogTime},@mode=${mode}`
      const response = await db.query(query);
      res.status(200).send(response.recordset)
    } catch (err) {
      console.error(err);
      res.status(500).json('internal server error')
    }
  })
  server.post('/Atennastatus', async (req, res) => {
    try {
      const {
        Id,
        ReaderIP,
        AntennaID,
        Status,
        Gain,
        TransmitPower,
        ReceiveSensitivity,
        LogTime,
        mode,
      } = req.body;

      const query = db.q`EXEC [dbo].[Sp_AntennaStatusLog]
      @Id=${Id},
      @ReaderIP=${ReaderIP},
      @AntennaID=${AntennaID},
      @Status=${Status},
      @Gain=${Gain},
      @TransmitPower=${TransmitPower},
      @ReceiveSensitivity=${ReceiveSensitivity},
      @LogTime=${LogTime},
      @mode=${mode}`;
      console.log(query);

      const response = await db.query(query);
      res.status(200).send(response.recordset);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  server.post('/AntennaRSSI', async (req, res) => {
    try {
      // Defaults matter: the AntennaRSSI screen's grid fetch (mode 'F') sends
      // only the Antenna fields — MinRSSI/createdby/updateby were undefined,
      // which db.q renders as the string 'undefined' and the SP's int
      // parameters then fail with "Error converting data type nvarchar to int".
      const {
        Id = '',
        ReaderIP = '',
        AntennaID = '',
        MinRSSI = '',
        createdby = '',
        updateby = '',
        branchid = '',
        mode,
      } = req.body;

      const query = db.q`
      EXEC dbo.Sp_ReaderAntennaRSSI
        ${Id},
        ${ReaderIP},
        ${AntennaID},
        ${MinRSSI},
        ${createdby},
        ${updateby},
        ${branchid},
        ${mode}
    `;

      console.log('🚀 Executing Query:', query);

      // ✅ THIS MATCHES YOUR EXISTING DB STYLE
      const response = await db.query(query);

      res.status(200).json({
        locations: response.recordset || response[0] || [],
      });

    } catch (err) {
      console.error('❌ Error fetching antenna RSSI data:', err);
      res.status(500).json({
        error: 'Failed to fetch antenna RSSI data',
      });
    }
  });

  // Configure End


  // Movement Start
  // Inward 
  // [retired 23-Aug-2026] Cluster A movement endpoints removed — dead code (MappedAssets /
  // InwardOutwardMovement tables missing; only caller was the orphaned InwardEntry/OutwardEntry files):
  //   /handleEnterforInward, /HandleClickInward, /handleEnterforOutward, /HandleClickOutward, /OutwardAssetTable
  // Transfer Location
  server.post('/handleEnterforTransfer', async (req, res) => {
    try {
      const { RFIDnumber, mode, branchid, BranchAccess } = req.body
      const query = db.q`EXEC TransferedAssetReport ${RFIDnumber},'','','','','','','','','','',${mode},${branchid},${BranchAccess}`
      console.log(query);

      const response = await db.query(query)
      res.status(200).send(response.recordset)

    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })
  // Transfer Location Internally 
  server.post('/InternalLocationTransfer', async (req, res) => {
    try {

      const { AssetID, AssetName, Location, NewLocation, RFIDnumber, TransferedBy, Remarks, mode, branchid, Category, BranchAccess, SubCategory, departmentname } = req.body;

      // QUERY FOR INSERT TRANSFER LOCATION ASSET
      const InsertQuery = db.q`EXEC [Sp_InternalTransfer] ${RFIDnumber},${AssetID},${AssetName},${Category},${SubCategory},${Location},${NewLocation},${TransferedBy},${Remarks},${mode},${branchid},${BranchAccess},${departmentname}`;

      const response = await db.query(InsertQuery);

      res.status(200).send(response.recordset);

    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })

  // Transfer Location Externally
  server.post('/ExternalLocationTransfer', async (req, res) => {
    try {

      const { TransferredBranchName, Transferredbranchid, ReceivedBranchName, Receivedbranchid, RFIDnumber, AssetID, Activity, Remarks, AssetName, AssetCost, branchid, BranchAccess, TransferedBy, mode, departmentname, DCNo, TransferCost } = req.body;

      // QUERY FOR INSERT TRANSFER LOCATION ASSET
      const InsertQuery = db.q`EXEC [ExternalTransfer] ${RFIDnumber},${AssetID},${AssetName},${AssetCost},${TransferCost},${Remarks},${TransferredBranchName},${Transferredbranchid},${ReceivedBranchName},${Receivedbranchid},${mode},${branchid},${BranchAccess},${TransferedBy},${departmentname},${DCNo}`;

      console.log('InsertQuery', InsertQuery);

      const response = await db.query(InsertQuery)
      res.status(200).send(response.recordset)


    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })

  server.post('/PaymentHistory', async (req, res) => {
    try {

      const { TransferredBranchName, Transferredbranchid, ReceivedBranchName, Receivedbranchid, AssetID, Remarks, TransferCost, branchid, BranchAccess, TransferredBy, mode, departmentname, PaidAmount, DCNo, id } = req.body;

      // QUERY FOR INSERT TRANSFER LOCATION ASSET
      const InsertQuery = db.q`EXEC [dbo].[SP_PaymentHistory] ${id},${AssetID},${TransferCost},${PaidAmount},${Remarks},${TransferredBranchName},${Transferredbranchid},${ReceivedBranchName},${Receivedbranchid},${mode},${branchid},${BranchAccess},${TransferredBy},${departmentname},${DCNo}`;


      const response = await db.query(InsertQuery)
      res.status(200).send(response.recordset)

    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })

  // Transfer Location Externally
  server.post('/InwardAsset', async (req, res) => {
    try {
      const { TransferredBranchName, Transferredbranchid, ReceivedBranchName, Receivedbranchid, RFIDnumber, AssetID, Remarks, AssetName, TransferCost, branchid, BranchAccess, Receivedby, mode, PaidAmount, departmentname, DCNo, Location } = req.body;
      console.log('req.body', req.body);

      // QUERY FOR INSERT TRANSFER LOCATION ASSET
      const InsertQuery = db.q`EXEC [SP_InwardAsset] ${RFIDnumber},${AssetID},${AssetName},${TransferCost},${PaidAmount},${Remarks},${TransferredBranchName},${Transferredbranchid},${ReceivedBranchName},${Receivedbranchid},${mode},${branchid},${BranchAccess},${Receivedby},${departmentname},${DCNo},${Location}`;
      console.log('InsertQuery', InsertQuery);

      const response = await db.query(InsertQuery);
      res.status(200).send(response.recordset);

    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })

  // Reports

  // Fetch All Report
  server.post('/FetchAllDetails', async (req, res) => {
    try {
      const query = `EXEC AllAssetReport`
      const response = await db.query(query)
      const send = response.recordset
      res.status(200).json({ send })

    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })

  // [retired 26-Aug-2026] /FetchAssignedDetails, /FetchInwardAssetDetails,
  // /FetchOutwardAssetDetails, /FetchTransferedAssetDetails removed — their
  // report SPs are missing from the DB and the only callers (AssignedAsset /
  // InWardReport / OutWardReport / TransferedAssetReport .jsx, never routed)
  // were deleted. Live transfer reports use /InternalLocationTransfer and
  // /ExternalLocationTransfer instead.

  // Post Maintenance Report
  server.post("/FetchPostMaintenanceDetails", async (req, res) => {
    try {
      const { mode, departmentname, branchid, BranchAccess } = req.body
      const query = db.q`EXEC PostMaintenanceAssetReport ${mode},${departmentname},${branchid},${BranchAccess}`
      const response = await db.query(query);
      const send = response.recordset
      res.status(200).json({ send })

    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })
  // [retired 26-Aug-2026] /FetchScrapDetails and /FetchDepreciationAssetDetails
  // removed — SPs missing from the DB, callers (ScrapReport's commented call,
  // deleted DepreciationReport.jsx) gone. Scrap report uses /EnrolledAssetInfo.



  // CATEGORY DROPDOWN
  server.post('/fetchCategorydata', async (req, res) => {
    try {
      const { mode, branchid } = req.body
      const query = db.q`EXEC CategoryMasterInfo '','','',${mode},'','',${branchid},''`
      const response = await db.query(query)
      const send = response.recordset
      res.status(200).json({ send })

    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })
  // // SUB-CATEGORY DROPDOWN
  server.post('/fetchSubCategorydata', async (req, res) => {
    const { Category, mode, branchid } = req.body; // Get branch name from the request body
    try {

      const query = db.q`EXEC CategoryMasterInfo ${Category},'','',${mode},'','',${branchid},''`;
      const result = await db.query(query);
      const send = result.recordset;
      res.status(200).json({ send });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'An error occurred' });
    }
  });
  // LOCATION DROPDOWN
  server.post('/fetchLocation', async (req, res) => {
    try {
      const { mode, branchid } = req.body
      const query = db.q`EXEC [Master].[SP_LinkLocation] '','','','','',${mode},'','',${branchid},''`
      const response = await db.query(query)
      const send = response.recordset
      res.status(200).json({ send })

    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })

  // Location DropDown
  server.post('/fetchPhysicalLocations', async (req, res) => {
    const { branchName, mode, branchid } = req.body; // Get branch name from the request body
    try {
      const query = db.q`EXEC [Master].[SP_LinkLocation] '','','','','',${mode},'','',${branchid},''`;
      const result = await db.query(query, { branchName }); // Use parameterized queries to prevent SQL injection
      const send = result.recordset;
      res.status(200).json({ send });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'An error occurred' });
    }
  });
  // Department DropDown
  // Department DropDown
  server.post('/fetchDeparmentData', async (req, res) => {
    try {
      const { mode, branchid, BranchAccess } = req.body
      const query = db.q`EXEC DepartmentMasterInfo '','',${mode},'','',${branchid},${BranchAccess || ''}`
      const response = await db.query(query)
      const send = response.recordset
      res.status(200).json({ send })

    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })





  // [retired 23-Aug-2026] /fetchUser removed — Cluster A dead code (userregister table missing; no live caller)


  server.post('/dashboard/cards', async (req, res) => {
    /* #swagger.tags = ['Dashboard']
       #swagger.summary = 'Dashboard summary cards'
       #swagger.description = 'Returns the four dashboard card groups in one call: assets (total / with RFID / without RFID + values), maintenance (under maintenance, due date crossed), scrap count and maintenance cost. Filtered by department, branch and branch access.'
       #swagger.parameters['body'] = {
           in: 'body',
           schema: { departmentname: 'IT', branchid: 1, BranchAccess: 'All' }
       } */
    try {
      const { departmentname, branchid, BranchAccess } = req.body;

      const query = db.q`EXEC SP_Dashboard_Cards @departmentname = ${departmentname},
      @branchid = ${branchid},@BranchAccess = ${BranchAccess}`;

      const result = await db.query(query);

      res.json({
        assets: result.recordsets[0][0],
        maintenance: result.recordsets[1][0],
        scrap: result.recordsets[2][0],
        maintenanceCost: result.recordsets[3][0]
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Dashboard fetch failed' });
    }
  });



  // Dashboard Card 1
  server.post('/assetRegisterInfo', async (req, res) => {
    try {
      const { mode, departmentname, UserStatus, branchid, BranchAccess } = req.body
      // console.log(req.body)
      const query = db.q`EXEC Dashboard ${mode},${departmentname},${branchid},${BranchAccess}`
      const response = await db.query(query);
      const count = response.recordset[0].count;
      const totalPurchaseCost = response.recordset[0].totalPurchaseCost
      res.status(200).json({ totalRegisteredAssets: count, TotalAssetValue: totalPurchaseCost });
    } catch (err) {
      console.log(err)
      res.status(500).json({ error: 'Internal Server Error' });
    }
  })
  // Enrolled Asset
  server.post('/WithRFIDcount', async (req, res) => {
    try {
      const { mode, departmentname, branchid, BranchAccess } = req.body
      const query = db.q`EXEC Dashboard ${mode},${departmentname},${branchid},${BranchAccess} `
      const response = await db.query(query);
      const count = response.recordset[0].count;
      const totalPurchaseCost = response.recordset[0].totalPurchaseCost
      res.status(200).json({ EnrolledDataAsset: count, WithRFIDValue: totalPurchaseCost });
    } catch (err) {
      console.log(err)
      res.status(500).json({ error: 'Internal Server Error' });
    }
  })

  // UnEnrolled Asset
  server.post('/WithOutRFIDcount', async (req, res) => {
    try {
      const { mode, departmentname, branchid, BranchAccess } = req.body
      const query = db.q`EXEC Dashboard ${mode},${departmentname},${branchid},${BranchAccess} `
      const response = await db.query(query);
      const count = response.recordset[0].count;
      const totalPurchaseCost = response.recordset[0].totalPurchaseCost
      res.status(200).json({ UnEnrolledDataAsset: count, WithOutRFIDValue: totalPurchaseCost });
    } catch (err) {
      console.log(err)
      res.status(500).json({ error: 'Internal Server Error' });
    }
  })
  // DASHBOARD CARD 2
  // Assigned Asset
  server.post('/AssignedAsset', async (req, res) => {
    try {
      const query = `SELECT  COUNT(*) AS count FROM MappedAssets`
      const response = await db.query(query);
      const count = response.recordset[0].count;
      res.status(200).json({ AssignedAsset: count });

    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })
  // UnAssigned Asset
  // UnAssigned Data Details
  // [retired 23-Aug-2026] /UnAssignedAsset removed — Cluster A dead code (UnAssignedAssetTable missing; no live caller)


  // Maintenance Details
  server.post("/UnderMaintenanceAsset", async (req, res) => {
    try {
      const { mode, departmentname, branchid, BranchAccess } = req.body
      const query = db.q`EXEC Dashboard ${mode},${departmentname},${branchid},${BranchAccess} `
      const response = await db.query(query);
      const UnderMaintenanceCount = response.recordset?.[0]?.UnderMaintenanceCount ?? 0;
      const DueDateCrossedCount = response.recordset?.[0]?.DueDateCrossedCount ?? 0;
      res.status(200).json({ UnderMaintenanceAsset: UnderMaintenanceCount, DueDateCrossedCount: DueDateCrossedCount });

    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })
  server.post("/MaintenancCost", async (req, res) => {
    try {
      const { mode, departmentname, branchid, BranchAccess } = req.body
      const query = db.q`EXEC Dashboard ${mode},${departmentname},${branchid},${BranchAccess} `
      const response = await db.query(query);
      const MaintenanceCost = response.recordset[0].MaintenanceCost;
      res.status(200).json({ MaitenanceValue: MaintenanceCost });
    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })
  async function sendUnauthorizedAssetMail(assetId, assetName, date, branchid, building) {
    const fromMailResult = await db.query(db.q`SELECT * FROM EmailConfig WHERE branchid = ${branchid}`);
    const ToMailResult = await db.query(db.q`SELECT * FROM [dbo].[ToEmail] WHERE branchid = ${branchid}`);
    const tomail = ToMailResult.recordset[0].frommail;
    console.log('tomail', tomail);

    const fromMailData = fromMailResult.recordset[0];
    if (!fromMailData) {
      throw new Error(`No email configuration found for branchid ${branchid}`);
    }



    // Set up Nodemailer transport
    let smtpTransport = nodemailer.createTransport({
      service: fromMailData.ServiceName,
      host: fromMailData.HostName,
      port: fromMailData.PortNo,
      secure: fromMailData.PortNo === 465, // Use secure: true for port 465, false for others
      auth: {
        user: fromMailData.frommail,
        pass: fromMailData.apppassword,
      },
    });
    const emailContent = `
<table width="100%" cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif; background:#f4f6f9; padding:20px;">
  <tr>
    <td align="center">
      <table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; padding:20px;">
        <tr>
          <td style="text-align:center; font-size:18px; font-weight:bold; color:#b00020;">
            🚨 Unauthorized Asset Movement
          </td>
        </tr>
        <tr><td style="height:15px;"></td></tr>

        <tr>
          <td>
            <table width="100%" cellpadding="6" cellspacing="0" style="font-size:14px;">
              <tr>
                <td><strong>Asset ID</strong></td>
                <td>${assetId}</td>
              </tr>
              <tr>
                <td><strong>Asset Name</strong></td>
                <td>${assetName}</td>
              </tr>
              <tr>
                <td><strong>Building</strong></td>
                <td>${building}</td>
              </tr>
              <tr>
                <td><strong>Date & Time</strong></td>
                <td>${date}</td>
              </tr>
            </table>
          </td>
        </tr>

        <tr><td style="height:20px;"></td></tr>
        <tr>
          <td style="text-align:center; font-size:12px; color:#777;">
            Automated Alert • Please do not reply
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`;


    await smtpTransport.sendMail({
      from: fromMailData.frommail,
      to: tomail,
      subject: "Unauthorized Asset Movement Alert",
      html: emailContent
    });
  }


  // Dashboard IN-OUT Details
  server.post("/Get_In_Out_data", async (req, res) => {
    /* #swagger.tags = ['Dashboard']
       #swagger.summary = 'Dashboard movement lists'
       #swagger.description = 'Runs the Dashboard stored procedure for the given mode and returns the rows. Modes: SM = recent operations activity, SUM = unauthorized movements, FetchAuthdata = authorized movements, UM = unauthorized movements AND sends the alert mails (side effect — use with care). The dashboard normally receives this data pushed over the WebSocket /ws/dashboard.'
       #swagger.parameters['body'] = {
           in: 'body',
           schema: { mode: 'SM', departmentname: 'IT', branchid: 1, BranchAccess: 'All' }
       } */
    try {
      const { mode, departmentname, branchid, BranchAccess } = req.body;

      // 🔔 mode 'UM' also sends the unauthorized-movement alert mails —
      // shared with the dashboard WebSocket tick below.
      if (mode === 'UM') {
        const data = await processUnauthorizedMailQueue(departmentname, branchid, BranchAccess);
        return res.status(200).json({ send: data });
      }

      const query = db.q`EXEC Dashboard ${mode},${departmentname},${branchid},${BranchAccess}`;
      const response = await db.query(query);
      const data = response.recordset;

      res.status(200).json({ send: data });
    } catch (err) {
      console.log('err', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  });

  // UnAuthorized Table
  server.post("/Get_UnAuthorized_data", async (req, res) => {
    try {
      const query = `EXEC GetTop5UniqueRFIDLogs`
      const response = await db.query(query);
      const send = response.recordset
      res.status(200).json({ send })

    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })

  // Runs the Dashboard 'UM' pass: fetches unauthorized movements, mails an
  // alert for each and logs the outcome. Returns the rows. Used by both
  // POST /Get_In_Out_data (mode 'UM') and the dashboard WebSocket tick.
  async function processUnauthorizedMailQueue(departmentname, branchid, BranchAccess) {
    const query = db.q`EXEC Dashboard ${'UM'},${departmentname},${branchid},${BranchAccess}`;
    const response = await db.query(query);
    const data = response.recordset;

    for (const item of data) {
      let mailStatus = 'Pending';
      let errorMessage = null;
      const sqlDate = item.CreatedDate instanceof Date
        ? item.CreatedDate.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, '')
        : null;
      try {
        await sendUnauthorizedAssetMail(item.AssetID, item.AssetName, sqlDate, branchid, item.building);
        mailStatus = 'Sent';
        console.log(`Mail sent successfully for AssetID: ${item.AssetID}`);
      } catch (err) {
        mailStatus = 'Failed';
        errorMessage = err.message?.substring(0, 500) || 'Unknown error';
        console.error(`Mail failed for AssetID ${item.AssetID}:`, err);
        logErrorToFile(err);
      }

      await db.query(db.q`
      INSERT INTO UnauthorizedMailLog (AssetID, CreatedDate, MailStatus, ErrorMessage,MailSentOn)
      VALUES (${item.AssetID},${sqlDate},${mailStatus},${errorMessage},GETDATE())`);
    }

    return data;
  }

  // ── Dashboard WebSocket ────────────────────────────────────────────────
  // Replaces the frontend's 10-second REST polling. A client connects to
  // ws://host:PORT/ws/dashboard?token=<jwt> (browser WebSockets cannot set
  // an Authorization header, so the JWT travels in the query string), sends
  // one {type:'subscribe', departmentname, branchid, BranchAccess} message,
  // then receives {type: cards|movement|unauthorized|authorized, data}
  // frames — pushed only when that section's data actually changed.
  const DASHBOARD_WS_INTERVAL = 10000;

  const dashboardWss = new WebSocketServer({ server: httpServer, path: '/ws/dashboard' });

  async function buildDashboardFrames({ departmentname, branchid, BranchAccess }) {
    const [cards, movement, unauthorized, authorized] = await Promise.all([
      db.query(db.q`EXEC SP_Dashboard_Cards @departmentname = ${departmentname},
      @branchid = ${branchid},@BranchAccess = ${BranchAccess}`),
      db.query(db.q`EXEC Dashboard ${'SM'},${departmentname},${branchid},${BranchAccess}`),
      db.query(db.q`EXEC Dashboard ${'SUM'},${departmentname},${branchid},${BranchAccess}`),
      db.query(db.q`EXEC Dashboard ${'FetchAuthdata'},${departmentname},${branchid},${BranchAccess}`),
    ]);
    return {
      cards: {
        assets: cards.recordsets[0][0],
        maintenance: cards.recordsets[1][0],
        scrap: cards.recordsets[2][0],
        maintenanceCost: cards.recordsets[3][0],
      },
      // the Dashboard SP returns no recordset at all for some scopes —
      // normalize to [] so the frame is still pushed and diffed reliably
      movement: movement.recordset || [],
      unauthorized: unauthorized.recordset || [],
      authorized: authorized.recordset || [],
    };
  }

  dashboardWss.on('connection', (ws, req) => {
    let user;
    try {
      const token = new URL(req.url, 'http://localhost').searchParams.get('token');
      user = verifyToken(token);
    } catch (err) {
      ws.close(4401, 'Unauthorized');
      return;
    }

    let scope = null;
    let lastSent = {}; // frame type -> JSON last pushed, to skip unchanged data
    let ticking = false;
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });

    const pushUpdates = async () => {
      if (!scope || ticking || ws.readyState !== ws.OPEN) return;
      ticking = true;
      try {
        // Sliding refresh over the socket: a user watching the dashboard makes
        // no REST calls, so the refreshed token must arrive here instead.
        const refreshed = maybeRefreshToken(user);
        if (refreshed && ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({ type: 'token', data: refreshed }));
          user = verifyToken(refreshed); // adopt the new iat/exp for next check
        }

        const frames = await buildDashboardFrames(scope);
        // the alert mails ride this tick, exactly like the old 'UM' polling
        await processUnauthorizedMailQueue(scope.departmentname, scope.branchid, scope.BranchAccess);
        for (const [type, data] of Object.entries(frames)) {
          const body = JSON.stringify(data);
          if (lastSent[type] !== body && ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({ type, data }));
            lastSent[type] = body;
          }
        }
      } catch (err) {
        console.error('dashboard ws tick failed:', err);
        logErrorToFile(err);
      } finally {
        ticking = false;
      }
    };

    const timer = setInterval(pushUpdates, DASHBOARD_WS_INTERVAL);

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw);
        if (msg.type === 'subscribe') {
          scope = {
            departmentname: msg.departmentname ?? user.departmentname,
            branchid: msg.branchid ?? user.branchid,
            BranchAccess: msg.BranchAccess ?? user.BranchAccess,
          };
          lastSent = {}; // fresh subscription — resend everything
          pushUpdates();
        }
      } catch (err) {
        console.error('dashboard ws bad message:', err);
      }
    });

    ws.on('close', () => clearInterval(timer));
    ws.on('error', () => clearInterval(timer));
  });

  // Drop connections whose browser vanished without closing the socket.
  setInterval(() => {
    dashboardWss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);
  // DASHBOARD Depreciation Asset
  server.post('/DepreciationAsset', async (req, res) => {
    try {
      const query = `SELECT COUNT(*) as count FROM assetRegister WHERE RFID='YES' AND DepreciationType = 'DepriciationYes'`
      const response = await db.query(query);
      const count = response.recordset[0].count;
      res.status(200).json({ DepreciationAsset: count });
    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })

  // DASHBOARD SCRAP ASSET
  server.post('/ScrapAssetList', async (req, res) => {
    try {
      const { mode, departmentname, branchid, BranchAccess } = req.body;
      // console.log('Scrap Asset Count', req.body);
      const query = db.q`EXEC Dashboard ${mode}, ${departmentname},${branchid},${BranchAccess}`;
      const response = await db.query(query);

      // Check if the response.recordset has data before accessing it
      if (response.recordset && response.recordset.length > 0) {
        const count = response.recordset[0].count;
        // console.log('Scrap Asset Count', count);
        res.status(200).json({ ScrapAsset: count });
      } else {
        // If no data is returned, send a 404 or handle appropriately
        res.status(404).json({ message: 'No scrap asset count found' });
      }
    } catch (err) {
      console.log('Error On Scrap Asset Count', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Chart Count
  server.post('/DepartmentWiseCountInfo', async (req, res) => {
    try {
      const { mode, departmentname, UserStatus, branchid, BranchAccess } = req.body
      // console.log(UserStatus)
      const query = db.q`EXEC Dashboard ${mode},${departmentname},${branchid},${BranchAccess}`
      const response = await db.query(query);
      res.status(200).send(response.recordset);
    } catch (err) {
      console.log(err)
      res.status(500).json({ error: 'Internal Server Error' });
    }
  })

  server.post('/ChartDatas', async (req, res) => {
    /* #swagger.tags = ['Dashboard']
       #swagger.summary = 'Dashboard donut-chart data'
       #swagger.description = 'Asset distribution counts for the dashboard charts. Modes: PackageCount (by package), GroupCount (by asset group), FloorCount (by floor). LocationRFID filters to one location; use "All" or "" for every location.'
       #swagger.parameters['body'] = {
           in: 'body',
           schema: { mode: 'PackageCount', departmentname: 'IT', branchid: 1, BranchAccess: 'All', LocationRFID: 'All' }
       } */
    try {
      const { mode, departmentname, branchid, BranchAccess, LocationRFID } = req.body
      const query = db.q`EXEC dbo.SP_Dashboard_ChartData ${mode},${departmentname},${branchid},${BranchAccess},${LocationRFID}`;
      const response = await db.query(query);
      res.status(200).send(response.recordset);
    } catch (err) {
      console.log(err)
      res.status(500).json({ error: 'Internal Server Error' });
    }
  })

  server.post('/Rentaldata', async (req, res) => {
    try {
      const query = `SELECT COUNT(*) as count  FROM assetRegister WHERE RFID = 'YES' AND SelectPType='RentalAsset'`
      const response = await db.query(query);
      const count = response.recordset[0].count;
      res.status(200).json({ RentalAsset: count });
    } catch (err) {
      console.error('Error in Rentaldata:', err);
      logErrorToFile(err)
      res.status(500).json({ error: 'Internal Server Error' });
    }
  })


  server.post('/AuditForAsset', async (req, res) => {
    try {
      const { RFIDnumber, branchid, BranchAccess } = req.body;

      const pool = await db.connect();
      const request = pool.request();

      request.input('RFIDnumber', sql.VarChar(50), RFIDnumber);
      request.input('branchid', sql.Int, branchid);
      request.input('BranchAccess', sql.VarChar(50), BranchAccess || '');


      const result = await request.execute('SP_AuditForAsset');

      const send = result.recordsets[0]; // assetRegister
      const send2 = result.recordsets[1]; // MaintenanceRegHistory
      const send3 = result.recordsets[2]; // MaintenanceDoneTable
      const send4 = result.recordsets[3]; // TransferLocationTable
      const send5 = result.recordsets[4]; // TransferLocationTable
      const send6 = result.recordsets[5]; // TransferLocationTable

      res.status(200).json({ send, send2, send3, send4, send5, send6 });

    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  });


  // user Having Asset
  server.post('/userAssetHavingInfo', async (req, res) => {
    try {
      const { user } = req.body;
      const query = db.q`  SELECT COUNT(*) as count FROM MappedAssets WHERE EmployeeId=${user.EmployeeId}`
      const response = await db.query(query)
      const count = response.recordset[0].count;
      res.status(200).json({ Count: count });


    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })



  // User Upload Data

  server.post('/UserUploadData', upload.single('file'), async (req, res) => {
    try {
      const file = req.file;
      const { createdby, branchid } = req.body; // Extract additional fields
      // const userdata = req.userdata;
      // const { CreatedBy } = req.userdata || {};
      // let userData = null;

      // if (req.body.userData) {

      //     userData = JSON.parse(req.body.userData);

      // } else {
      //     return res.status(400).json({ message: 'User data is missing' });
      // }



      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);
      const mode = 'I';
      const UserStatus = 'A';
      let uploadcount = 0;
      const unuploadedData = [];

      const DefaultPassword = db.q`Exec SP_GeneralSetting '','','','','','',${branchid},'getPw',''`
      console.log('DefaultPassword', DefaultPassword);

      const passwordResponse = await db.query(DefaultPassword)
      const DefaultPass = passwordResponse.recordset[0].DefaultPassword;
      // console.log('DefaultPass', DefaultPass);

      const temppassword = DefaultPass;

      const hashedPassword = await bcrypt.hash(temppassword, 10);  // Encrypt password

      for (const row of data) {
        const {
          Employeecode, Employeename, Email, DateofJoining, Userrole, Departmentname
        } = row;
        const escapeSql = (value) => value; // parameterized queries: no manual quote escaping
        const trimString = (value) => typeof value === 'string' ? value.trim() : value;

        const trimmedEmployeecode = escapeSql(trimString(Employeecode));
        const trimmedEmployeename = escapeSql(trimString(Employeename));
        const trimmedUserrole = escapeSql(trimString(Userrole));
        const trimmedEmail = escapeSql(trimString(Email));
        const trimmedDepartmentname = escapeSql(trimString(Departmentname));

        const convertExcelDateToJSDate = (excelSerialDate) => {
          // Excel's day 0 is 1899-12-30 (this also absorbs Excel's fictitious
          // 1900 leap day). Compute in UTC so toISOString() can't shift the day.
          const millisecondsPerDay = 24 * 60 * 60 * 1000;
          const excelEpochUTC = Date.UTC(1899, 11, 30);
          return new Date(excelEpochUTC + Math.round(excelSerialDate) * millisecondsPerDay);
        };


        const originaldateformate = (date) => {
          return convertExcelDateToJSDate(date).toISOString().split('T')[0];
        }


        let originalDateofJoining = DateofJoining && DateofJoining !== undefined ? originaldateformate(DateofJoining) : undefined;


        const query = db.q`exec sp_UploadUser ${trimmedEmployeecode},${trimmedEmployeename},${trimmedEmail},${trimmedUserrole},${trimmedDepartmentname},${branchid}`;

        // console.log('query', query);

        const response = await db.query(query);
        const [data] = response.recordset;
        let reason = null;
        if (data.Count !== 0) {
          reason = 'Employee Code or Email Already Registered'
        } else if (data.RoleCount === 0) {
          reason = 'Role Not In Master'
        }
        else if (data.DepartCount === 0) {
          reason = 'Department Not In Master'
        }


        if (data.Count === 0 && data.useroleid !== 0 && data.Departmentid !== 0) {


          const InsertQuery = db.q`exec sp_UserMainMaster '',${trimmedEmployeecode}, ${trimmedEmployeename}, ${trimmedEmail}, ${hashedPassword}, ${hashedPassword}, 
        ${originalDateofJoining}, ${UserStatus}, ${data.useroleid}, ${data.Departmentid},${createdby},'',${branchid},${mode},${branchid}`;

          const response = await db.query(InsertQuery);

          if (response.rowsAffected && response.rowsAffected[0] > 0) {
            uploadcount++;
            // const status = 'ur';
            // await sendPasswordEmail(trimmedEmailId, trimmedEmployeeName, status);
          }
        } else {
          unuploadedData.push({
            Employeecode: row.Employeecode,
            Employeename: row.Employeename,
            Userrole: row.Userrole,
            Email: row.Email,
            DateofJoining: row.DateofJoining,
            Departmentname: row.Departmentname,
            reason: reason
          });
        }
      }

      if (unuploadedData.length > 0) {
        const unuploadedWorkbook = xlsx.utils.book_new();
        const unuploadedWorksheet = xlsx.utils.json_to_sheet(unuploadedData);
        xlsx.utils.book_append_sheet(unuploadedWorkbook, unuploadedWorksheet, 'Unuploaded User Data');

        const unuploadedFilePath = path.join(__dirname, 'unuploaded_User_data.xlsx');
        xlsx.writeFile(unuploadedWorkbook, unuploadedFilePath);

        res.status(200).json({
          message: 'Data uploaded with some errors',
          uploadcount,
          unuploadedFilePath: `/download/unuploaded_User_data.xlsx`,
          temppassword
        });

      } else {
        res.status(200).json({ message: 'Data uploaded successfully', uploadcount, temppassword });
      }

    } catch (err) {
      logErrorToFile(err.message);
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  // Asset Register for import

  const uploadImageUsingPath = async (imagePath) => {
    console.log('====================================');
    console.log('imagePath', imagePath);
    console.log('====================================');
    try {
      if (!fs.existsSync(imagePath)) {
        console.error(`Image path does not exist: ${imagePath}`);
        return null;
      }

      const imageBuffer = fs.readFileSync(imagePath);

      const form = new FormData();
      form.append('image', imageBuffer, {
        filename: path.basename(imagePath),
        contentType: 'image/jpg',
      });

      const imageUploadResponse = await axios.post(`${API_URL}/api/upload`, form, {
        headers: {
          ...form.getHeaders(),
        },
      });

      return imageUploadResponse.data.file.path;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };
  server.post('/AssetUploadData', upload.single('file'), async (req, res) => {
    try {
      const file = req.file;

      const { CreatedBy, branchid } = req.body
      const mode = 'IM'

      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);
      // console.log('data',req.body);

      let uploadcount = 0;
      const unuploadedData = [];

      const convertExcelDateToJSDate = (excelSerialDate) => {
        if (isNaN(excelSerialDate)) {
          return null; // Return null if input is not a number
        }
        // Excel's day 0 is 1899-12-30 (this also absorbs Excel's fictitious
        // 1900 leap day). Compute in UTC so toISOString() can't shift the day.
        const millisecondsPerDay = 24 * 60 * 60 * 1000;
        const excelEpochUTC = Date.UTC(1899, 11, 30);
        return new Date(excelEpochUTC + Math.round(excelSerialDate) * millisecondsPerDay);
      };

      const originaldateformate = (date) => {
        const jsDate = convertExcelDateToJSDate(date);
        if (jsDate === null || isNaN(jsDate.getTime())) {
          return undefined; // Return undefined if date is invalid
        }
        return jsDate.toISOString().split('T')[0];
      };

      for (const row of data) {
        const DepreciationType = 'Straight Line';

        const {
          AssetID, AssetName, Brand, Model, Category, SubCategory, Department, PDate, PCost, WType, WPeriod, WEndDate, Description, InvoiceNumber, Image, RFIDnumber, VendorName, PhoneNumber, AssetType, AssetGroupName, DepreciationMode, DepreciationValue, MaintainbyName, PackageName,
          Building, Floor, Room
        } = row;

        let RFIDStatus = '';
        let Movement = '';
        let RFID = RFIDnumber
        if (RFIDnumber === 'N/A' || RFIDnumber === '' || RFIDnumber === '-' || RFIDnumber === undefined || RFIDnumber === null) {
          RFIDStatus = null;
          RFID = 'N/A';
          Movement = 'Reg WithOut RFID';
        } else {
          RFIDStatus = 'YES';
          Movement = 'Reg With RFID';
          RFID: RFIDnumber
        }
        const escapeSql = (value) => (typeof value === 'string' ? value : ''); // parameterized queries: no manual quote escaping
        const trimString = (value) => typeof value === 'string' ? value.trim() : value;

        const trimmedAssetName = escapeSql(trimString(AssetName));
        const trimmedBrand = escapeSql(trimString(Brand));
        const trimmedModel = escapeSql(trimString(Model));
        const trimmedCategory = escapeSql(trimString(Category));
        const trimmedSubCategory = escapeSql(trimString(SubCategory));
        const trimmedDepartment = escapeSql(trimString(Department));
        const trimmedWType = escapeSql(trimString(WType));
        const trimmedWPeriod = escapeSql(trimString(WPeriod));
        const trimmedDescription = escapeSql(trimString(Description));
        const trimmedInvoiceNumber = escapeSql(trimString(InvoiceNumber));
        const trimmedRFID = escapeSql(trimString(RFID));
        const trimmedVendorName = escapeSql(trimString(VendorName));
        const trimmedAssetType = escapeSql(trimString(AssetType));
        const trimmedAssetGroupName = escapeSql(trimString(AssetGroupName));
        const trimmedPackageName = escapeSql(trimString(PackageName));
        const trimmedMaintainbyName = escapeSql(trimString(MaintainbyName));
        const trimmedBuilding = escapeSql(trimString(Building));
        const trimmedFloor = escapeSql(trimString(Floor));
        const trimmedRoom = escapeSql(trimString(Room));

        let originalPurchaseDate = PDate ? originaldateformate(PDate) : '';
        let originalWEndDate = WEndDate ? originaldateformate(WEndDate) : '';

        let imagePath = null;

        // If PartImage is a valid file path, use it
        if (Image) {
          imagePath = await uploadImageUsingPath(Image); // Upload image and get the path
        }

        const query = db.q`exec Sp_AssetUpload ${AssetID},${trimmedCategory},${trimmedSubCategory},${trimmedDepartment},${trimmedAssetType},${trimmedRFID},${trimmedAssetGroupName},${trimmedPackageName},${trimmedMaintainbyName},${trimmedBuilding},${trimmedFloor},${trimmedRoom}`;

        const response = await db.query(query)

        const [data] = response.recordset;

        let reason = '';

        if (data.Count !== 0) {
          reason = 'Asset ID already exists';
        }
        else if (data.Category === '0' || data.SubCategory === '0') {
          reason = 'Category or SubCategory Master data not available';
        }
        else if (data.Department === '0') {
          reason = 'Department Master data not Available ';
        }
        else if (data.AssetType === '0') {
          reason = 'Asset Type Master data not Available ';
        }
        else if (data.GroupName === 0) {
          reason = 'Asset Group Master data not Available ';
        }
        else if (data.PackageName === 0) {
          reason = 'Package Master data not Available ';
        }
        else if (data.MaintainById === 0) {
          reason = 'Asset Maintained By Master data not Available ';
        }
        else if (data.Building === '0') {
          reason = 'Building data not available in Master';
        } else if (data.Floor === '0') {
          reason = 'Floor data not available in Master';
        } else if (data.Room === '0') {
          reason = 'Room data not available in Master';
        } else if (data.LocationCode === '0' || data.LocationCode === 0) {
          reason = 'Given Location Not Linked in Master';
        }
        else if (data.RFIDnumber !== '0' && data.RFIDnumber !== 'N/A') {
          reason = 'RFID already exists';
        }


        if (!reason) {
          const InsertassetRegisterQuery = db.q`EXEC AssetRegisterMaster '',${AssetID},${trimmedAssetName},${trimmedInvoiceNumber},${trimmedBrand},${trimmedModel},${trimmedCategory},${trimmedSubCategory},${trimmedDepartment},${trimmedVendorName},${PhoneNumber},${originalPurchaseDate},${PCost},'',${trimmedWType},${trimmedWPeriod},${originalWEndDate},${trimmedDescription},'','',${data.LocationCode},${imagePath},${CreatedBy},'','',${trimmedRFID},${RFIDStatus},'',${Movement},'','','','','','',${AssetType},${mode},'',${branchid},'',${trimmedAssetGroupName},${data.MaintainById},${trimmedPackageName},${DepreciationType},${DepreciationMode},${DepreciationValue}`;

          const response1 = await db.query(InsertassetRegisterQuery)
          if (response1.rowsAffected && response1.rowsAffected[0] > 0) {
            uploadcount++;
          }
        } else {
          unuploadedData.push({
            AssetID: row.AssetID, RFIDnumber: row.RFIDnumber, AssetName: row.AssetName, InvoiceNumber: row.InvoiceNumber, Brand: row.Brand, Model: row.Model, PCost: row.PCost, PDate: row.PDate, WType: row.WType, WPeriod: row.WPeriod, WEndDate: row.WEndDate, Category: row.Category, SubCategory: row.SubCategory, Department: row.Department, Description: row.Description, AssetType: row.AssetType, AssetGroupName: row.AssetGroupName, MaintainbyName: row.MaintainbyName, PackageName: row.PackageName, DepreciationType: row.DepreciationType, DepreciationMode: row.DepreciationMode,
            DepreciationValue: row.DepreciationValue, Building: row.Building, Floor: row.Floor, Room: row.Room, reason
          });
        }
      }
      if (unuploadedData.length > 0) {
        const unuploadedWorkbook = xlsx.utils.book_new();
        const unuploadedWorksheet = xlsx.utils.json_to_sheet(unuploadedData);
        xlsx.utils.book_append_sheet(unuploadedWorkbook, unuploadedWorksheet, 'Unuploaded Data');

        const unuploadedFilePath = path.join(__dirname, 'unuploaded_data.xlsx');
        xlsx.writeFile(unuploadedWorkbook, unuploadedFilePath);
        res.status(200).json({
          message: 'Data uploaded with some errors',
          uploadcount,
          unuploadedFilePath: `/unuploaded_data.xlsx`,
        });

      } else {
        res.status(200).json({ message: 'Data uploaded successfully', uploadcount });
      }

    } catch (err) {
      logErrorToFile(err.message);
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  server.post('/AssetUploadData_Tvp_Method', upload.single('file'), async (req, res) => {
    try {
      const { CreatedBy, branchid } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(sheet);

      const pool = await connect();
      const tvp = new sql.Table('dbo.AssetUpload_TVP');

      tvp.columns.add('AssetID', sql.VarChar(200));
      tvp.columns.add('AssetName', sql.VarChar(200));
      tvp.columns.add('InvoiceNumber', sql.VarChar(200));
      tvp.columns.add('Brand', sql.VarChar(200));
      tvp.columns.add('Model', sql.VarChar(200));
      tvp.columns.add('Category', sql.VarChar(200));
      tvp.columns.add('SubCategory', sql.VarChar(200));
      tvp.columns.add('Department', sql.VarChar(200));
      tvp.columns.add('PDate', sql.VarChar(200));
      tvp.columns.add('PCost', sql.VarChar(200));
      tvp.columns.add('WType', sql.VarChar(200));
      tvp.columns.add('WPeriod', sql.VarChar(200));
      tvp.columns.add('WEndDate', sql.VarChar(200));
      tvp.columns.add('Description', sql.VarChar(200));
      tvp.columns.add('Image', sql.NVarChar(200));
      tvp.columns.add('Movement', sql.VarChar(200));
      tvp.columns.add('RFIDnumber', sql.VarChar(200));
      tvp.columns.add('RFID', sql.VarChar(200));
      tvp.columns.add('VendorName', sql.VarChar(200));
      tvp.columns.add('PhoneNumber', sql.VarChar(200));
      tvp.columns.add('AssetType', sql.VarChar(200));
      tvp.columns.add('LocationRFID', sql.VarChar(100));
      tvp.columns.add('AssetGroupName', sql.VarChar(200));
      tvp.columns.add('PackageName', sql.VarChar(200));
      tvp.columns.add('MaintainById', sql.VarChar(200));
      tvp.columns.add('DepreciationType', sql.VarChar(200));
      tvp.columns.add('DepreciationMode', sql.VarChar(200));
      tvp.columns.add('DepreciationValue', sql.VarChar(200));

      // for (const row of data) {
      //   tvp.rows.add(
      //     row.AssetID,
      //     row.AssetName,
      //     row.Brand,
      //     row.Model,
      //     row.Category,
      //     row.SubCategory,
      //     row.Department,
      //     row.AssetType,
      //     row.RFIDnumber || 'N/A',
      //     row.AssetGroupName,
      //     row.PackageName,
      //     row.MaintainbyName,
      //     row.Building,
      //     row.Floor,
      //     row.Room,
      //     row.InvoiceNumber,
      //     row.VendorName,
      //     row.PhoneNumber,
      //     row.PDate ,
      //     row.PCost || 0,
      //     row.WType,
      //     row.WPeriod,
      //     row.WEndDate ,
      //     row.Description,
      //     row.DepreciationType,
      //     row.DepreciationMode,
      //     row.DepreciationValue || 0
      //   );
      // }
      for (const row of data) {
        tvp.rows.add(
          String(row.AssetID || ''),
          String(row.AssetName || ''),
          String(row.InvoiceNumber || ''),
          String(row.Brand || ''),
          String(row.Model || ''),
          String(row.Category || ''),
          String(row.SubCategory || ''),
          String(row.Department || ''),
          String(row.PDate || ''),
          String(row.PCost || '0'),
          String(row.WType || ''),
          String(row.WPeriod || ''),
          String(row.WEndDate || ''),
          String(row.Description || ''),
          '',
          '',
          String(row.RFIDnumber || 'N/A'),
          '',
          String(row.VendorName || ''),
          String(row.PhoneNumber || ''),
          String(row.AssetType || ''),
          '',
          String(row.AssetGroupName || ''),
          String(row.PackageName || ''),
          '',
          String(row.DepreciationType || ''),
          String(row.DepreciationMode || ''),
          String(row.DepreciationValue || '0')
        );
      }

      const result = await pool.request()
        .input('CreatedBy', sql.VarChar(50), CreatedBy)
        .input('BranchId', sql.VarChar(50), branchid)
        .input('Assets', sql.TVP('dbo.AssetUpload_TVP'), tvp)
        .execute('Sp_AssetUpload_Check_Bulk');

      res.json({
        successCount: data.length - result.recordset.length,
        failedCount: result.recordset.length,
        failedRows: result.recordset
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Upload failed' });
    }
  });

  server.get('/unuploaded_data.xlsx', (req, res) => {
    const filePath = path.join(__dirname, 'unuploaded_data.xlsx');
    res.download(filePath, 'unuploaded_data.xlsx', (err) => {
      if (err) {
        console.error('File download error:', err);
        res.status(500).send('Error downloading file.');
      }
    });
  });

  server.post('/CategoryUploadData', upload.single('file'), async (req, res) => {
    try {
      const file = req.file;
      const { Createdby, branchid } = req.body;
      const mode = 'I';
      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      let uploadcount = 0;
      const unuploadedData = [];

      for (const row of data) {
        const { Category, SubCategory } = row;
        const escapeSql = (value) => value; // parameterized queries: no manual quote escaping
        const trimString = (value) => typeof value === 'string' ? value.trim() : value;
        const trimmedCategory = escapeSql(trimString(Category));
        const trimmedSubCategory = escapeSql(trimString(SubCategory));

        if (trimmedCategory && trimmedSubCategory) {
          const InsertassetRegisterQuery = db.q`EXEC CategoryMasterInfo ${trimmedCategory},${trimmedSubCategory},'',${mode},${Createdby},'',${branchid},''`;
          const response1 = await db.query(InsertassetRegisterQuery)
          if (response1.rowsAffected && response1.rowsAffected[0] > 0) {
            uploadcount++;
          }
        } else {
          unuploadedData.push({
            Category: row.Category, SubCategory: row.SubCategory
          });
        }
      }



      if (unuploadedData.length > 0) {
        const unuploadedWorkbook = xlsx.utils.book_new();
        const unuploadedWorksheet = xlsx.utils.json_to_sheet(unuploadedData);
        xlsx.utils.book_append_sheet(unuploadedWorkbook, unuploadedWorksheet, 'Unuploaded User Data');

        const unuploadedFilePath = path.join(__dirname, 'unuploaded_Category_data.xlsx');
        xlsx.writeFile(unuploadedWorkbook, unuploadedFilePath);

        res.status(200).json({
          message: 'Data uploaded with some errors',
          uploadcount,
          unuploadedFilePath: `/download/unuploaded_Category_data.xlsx`,
        });

      } else {
        res.status(200).json({ message: 'Data uploaded successfully', uploadcount });
        // console.log(uploadcount)
      }

    } catch (err) {
      logErrorToFile(err.message);
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  // Department Uploaded
  server.post('/DepartmentUploadData', upload.single('file'), async (req, res) => {
    try {
      const file = req.file;
      const { Createdby, branchid } = req.body;
      const mode = 'I';
      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      let uploadcount = 0;
      const unuploadedData = [];

      for (const row of data) {
        const { Department } = row;
        const escapeSql = (value) => value; // parameterized queries: no manual quote escaping
        const trimString = (value) => typeof value === 'string' ? value.trim() : value;
        const trimmedDepartment = escapeSql(trimString(Department));

        if (trimmedDepartment) {
          const InsertassetRegisterQuery = db.q`EXEC DepartmentMasterInfo ${trimmedDepartment},'',${mode},${Createdby},'',${branchid},''`;
          const response1 = await db.query(InsertassetRegisterQuery)
          // console.log(InsertassetRegisterQuery)
          if (response1.rowsAffected && response1.rowsAffected[0] > 0) {
            uploadcount++;
          }
        } else {
          unuploadedData.push({
            Department: row.Department
          });
        }
      }



      if (unuploadedData.length > 0) {
        const unuploadedWorkbook = xlsx.utils.book_new();
        const unuploadedWorksheet = xlsx.utils.json_to_sheet(unuploadedData);
        xlsx.utils.book_append_sheet(unuploadedWorkbook, unuploadedWorksheet, 'Unuploaded User Data');

        const unuploadedFilePath = path.join(__dirname, 'UnuploadedDepartMent.xlsx');
        xlsx.writeFile(unuploadedWorkbook, unuploadedFilePath);

        res.status(200).json({
          message: 'Data uploaded with some errors',
          uploadcount,
          unuploadedFilePath: `/download/UnuploadedDepartMent.xlsx`,
        });

      } else {
        res.status(200).json({ message: 'Data uploaded successfully', uploadcount });
        // console.log(uploadcount)
      }

    } catch (err) {
      logErrorToFile(err.message);
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  server.get('/download/unuploaded_Category_data.xlsx', (req, res) => {
    const filePath = path.join(__dirname, 'unuploaded_Category_data.xlsx');
    res.download(filePath, 'unuploaded_Category_data.xlsx', (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).send('Error downloading file.');
      }
    });
  });
  // Endpoint to serve the unuploaded Department data
  server.get('/download/UnuploadedDepartMent.xlsx', (req, res) => {
    const filePath = path.join(__dirname, 'UnuploadedDepartMent.xlsx');
    res.download(filePath, 'UnuploadedDepartMent.xlsx', (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).send('Error downloading file.');
      }
    });
  });

  // Fetch Screen 
  server.post('/FetchScreenData', async (req, res) => {
    try {
      const Query = `SELECT * FROM ScreenMasterTable ORDER BY id`
      const response = await db.query(Query)
      const send = response.recordset
      res.status(200).json({ send })

    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })

  // Inventory Scan

  server.post('/InventoryReport', async (req, res) => {
    try {
      const { fromDate, LocationRFID, mode, branchid, Department, BranchAccess } = req.body;
      const Query = db.q`EXEC sp_InventoryReport ${fromDate},${LocationRFID},${mode},${Department},${branchid},${BranchAccess}`;
      console.log("🚀 ~ ", Query)
      const response = await db.query(Query);
      const send = response.recordset;
      res.status(200).json({ send });

    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })

  server.post('/InventoryReport_new', async (req, res) => {
    try {
      const { FromDate, ToDate, LocationRFID, mode, branchid, Department, BranchAccess } = req.body;
      console.log("🚀 ~ req.body:", req.body)
      const Query = db.q`EXEC [dbo].[sp_InventoryReport_testing] ${FromDate},${ToDate},${LocationRFID},${mode},${Department},${branchid},${BranchAccess}`;
      console.log("🚀 ~ Query:", Query)
      const response = await db.query(Query);
      const send = response.recordset;
      res.status(200).json({ send });

    } catch (err) {
      console.log(err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })



}
// ASSET TRACKING VIMAL END

/// Settings
{
  server.post('/emailconfigsettings', async (req, res) => {
    try {

      const { id, frommail, apppassword, ServiceName, HostName, PortNumber, createdby, updateby, branchid, mode, BranchAccess } = req.body

      const query = db.q`exec SP_EMAILCONFIG ${id},${frommail},${apppassword},${ServiceName},${HostName},${PortNumber},${createdby},${updateby},${branchid},${mode},${BranchAccess}`

      const response = await db.query(query)

      res.status(200).send(response.recordset)

    } catch (error) {

      logErrorToFile(error)
      console.log(error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })


  server.post('/othersetting', async (req, res) => {
    try {

      const { id, passwordexpireday, autologouttime, createdby, branchid, mode, LoginAttempCount, BranchAccess, DefaultPassword } = req.body

      const query = db.q`EXEC SP_GeneralSetting ${id},${passwordexpireday},${autologouttime},${LoginAttempCount},${DefaultPassword},${createdby},${branchid},${mode},${BranchAccess}`

      const response = await db.query(query)

      res.status(200).send(response.recordset)

    } catch (error) {

      logErrorToFile(error)
      console.log(error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  })
}

// Error to File
{
  function logErrorToFile(...errors) {
    const currentDate = new Date().toISOString();
    const details = errors
      .map((e) => (e instanceof Error ? (e.stack || e.message) : String(e)))
      .join(' ');
    const logMessage = `[${currentDate}] ${details}\n`;

    const logFolder = path.join(__dirname, 'log'); // Creates a log folder in the current directory


    // Check if the log folder exists, if not, create it
    if (!fs.existsSync(logFolder)) {
      fs.mkdirSync(logFolder);
    }

    const logFilePath = path.join(logFolder, 'error.txt');

    fs.appendFile(logFilePath, logMessage, (err) => {
      if (err) {
        console.error('Error writing to log file:', err);
      }
    });
  }
}

// Get Asset ID
server.post('/getAssetCode', async (req, res) => {
  try {

    const { Category, mode, branchid } = req.body

    const query = db.q`EXEC auto_generateCode '',${Category},'','','',${branchid},${mode}`

    const response = await db.query(query)

    res.status(200).send(response.recordset)

  } catch (error) {

    logErrorToFile(error)
    console.log(error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
})
{
  //Antenna Config
  // Antenna Configure
  server.post('/AntennaConfig', async (req, res) => {
    try {
      const { mode, ReaderIP, AntennaID, TransmitPower, ReceiveSensitivityIndex, TransmitFrequencyIndex } = req.body
      // console.log('AntennaConfig', req.body)
      const DetailsQuery = db.q`EXEC [SP_AntennaConfig] @ReaderIP=${ReaderIP},@AntennaID =${AntennaID},@TransmitPowerIndex =${TransmitPower},@mode =${mode}`
      // console.log('AntennaConfig', DetailsQuery)
      const response = await db.query(DetailsQuery)
      res.status(200).send(response.recordset);
    } catch (err) {
      console.log('Error on Tool Register', err)
      logErrorToFile('Error on Tool Register', err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }

  })
  // Antenna Power Level Upload
  server.post('/AntennaPowerLevelUpload', upload.single('file'), async (req, res) => {

    try {
      const file = req.file;

      const { CreatedBy, systemip, branchid } = req.body; // Extract additional fields

      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      let uploadcount = 0

      const unuploadedData = [];

      const id = ''

      const mode = 'I'



      for (const row of data) {
        const { ReaderIP, AntennaID, TransmitPower } = row;

        // console.log(row)
        const trimString = (value) => {
          return typeof value === 'string' ? value.trim() : value;
        };

        // Corrected variable names
        const trimmedReaderIP = trimString(ReaderIP);
        const trimmedAntennaID = trimString(AntennaID);
        const trimmedTransmitPower = trimString(TransmitPower);




        const convertExcelDateToJSDate = (excelSerialDate) => {
          // Excel's day 0 is 1899-12-30 (this also absorbs Excel's fictitious
          // 1900 leap day). Compute in UTC so toISOString() can't shift the day.
          const millisecondsPerDay = 24 * 60 * 60 * 1000;
          const excelEpochUTC = Date.UTC(1899, 11, 30);
          return new Date(excelEpochUTC + Math.round(excelSerialDate) * millisecondsPerDay);
        };

        const query = db.q`EXEC [SP_AntennaConfig] @ReaderIP=${ReaderIP}, @AntennaID =${AntennaID},@TransmitPowerIndex ='',@mode ='Check'
      `
        // console.log('====================================');
        // console.log(query);
        // console.log('====================================');
        const response = await db.query(query)

        const [data] = response.recordset;

        let Reason = null
        if (data.Count !== 0) {
          Reason = 'ReaderIp and Antenna ID  Already Exists'
        }
        // console.log('====================================');
        // console.log(data);
        // console.log('====================================');
        if (data.Count === 0) {
          const InsertQuery = db.q`EXEC [SP_AntennaConfig] @ReaderIP=${trimmedReaderIP}, @AntennaID =${trimmedAntennaID},@TransmitPowerIndex =${trimmedTransmitPower},@mode =${mode}`;
          const response = await db.query(InsertQuery)
          if (response.rowsAffected[0] !== 0) {
            uploadcount++
          }
        } else {
          unuploadedData.push({
            ReaderIP: row.ReaderIP, AntennaID: row.AntennaID, TransmitPowerIndex: row.TransmitPowerIndex,
            Reason: Reason

          });

        }

      }

      if (unuploadedData.length > 0) {

        const unuploadedWorkbook = xlsx.utils.book_new();
        const unuploadedWorksheet = xlsx.utils.json_to_sheet(unuploadedData);
        // console.log('====================================');
        // console.log('unuploadedData', unuploadedData);
        // console.log('====================================');
        xlsx.utils.book_append_sheet(unuploadedWorkbook, unuploadedWorksheet, 'Unuploaded Plant Data');

        const unuploadedFilePath = path.join(__dirname, 'unuploaded_Antenna_data.xlsx');
        xlsx.writeFile(unuploadedWorkbook, unuploadedFilePath);
        // console.log('====================================');
        // console.log('__dirname', unuploadedFilePath);
        // console.log('====================================');
        res.status(200).json({
          message: 'Data uploaded with some errors',
          uploadcount,
          unuploadedFilePath: `/download/unuploaded_Antenna_data.xlsx`,
        });

      } else {
        res.status(200).json({ message: 'Data uploaded successfully', uploadcount });
      }

    } catch (err) {
      logErrorToFile(err)
      console.log(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  // Device Master

  server.post('/DeviceRegisterInfo', async (req, res) => {
    try {
      // Defaults matter: the Device Master screens' grid fetch (mode
      // 'FetchDevice') sends only a subset of these fields — the missing ones
      // were undefined, which db.q renders as the string 'undefined' and the
      // SP's int parameters then fail ("Error converting nvarchar to int").
      const { mode, SequenceNo = '', BranchID = '', DeviceID = '', DeviceName = '', Floor = '', IPaddress = '', MACaddress = '',
        DeviceType = '', ReaderType = '', AllowDoorLock = '', LockDoor = '', Alarm = '', ManufactureName = '', LastSeqNumber = '', Active = ''
        , AntennaID = '', RoomType = '' } = req.body
      // console.log('ToolRegisterInfo', req.body)
      const DetailsQuery = db.q`EXEC SP_DC_DeviceMaster @SequenceNo=${SequenceNo},@BranchID=${BranchID},@DeviceID=${DeviceID},@DeviceName=${DeviceName},@Floor=${Floor},@IPaddress=${IPaddress},@MACaddress=${MACaddress},@DeviceType=${DeviceType},@ReaderType=${ReaderType},@AllowDoorLock=${AllowDoorLock},@LockDoor=${LockDoor},@Alarm=${Alarm},@ManufactureName=${ManufactureName},@LastSeqNumber=${LastSeqNumber},@Active=${Active},@AntennaID=${AntennaID},@RoomType=${RoomType},@mode=${mode}`
      // console.log('ToolRegisterInfo', DetailsQuery)
      const response = await db.query(DetailsQuery)
      res.status(200).send(response.recordset);
    } catch (err) {
      console.log('Error on Tool Register', err)
      logErrorToFile('Error on Tool Register', err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }

  })
  // Antenna Power Level Upload
  server.post('/DeveiceMasterUpload', upload.single('file'), async (req, res) => {

    try {
      const file = req.file;

      const { CreatedBy, systemip, branchid } = req.body; // Extract additional fields

      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      let uploadcount = 0

      const unuploadedData = [];

      const id = ''

      const mode = 'I'



      for (const row of data) {
        const { SequenceNo, BranchID, DeviceID, DeviceName, Floor, IPaddress, MACaddress, MachineID, DeviceType, ReaderType, AllowDoorLock, LockDoor, Alarm, ManufactureName, LastSeqNumber, Active, AntennaID, RoomType
        } = row;

        // console.log(row)
        const trimString = (value) => {
          return typeof value === 'string' ? value.trim() : value;
        };

        // Corrected variable names
        const trimmedSequenceNo = trimString(SequenceNo);
        const trimmedBranchID = trimString(BranchID);
        const trimmedDeviceID = trimString(DeviceID);
        const trimmedDeviceName = trimString(DeviceName);
        const trimmedFloor = trimString(Floor);
        const trimmedIPaddress = trimString(IPaddress);
        const trimmedMACaddress = trimString(MACaddress);
        // const trimmedMachineID = trimString(MachineID);
        const trimmedDeviceType = trimString(DeviceType);
        const trimmedReaderType = trimString(ReaderType);
        const trimmedAllowDoorLock = trimString(AllowDoorLock);
        const trimmedLockDoor = trimString(LockDoor);
        const trimmedAlarm = trimString(Alarm);
        const trimmedManufactureName = trimString(ManufactureName);
        const trimmedLastSeqNumber = trimString(LastSeqNumber);
        const trimmedActive = trimString(Active);
        const trimmedAntennaID = trimString(AntennaID);
        const trimmedRoomType = trimString(RoomType);





        const convertExcelDateToJSDate = (excelSerialDate) => {
          // Excel's day 0 is 1899-12-30 (this also absorbs Excel's fictitious
          // 1900 leap day). Compute in UTC so toISOString() can't shift the day.
          const millisecondsPerDay = 24 * 60 * 60 * 1000;
          const excelEpochUTC = Date.UTC(1899, 11, 30);
          return new Date(excelEpochUTC + Math.round(excelSerialDate) * millisecondsPerDay);
        };

        const query = db.q`EXEC SP_DC_DeviceMaster   @SequenceNo=${trimmedSequenceNo},  @BranchID=${trimmedBranchID},  @DeviceID=${trimmedDeviceID},  @DeviceName=${trimmedDeviceName},  @Floor=${trimmedFloor},
  @IPaddress=${trimmedIPaddress},  @MACaddress=${trimmedMACaddress},
  @DeviceType=${trimmedDeviceType},  @ReaderType=${trimmedReaderType},  @AllowDoorLock=${trimmedAllowDoorLock},  @LockDoor=${trimmedLockDoor},  @Alarm=${trimmedAlarm},  @ManufactureName=${trimmedManufactureName},  @LastSeqNumber=${trimmedLastSeqNumber},  @Active=${trimmedActive},
  @AntennaID=${trimmedAntennaID},  @RoomType=${trimmedRoomType},  @mode='Check'
      `
        // console.log('====================================');
        // console.log(query);
        // console.log('====================================');
        const response = await db.query(query)

        const [data] = response.recordset
        let Reason = null;
        if (data.Count !== 0) {
          Reason = 'Device ID ,Antenna ID,IP Address and Machine ID Already Exists'
        } else {
          Reason = 'Machine Not Exists in Master'
        }
        // console.log('====================================');
        // console.log(data);
        // console.log('====================================');
        if (data.Count === 0) {
          const InsertQuery = db.q`EXEC SP_DC_DeviceMaster   @SequenceNo=${trimmedSequenceNo},  @BranchID=${trimmedBranchID}  @DeviceID=${trimmedDeviceID},  @DeviceName=${trimmedDeviceName},  @Floor=${trimmedFloor},  @IPaddress=${trimmedIPaddress},  @MACaddress=${trimmedMACaddress},  @DeviceType=${trimmedDeviceType},  @ReaderType=${trimmedReaderType},
        @AllowDoorLock=${trimmedAllowDoorLock},  @LockDoor=${trimmedLockDoor},  @Alarm=${trimmedAlarm},  @ManufactureName=${trimmedManufactureName},  @LastSeqNumber=${trimmedLastSeqNumber},  @Active=${trimmedActive},  @AntennaID=${trimmedAntennaID},  @RoomType=${trimmedRoomType},  @mode=${mode}`;
          const response = await db.query(InsertQuery)
          if (response.rowsAffected[0] !== 0) {
            uploadcount++
          }
        } else {
          unuploadedData.push({
            SequenceNo: row.SequenceNo, BranchID: row.BranchID, DeviceID: row.DeviceID, DeviceName: row.DeviceName, Floor: row.Floor, IPaddress: row.IPaddress, MACaddress: row.MACaddress, MachineID: row.MachineID, DeviceType: row.DeviceType, ReaderType: row.ReaderType, AllowDoorLock: row.AllowDoorLock, LockDoor: row.LockDoor, Alarm: row.Alarm, ManufactureName: row.ManufactureName, LastSeqNumber: row.LastSeqNumber, Active: row.Active, AntennaID: row.AntennaID, RoomType: row.RoomType, Reason: Reason
          });

        }

      }

      if (unuploadedData.length > 0) {

        const unuploadedWorkbook = xlsx.utils.book_new();
        const unuploadedWorksheet = xlsx.utils.json_to_sheet(unuploadedData);
        // console.log('====================================');
        // console.log('unuploadedData', unuploadedData);
        // console.log('====================================');
        xlsx.utils.book_append_sheet(unuploadedWorkbook, unuploadedWorksheet, 'Unuploaded Device Data');

        const unuploadedFilePath = path.join(__dirname, 'unuploaded_Device_data.xlsx');
        xlsx.writeFile(unuploadedWorkbook, unuploadedFilePath);
        // console.log('====================================');
        // console.log('__dirname', unuploadedFilePath);
        // console.log('====================================');
        res.status(200).json({
          message: 'Data uploaded with some errors',
          uploadcount,
          unuploadedFilePath: `/download/unuploaded_Device_data.xlsx`,
        });

      } else {
        res.status(200).json({ message: 'Data uploaded successfully', uploadcount });
      }

    } catch (err) {
      logErrorToFile(err)
      console.log(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
}

server.post('/BuildingMaster', async (req, res) => {
  const { Building, BuildingId, mode, branchid, BranchAccess, Createdby, Updatedby } = req.body; // Get branch name from the request body

  try {
    const query = db.q`EXEC [Master].[SP_BuildingMaster] ${BuildingId},${Building},${mode},${Createdby},${Updatedby},${branchid},${BranchAccess}`;
    const response = await db.query(query)
    res.status(200).json(response.recordset);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'An error occurred' });
  }
});

server.post('/FloorMaster', async (req, res) => {
  const { Floor, FloorId, mode, branchid, BranchAccess, Createdby, Updatedby } = req.body; // Get branch name from the request body
  try {
    const query = db.q`EXEC [Master].[SP_FloorMaster] ${FloorId},${Floor},${mode},${Createdby},${Updatedby},${branchid},${BranchAccess}`;
    const response = await db.query(query)
    res.status(200).json(response.recordset);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'An error occurred' });
  }
});

server.post('/RoomMaster', async (req, res) => {
  const { Room, RoomId, mode, branchid, BranchAccess, Createdby, Updatedby } = req.body; // Get branch name from the request body
  try {
    const query = db.q`EXEC [Master].[SP_RoomMaster] ${RoomId},${Room},${mode},${Createdby},${Updatedby},${branchid},${BranchAccess}`;
    const response = await db.query(query)
    res.status(200).json(response.recordset);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'An error occurred' });
  }
});

server.post('/AssetTypeMaster', async (req, res) => {
  const { AssetType, AssetTypeId, mode, branchid, BranchAccess, Createdby, Updatedby } = req.body; // Get branch name from the request body
  try {
    const query = db.q`EXEC [Master].[SP_AssetTypeMaster] ${AssetTypeId},${AssetType},${mode},${Createdby},${Updatedby},${branchid},${BranchAccess}`;
    const response = await db.query(query)
    res.status(200).json(response.recordset);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// AutoID generator
server.post('/IDgeneratorConfig', async (req, res) => {
  try {
    const { mode, CategoryName, Prefix, Suffix, Createdby, branchid, id } = req.body
    const DetailsQuery = db.q`EXEC auto_generateCode ${id},${CategoryName},${Prefix},${Suffix},${Createdby},${branchid},${mode}`
    console.log('DetailsQuery', DetailsQuery);

    const response = await db.query(DetailsQuery)
    res.status(200).send(response.recordset);
  } catch (err) {
    console.log('Error on Auto ID Generator', err)
    logErrorToFile('Error on Auto ID Generator', err)
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

})

server.post('/DepreciationConfig', async (req, res) => {
  try {
    const { mode, Depreciation, salvageValue, useLife, Createdby, branchid, DepreciationId, Updatedby, BranchAccess } = req.body
    const DetailsQuery = db.q`EXEC [Master].[SP_DepreciationMaster] ${DepreciationId},${Depreciation},${salvageValue},${useLife},${mode},${Createdby},${Updatedby},${branchid},${BranchAccess}`

    const response = await db.query(DetailsQuery)
    res.status(200).send(response.recordset);
  } catch (err) {
    console.log('Error on Depreciation Config', err)
    logErrorToFile('Error on Depreciation Config', err)
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

})

// Excel import for the Depreciation master (was missing — the Configure >
// Asset Depreciation screen always got a 404 on upload). Follows the same
// pattern as the other *UploadData routes: parse the sheet, skip duplicates
// and bad rows, insert the rest via SP_DepreciationMaster mode 'I', and hand
// back an error workbook for the skipped rows.
server.post('/DepreciationUploadData', upload.single('file'), async (req, res) => {
  /* #swagger.tags = ['Masters']
     #swagger.summary = 'Depreciation master — Excel import'
     #swagger.description = 'multipart/form-data: file (xlsx/csv with columns Depreciation, Use Life, Salvage Value), branchid, Createdby. Skipped rows come back as a downloadable error workbook.' */
  try {
    const file = req.file;
    const { Createdby, branchid } = req.body;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const rows = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

    // existing names for the duplicate check (mode 'S' lists the branch)
    const existingResponse = await db.query(
      db.q`EXEC [Master].[SP_DepreciationMaster] '','','','','S','','',${branchid},${branchid}`
    );
    const existingNames = new Set(
      (existingResponse.recordset || []).map((r) => String(r.Depreciation || '').trim().toLowerCase())
    );

    let uploadcount = 0;
    const unuploadedData = [];

    for (const row of rows) {
      const Depreciation = String(row.Depreciation ?? '').trim();
      const useLife = String(row['Use Life'] ?? row.useLife ?? '').trim();
      const salvageValue = String(row['Salvage Value'] ?? row.salvageValue ?? '').trim();

      let Reason = '';
      if (!Depreciation) {
        Reason = 'Depreciation name is required';
      } else if (!useLife || isNaN(Number(useLife))) {
        Reason = 'Use Life must be a number';
      } else if (!salvageValue || isNaN(Number(salvageValue))) {
        Reason = 'Salvage Value must be a number';
      } else if (existingNames.has(Depreciation.toLowerCase())) {
        Reason = 'Depreciation already exists';
      }

      if (!Reason) {
        try {
          const insertQuery = db.q`EXEC [Master].[SP_DepreciationMaster] '',${Depreciation},${salvageValue},${useLife},'I',${Createdby},'',${branchid},''`;
          const response = await db.query(insertQuery);
          if (response.rowsAffected && response.rowsAffected[0] > 0) {
            uploadcount++;
            existingNames.add(Depreciation.toLowerCase()); // catch duplicates inside the same file
          } else {
            Reason = 'Insert failed';
          }
        } catch (err) {
          Reason = 'Insert failed';
          logErrorToFile('DepreciationUploadData row failed:', err);
        }
      }

      if (Reason) {
        unuploadedData.push({
          Depreciation: row.Depreciation, 'Use Life': row['Use Life'], 'Salvage Value': row['Salvage Value'], Reason,
        });
      }
    }

    if (unuploadedData.length > 0) {
      const unuploadedWorkbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(unuploadedWorkbook, xlsx.utils.json_to_sheet(unuploadedData), 'Unuploaded Depreciation');
      xlsx.writeFile(unuploadedWorkbook, path.join(__dirname, 'UnuploadedDepreciation.xlsx'));

      res.status(200).json({
        message: 'Data uploaded with some errors',
        uploadcount,
        unuploadedFilePath: `/download/UnuploadedDepreciation.xlsx`,
      });
    } else {
      res.status(200).json({ message: 'Data uploaded successfully', uploadcount });
    }
  } catch (err) {
    console.error(err);
    logErrorToFile(err);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
});

server.post('/PackageConfig', async (req, res) => {
  try {
    const { mode, PackageId, PackageName, Category, SubCategory, Createdby, branchid, BranchAccess, Updatedby } = req.body
    const DetailsQuery = db.q`EXEC [Master].[SP_AssetPackageMaster] ${PackageId},${PackageName},${Category},${SubCategory},${mode},${Createdby},${Updatedby},${branchid},${BranchAccess}`

    const response = await db.query(DetailsQuery)
    res.status(200).send(response.recordset);
  } catch (err) {
    console.log('Error on Auto ID Generator', err)
    logErrorToFile('Error on Auto ID Generator', err)
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

})

server.post('/AssetGroupConfig', async (req, res) => {
  try {
    const { mode, GroupId, GroupName, Createdby, branchid, BranchAccess, Updatedby } = req.body
    const DetailsQuery = db.q`EXEC [Master].[SP_AssetGroupMaster] ${GroupId},${GroupName},${mode},${Createdby},${Updatedby},${branchid},${BranchAccess}`
    const response = await db.query(DetailsQuery)
    res.status(200).send(response.recordset);
  } catch (err) {
    console.log('Error on Auto ID Generator', err)
    logErrorToFile('Error on Auto ID Generator', err)
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

})

server.post('/MaintainedConfig', async (req, res) => {
  try {
    const { mode, MaintainId, Maintained, Createdby, branchid, BranchAccess, Updatedby } = req.body
    const DetailsQuery = db.q`EXEC [Master].[SP_MaintainedMaster] ${MaintainId},${Maintained},${mode},${Createdby},${Updatedby},${branchid},${BranchAccess}`

    const response = await db.query(DetailsQuery)
    res.status(200).send(response.recordset);
  } catch (err) {
    console.log('Error on Auto ID Generator', err)
    logErrorToFile('Error on Auto ID Generator', err)
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

})

server.post('/BUnitCategoryConfig', async (req, res) => {
  try {
    const { mode, BUCategoryId, BUCategoryName, BUCategoryCode, Createdby, branchid, Updatedby, BranchAccess } = req.body
    const DetailsQuery = db.q`EXEC [Master].[SP_BUnitCategoryMaster] ${BUCategoryId},${BUCategoryCode},${BUCategoryName},${mode},${Createdby},${Updatedby},${branchid},${BranchAccess}`

    const response = await db.query(DetailsQuery)
    res.status(200).send(response.recordset);
  } catch (err) {
    console.log('Error on BUnit CategoryConfig', err)
    logErrorToFile('Error on BUnit CategoryConfig', err)
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

})

server.post('/BUnitConfig', async (req, res) => {
  try {
    const { mode, BUCategoryId, BUnitCode, BUnitName, GSTIN, PAN, CIN, Address1, Address2,
      Address3, PinCode, Email, Contact, Status, BUnitId, Createdby, branchid, BranchAccess, Updatedby } = req.body
    const DetailsQuery = db.q`EXEC [Master].[SP_BUnitMaster]   ${BUnitId},${BUCategoryId},${BUnitCode},${BUnitName},${GSTIN},${PAN},${CIN},${Address1},${Address2},${Address3},${PinCode},${Email},${Contact},${Status},${mode},${Createdby},${Updatedby},${branchid},${BranchAccess}`

    const response = await db.query(DetailsQuery)
    res.status(200).send(response.recordset);
  } catch (err) {
    console.log('Error on Auto ID Generator', err)
    logErrorToFile('Error on Auto ID Generator', err)
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

})

{

  // Geo Fence
  server.post('/RFIDJiofriends', async (req, res) => {
    try {
      const { device_imei, latitude, longitude, timestamp, device_battery_percentage } = req.body
      const query = db.q`exec SP_RFIDGeoFenceDevice '',${device_imei},${latitude},${longitude},${timestamp},${device_battery_percentage},'I'`
      const response = await db.query(query)
      const send = response.recordset
      res.status(200).json({ message: 'Details are saved in database', send });
    } catch (err) {
      console.error('Error in RFIDJiofriends:', err);
      logErrorToFile(err)
      res.status(500).json({ error: 'Internal Server Error' });
    }
  })

  server.get('/GETRFIDJiofriends', async (req, res) => {
    try {
      const query = `exec SP_RFIDGeoFenceDevice '','','','','','','S'`
      const response = await db.query(query)
      const send = response.recordset
      res.status(200).json({ message: 'Below is the details ', send });
    } catch (err) {
      console.error('Error in GETRFIDJiofriends:', err);
      logErrorToFile(err)
      res.status(500).json({ error: 'Internal Server Error' });
    }
  })


}
{
  // Employee Config
  server.post('/EmployeeConfig', async (req, res) => {
  try {
    const {
      mode = '',
      Id = '',
      Empid = '',
      FirstName = '',
      LastName = '',
      DOJ = '',
      DOB = '',
      Department = '',
      email = '',
      Contact = '',
      Status = '',
      Gender = '',
      Photo = '',
      RFID = '',
      CreatedBy = '',
      branchid = 0,
      BranchAccess = ''
    } = req.body;

    const pool = await connect();

    const result = await pool.request()
      .input('mode', sql.VarChar(50), mode)
      .input('Id', sql.Int, Id ? parseInt(Id, 10) : null)
      .input('Empid', sql.VarChar(50), Empid || null)
      .input('FirstName', sql.VarChar(100), FirstName || null)
      .input('LastName', sql.VarChar(100), LastName || null)
      .input('DOJ', sql.VarChar(20), DOJ || null)
      .input('DOB', sql.VarChar(20), DOB || null)
      .input('Department', sql.VarChar(100), Department || null)
      .input('Email', sql.VarChar(150), email || null)
      .input('Contact', sql.VarChar(20), Contact || null)
      .input('Status', sql.VarChar(20), Status || null)
      .input('Gender', sql.VarChar(20), Gender || null)
      .input('Photo', sql.VarChar(500), Photo || null)
      .input('RFID', sql.VarChar(100), RFID || null)
      .input('CreatedBy', sql.VarChar(100), CreatedBy || null)
      .input('BranchId', sql.Int, branchid || 1)
      .input('BranchAccess', sql.VarChar(200), BranchAccess || null)
      .execute('[dbo].[SP_EmployeeMaster]');

    res.status(200).json(result.recordset || []);

  } catch (error) {
    console.error('EmployeeConfig Error:', error);
    logErrorToFile(error);
    res.status(500).json({ status: 'ERROR', message: error.message });
  }
});
  // Employee Upload Data
  server.post('/EmployeeUploadData', upload.single('file'), async (req, res) => {

    try {
      const file = req.file;

      const { CreatedBy, systemip, branchid } = req.body; // Extract additional fields

      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      let uploadcount = 0

      const unuploadedData = [];

      const id = ''

      const mode = 'I'



      for (const row of data) {
        const { Photo, EmployeeRFID, EmployeeCode, FirstName, LastName, Department, email, Contact, DOJ, DOB, Gender } = row;

        // console.log(row)
        const trimString = (value) => {
          return typeof value === 'string' ? value.trim() : value;
        };
        const escapeSql = (value) => value; // parameterized queries: no manual quote escaping


        // Corrected variable names
        const trimmedPhoto = escapeSql(trimString(Photo));
        const trimmedEmployeeRFID = escapeSql(trimString(EmployeeRFID));
        const trimmedEmployeeCode = escapeSql(trimString(EmployeeCode));
        const trimmedFirstName = escapeSql(trimString(FirstName));
        const trimmedLastName = escapeSql(trimString(LastName));
        const trimmedDepartment = escapeSql(trimString(Department));
        const trimmedemail = escapeSql(trimString(email));
        const trimmedContact = escapeSql(trimString(Contact));
        const trimmedDOJ = escapeSql(trimString(DOJ));
        const trimmedDOB = escapeSql(trimString(DOB));
        const trimmedGender = escapeSql(trimString(Gender));


        const query = db.q`EXEC [SP_EmployeeMaster]  @Id ='', @Empid =${trimmedEmployeeCode},@FirstName ='',@LastName ='',@DOJ ='',@DOB ='',@Department =${trimmedDepartment},@Email ='',@Contact ='',@Status ='',@Gender =''
	  ,@Photo ='',@CreatedBy ='',@mode ='Check',@RFID=${trimmedEmployeeRFID}`;

        console.log("🚀 ~ query:", query);

        // console.log('====================================');
        // console.log(query);
        // console.log('====================================');
        const response = await db.query(query);

        const data = response.recordset;
        console.log("🚀 ~ data:", data[0])
        let Reason = null
        // { PlantCode: 0, Area: 0, WorkCenterCode: 0, Count: 0 }
        if (data[0].Count !== 0 || data[0].Count !== '0') {
          Reason = 'Employee ID and RFID Already Exists'
        }
        else if (data[0].departmentCount === 0) {
          Reason = 'Department not Exists in Master'
        }

        if (data[0].Count === 0 && data[0].departmentCount !== 0) {
          const InsertQuery = db.q`EXEC [SP_EmployeeMaster]  @Id ='',@Empid =${trimmedEmployeeCode},@FirstName =${trimmedFirstName},@LastName =${trimmedLastName},@DOJ =${trimmedDOJ},@DOB =${trimmedDOB},@Department =${trimmedDepartment},@Email =${trimmedemail},@Contact =${trimmedContact},@Status ='',@Gender =${trimmedGender},@Photo =${trimmedPhoto},@CreatedBy =${CreatedBy},@mode =${mode},@RFID=${trimmedEmployeeRFID}`;
          console.log("🚀 ~ InsertQuery:", InsertQuery)
          console.log("🚀 ~ InsertQuery:", InsertQuery)
          console.log("🚀 ~ InsertQuery:", InsertQuery)
          console.log("🚀 ~ InsertQuery:", InsertQuery)
          console.log("🚀 ~ InsertQuery:", InsertQuery)
          console.log("🚀 ~ InsertQuery:", InsertQuery)
          console.log("🚀 ~ InsertQuery:", InsertQuery)
          console.log("🚀 ~ InsertQuery:", InsertQuery)
          const response = await db.query(InsertQuery)
          if (response.rowsAffected[0] !== 0) {
            uploadcount++
          }
        } else {
          unuploadedData.push({
            Photo: row.Photo, EmployeeRFID: row.EmployeeRFID, EmployeeCode: row.EmployeeCode, FirstName: row.FirstName, LastName: row.LastName, Department: row.Department, email: row.email, Contact: row.Contact, DOJ: row.DOJ, DOB: row.DOB, Reason
          });
        }
      }
      if (unuploadedData.length > 0) {
        const unuploadedWorkbook = xlsx.utils.book_new();
        const unuploadedWorksheet = xlsx.utils.json_to_sheet(unuploadedData);
        xlsx.utils.book_append_sheet(unuploadedWorkbook, unuploadedWorksheet, 'Unuploaded Employee Data');
        const unuploadedFilePath = path.join(__dirname, 'unuploaded_Employee_data.xlsx');
        xlsx.writeFile(unuploadedWorkbook, unuploadedFilePath);
        res.status(200).json({
          message: 'Data uploaded with some errors',
          uploadcount,
          unuploadedFilePath: `/download/unuploaded_Employee_data.xlsx`,
        });
      } else {
        res.status(200).json({ message: 'Data uploaded successfully', uploadcount });
      }
    } catch (err) {
      logErrorToFile(err)
      console.log(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

}

{

  // Allocate / Release
  server.post('/AllocateAssets', async (req, res) => {
    try {
      const { mode, EmployeeId, RFIDnumber, AssetID, AssetName, EmployeeRFID, LinkID, AssetType, Createdby, branchid } = req.body;
      const DetailsQuery = db.q`EXEC [SP_Allocate_Asset]  '',${AssetID},${AssetType},${AssetName},${RFIDnumber},${EmployeeId},${EmployeeRFID},${LinkID},${Createdby},${branchid},${mode}`
      const response = await db.query(DetailsQuery);
      res.status(200).send(response.recordset);
    } catch (err) {
      console.log('Error on Allocate Assets', err)
      logErrorToFile('Error on Allocate Assets', err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }

  })

}

{
  // Label Print

  server.post('/LabelPrint', async (req, res) => {
    try {
      const selectedIds = req.body; // Array of data from the frontend
      // Function to print a label
      const printLabel = async (data) => {
        const {
          AssetID, AssetName, Category, SubCategory, Department, LocationCode, Building, Floor, Room, printedby, status, branchid
        } = data;

        try {

          const originalPrn = await fs.promises.readFile('PrnFile.prn', 'utf8');
          // allow only safe filename characters — LocationCode comes from the
          // request and is used in a shell copy command below
          const safeLocationCode = String(LocationCode).replace(/[^\w.-]/g, '_');
          const tempFileName = `PrnFile_${safeLocationCode}.prn`;

          // Replace placeholders in PRN file
          let modifiedPrn = originalPrn
            .replace('STRMachineName', AssetID)
            .replace('STRRackName', AssetName)
            .replace('STRLocationCode', LocationCode)
            .replace('STRLocationCode1', LocationCode)
            .replace('STRRow', Category)
            .replace('STRMachineCode', Department)

          // Loop to print the specified quantity
          // const printCount = PrintQty; // Change this based on your input for quantity
          // for (let i = 0; i < printCount; i++) {
          await fs.promises.writeFile(tempFileName, modifiedPrn);
          // console.log(`Temporary file created: ${tempFileName}`);
          const command = `copy "${tempFileName}" "${printerDeviceName}"`;
          await new Promise((resolve, reject) => {
            exec(command, async (error, stdout, stderr) => {
              if (error || stderr) {
                await handlePrintError(error, stderr, tempFileName, data);
                return reject(error || new Error(stderr));
              }
              await notifyPrintingComplete(data);
              await fs.promises.unlink(tempFileName);
              resolve();
            });
          });
          // }
        } catch (error) {
          // await handleProcessingError(error, data);
          console.log(error)
          await logErrorToFile('Error on Label Print', error)
        }
      };

      // Function to handle print errors
      const handlePrintError = async (error, stderr, tempFileName, data) => {
        console.error(`Print Error: ${error?.message || stderr}`);
        await logErrorToFile(`Print Error: ${error?.message || stderr}`);
        await notifyPrintingFailure(data, error);
        try {
          await fs.promises.unlink(tempFileName);
        } catch (unlinkError) {
          console.error(`Error deleting temp file: ${unlinkError.message}`);
        }
      };

      // Function to handle processing errors
      // const handleProcessingError = async (error, data) => {
      //   console.error(`Error processing SuplierCode ${data.SuplierCode}:`, error);
      //   await logErrorToFile(`Error processing SuplierCode ${data.SuplierCode}: ${error}`);
      //   await notifyPrintingFailure(data, error);
      // };

      // Function to notify completion
      const notifyPrintingComplete = async (data) => {
        const { AssetID, AssetName, Category, SubCategory, Department, LocationCode, Building, Floor, Room, printedby, status, branchid } = data;
        const print = db.q`EXEC [dbo].[SP_labelPrint] ${AssetID},${AssetName},${Category},${SubCategory},${Department},${printedby},${branchid},'','',${status}`
        const response = await db.query(print)
        console.log("🚀 ~ notifyPrintingComplete ~ response:", response)
      };

      // Function to notify failure
      const notifyPrintingFailure = async (data, error) => {
        console.error(`Failed to print for SuplierCode ${data.SuplierCode}: ${error.message}`);
        await logErrorToFile(`Failed to print for SuplierCode ${data.SuplierCode}: ${error.message}`);
      };

      // Set delay between each print (1 second)
      const delayBetweenPrints = 100;

      // Sequentially process each row
      for (const [index, data] of selectedIds.entries()) {
        // console.log(`Processing row ${index + 1}:`, data);
        await new Promise((resolve) => setTimeout(resolve, index * delayBetweenPrints));
        await printLabel(data);
      }

      res.status(200).json({ message: 'Printing completed' });
    } catch (error) {
      await logErrorToFile(error.message);
      console.error(error);
      res.status(500).json({ error: 'An error occurred during printing' });
    }
  });

  server.post('/LabelPrintLog', async (req, res) => {


    try {
      const { mode, branchid, departmentname, BranchAccess } = req.body;
      const print = db.q`EXEC [dbo].[SP_labelPrint] '','','','','','',${branchid},${BranchAccess},${departmentname},${mode}`
      const response = await db.query(print)
      res.status(200).send(response.recordset);
    } catch (err) {
      console.log('Error on Print Log', err)
      logErrorToFile('Error on Print Log', err)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }

  })

  // (duplicate /DepreciationConfig route removed — the handler at the
  // AssetType/IDgenerator config section above is the live one)

  server.post('/ReminderTypeAPI', async (req, res) => {
    const { ReminderType, ReminderTypeID, mode, branchid, BranchAccess, Createdby, Updateby } = req.body; // Get branch name from the request body
    try {
      const query = db.q`EXEC [dbo].[SP_ReminderTypeInfo] ${ReminderTypeID},${ReminderType},${mode},${Createdby},${Updateby},${branchid},${BranchAccess}`;
      const result = await db.query(query);
      const send = result.recordset;
      res.status(200).json({ send });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'An error occurred on Reminder API' });
    }
  });

  server.post('/ReminderSettingAPI', async (req, res) => {
    const { Category, SubCategory, ReminderType, ReminderTitle, ReminderDays, ReminderDescription,
      ReminderMode, ReminderStatus, mode, branchid, BranchAccess, Createdby, Updatedby, ReminderID } = req.body; // Get branch name from the request body
    try {
      const query = db.q`EXEC [dbo].[SP_Reminder] ${ReminderID},${Category},${SubCategory},${ReminderType},${ReminderTitle},${ReminderDays},${ReminderMode},${ReminderDescription},${ReminderStatus},${mode},${Createdby},${Updatedby},${branchid},${BranchAccess}`;
      console.log("🚀 ~ query:", query)
      const result = await db.query(query);
      res.status(200).json(result.recordset);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'An error occurred on Reminder API' });
    }
  });
  server.post('/SchedulerSettingAPI', async (req, res) => {
    const { Id, AuditCode, AuditType, Fromdate, Todate, Status, Mode, Createdby, branchid, BranchAccess } = req.body; // Get branch name from the request body
    try {
      const query = db.q`[dbo].[SP_Scheduler] ${Id},${AuditCode},${AuditType},${Fromdate},${Todate},${Status},${Mode},${Createdby},${branchid},${BranchAccess}`;
      console.log("🚀 ~ query:", query)
      const result = await db.query(query);
      res.status(200).json(result.recordset);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'An error occurred on Scheduler API' });
    }
  });

  server.post("/UploadAttachment", uploadFile.array("files"), async (req, res) => {
    try {
      const { Createdby, AssetID, branchid } = req.body;
      const uploadedFiles = req.files;

      if (!uploadedFiles || uploadedFiles.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const fileData = uploadedFiles.map((file) => ({
        AssetID,
        filename: file.filename,  // ✅ renamed multer filename
        filepath: "/uploads/assetAttachments/" + file.filename  // ✅ correct path
      }));

      const insertPromises = fileData.map(file => {
        const query = db.q`EXEC [dbo].[AssetAttachments] 'I',${file.AssetID},${file.filename},${file.filepath},${Createdby},${branchid}`;
        return db.query(query);
      });

      await Promise.all(insertPromises);
      return res.status(200).json({
        message: "Files uploaded successfully",
        files: fileData
      });

    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Upload error", error });
    }
  });

  server.post('/GetAttachments', async (req, res) => {
    const { AssetID, mode, branchid } = req.body; // Get branch name from the request body
    try {
      const query = db.q`EXEC [dbo].[AssetAttachments] ${mode},${AssetID},'','','',${branchid}`;
      const result = await db.query(query);
      res.status(200).json(result.recordset);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'An error occurred on Reminder API' });
    }
  });

  server.post('/DeleteAttachment', async (req, res) => {
    try {
      const { attachmentId, branchid } = req.body;

      // 1. Read DB details
      const query = db.q`EXEC [dbo].[AssetAttachments] 'SI',${attachmentId},'','','',${branchid}`;
      const result = await db.query(query);

      if (result.recordset.length === 0)
        return res.json({ success: false, message: "Attachment not found" });

      const filePathDB = result.recordset[0].FilePath;
      // Example: "/uploads/assetAttachments/1719746123-92312312.pdf"

      // 2. Convert to actual system path
      const filePath = path.join(__dirname, filePathDB);

      console.log("Deleting file:", filePath);

      // 3. Delete file from folder
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("File deleted:", filePath);
      } else {
        console.log("File not found on disk");
      }

      // 3. Delete from DB
      const Deletequery = db.q`EXEC [dbo].[AssetAttachments] 'Delete',${attachmentId},'','','',${branchid}`;
      const Deleteresult = await db.query(Deletequery);
      res.json({ success: true });

    } catch (error) {
      console.error(error);
      res.json({ success: false, message: "Error deleting attachment" });
    }
  });

  server.post('/CalculateDepreciation', async (req, res) => {
    const { branchid } = req.body;
    try {
      const query = db.q`exec [dbo].[SP_Update_Asset_Depreciation] ${branchid}`;
      const response = await db.query(query)
      const send = response.recordset
      res.status(200).json({ message: 'Below is the details ', send });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: 'Error on Calculate Depreciation ' });

    }

  })

}

{
  // Masters Upload data
  // Buildig Uploaded
  server.post('/BuildingUploadData', upload.single('file'), async (req, res) => {
    try {
      const file = req.file;
      const { Createdby, branchid } = req.body;
      const mode = 'I';
      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      let uploadcount = 0;
      const unuploadedData = [];

      for (const row of data) {
        const { Building } = row;
        const escapeSql = (value) => value; // parameterized queries: no manual quote escaping
        const trimString = (value) => typeof value === 'string' ? value.trim() : value;
        const trimmedBuilding = escapeSql(trimString(Building));

        const CheckQuery = db.q`EXEC [Master].[SP_BuildingMaster] '',${Building},'CheckUpload',${Createdby},'',${branchid},''`
        const response = await db.query(CheckQuery);
        console.log('Response', response.recordset);
        const data = response.recordset;
        let Reason = '';
        console.log('data.Count', data[0].Count);

        if (data[0].Count != 0) {
          Reason = 'Building Already Exists'
        }

        if (!Reason) {
          const InsertassetRegisterQuery = db.q`EXEC [Master].[SP_BuildingMaster] '',${Building},${mode},${Createdby},'',${branchid},''`;
          const response1 = await db.query(InsertassetRegisterQuery)
          // console.log(InsertassetRegisterQuery)
          if (response1.rowsAffected && response1.rowsAffected[0] > 0) {
            uploadcount++;
          }
        } else {
          unuploadedData.push({
            Building: row.Building, Reason
          });
        }
      }

      if (unuploadedData.length > 0) {
        const unuploadedWorkbook = xlsx.utils.book_new();
        const unuploadedWorksheet = xlsx.utils.json_to_sheet(unuploadedData);
        xlsx.utils.book_append_sheet(unuploadedWorkbook, unuploadedWorksheet, 'Unuploaded Building Data');

        const unuploadedFilePath = path.join(__dirname, 'UnuploadedBuilding.xlsx');
        xlsx.writeFile(unuploadedWorkbook, unuploadedFilePath);

        res.status(200).json({
          message: 'Data uploaded with some errors',
          uploadcount,
          unuploadedFilePath: `/download/UnuploadedBuilding.xlsx`,
        });

      } else {
        res.status(200).json({ message: 'Data uploaded successfully', uploadcount });
        // console.log(uploadcount)
      }

    } catch (err) {
      logErrorToFile(err.message);
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  // Floor Uploaded
  server.post('/FloorUploadData', upload.single('file'), async (req, res) => {
    try {
      const file = req.file;
      const { Createdby, branchid } = req.body;
      const mode = 'I';
      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      let uploadcount = 0;
      const unuploadedData = [];

      for (const row of data) {
        const { Floor } = row;

        const CheckQuery = db.q`EXEC [Master].[SP_FloorMaster] '',${Floor},'CheckUpload',${Createdby},'',${branchid},''`
        const response = await db.query(CheckQuery);
        const data = response.recordset;
        let Reason = '';

        if (data[0].Count != 0) {
          Reason = 'Floor Already Exists'
        }

        if (!Reason) {
          const InsertassetRegisterQuery = db.q`EXEC [Master].[SP_FloorMaster] '',${Floor},${mode},${Createdby},'',${branchid},''`;
          const response1 = await db.query(InsertassetRegisterQuery)
          // console.log(InsertassetRegisterQuery)
          if (response1.rowsAffected && response1.rowsAffected[0] > 0) {
            uploadcount++;
          }
        } else {
          unuploadedData.push({
            Floor: row.Floor, Reason
          });
        }
      }

      if (unuploadedData.length > 0) {
        const unuploadedWorkbook = xlsx.utils.book_new();
        const unuploadedWorksheet = xlsx.utils.json_to_sheet(unuploadedData);
        xlsx.utils.book_append_sheet(unuploadedWorkbook, unuploadedWorksheet, 'Unuploaded Floor Data');

        const unuploadedFilePath = path.join(__dirname, 'UnuploadedFloor.xlsx');
        xlsx.writeFile(unuploadedWorkbook, unuploadedFilePath);

        res.status(200).json({
          message: 'Data uploaded with some errors',
          uploadcount,
          unuploadedFilePath: `/download/UnuploadedFloor.xlsx`,
        });

      } else {
        res.status(200).json({ message: 'Data uploaded successfully', uploadcount });
        // console.log(uploadcount)
      }

    } catch (err) {
      logErrorToFile(err.message);
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  // Room Uploaded
  server.post('/RoomUploadData', upload.single('file'), async (req, res) => {
    try {
      const file = req.file;
      const { Createdby, branchid } = req.body;
      const mode = 'I';
      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      let uploadcount = 0;
      const unuploadedData = [];

      for (const row of data) {
        const { Room } = row;

        const CheckQuery = db.q`EXEC [Master].[SP_RoomMaster] '',${Room},'CheckUpload',${Createdby},'',${branchid},''`
        const response = await db.query(CheckQuery);
        const data = response.recordset;
        let Reason = '';

        if (data[0].Count != 0) {
          Reason = 'Room Already Exists'
        }

        if (!Reason) {
          const InsertassetRegisterQuery = db.q`EXEC [Master].[SP_RoomMaster] '',${Room},${mode},${Createdby},'',${branchid},''`;
          const response1 = await db.query(InsertassetRegisterQuery)
          // console.log(InsertassetRegisterQuery)
          if (response1.rowsAffected && response1.rowsAffected[0] > 0) {
            uploadcount++;
          }
        } else {
          unuploadedData.push({
            Room: row.Room, Reason
          });
        }
      }

      if (unuploadedData.length > 0) {
        const unuploadedWorkbook = xlsx.utils.book_new();
        const unuploadedWorksheet = xlsx.utils.json_to_sheet(unuploadedData);
        xlsx.utils.book_append_sheet(unuploadedWorkbook, unuploadedWorksheet, 'Unuploaded Room Data');

        const unuploadedFilePath = path.join(__dirname, 'UnuploadedRoom.xlsx');
        xlsx.writeFile(unuploadedWorkbook, unuploadedFilePath);

        res.status(200).json({
          message: 'Data uploaded with some errors',
          uploadcount,
          unuploadedFilePath: `/download/UnuploadedRoom.xlsx`,
        });

      } else {
        res.status(200).json({ message: 'Data uploaded successfully', uploadcount });
        // console.log(uploadcount)
      }

    } catch (err) {
      logErrorToFile(err.message);
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  // Location Uploade
  server.post('/LocationUploadData', upload.single('file'), async (req, res) => {
    try {
      const file = req.file;
      const { Createdby, branchid } = req.body;

      const mode = 'I';

      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      let uploadcount = 0;
      const unuploadedData = [];
      // Iterate over each row from the Excel sheet
      for (const row of data) {
        const { Building, Floor, Room, LocationRFID } = row;

        const escapeSql = (value) => value; // parameterized queries: no manual quote escaping
        const trimString = (value) => typeof value === 'string' ? value.trim() : value;

        const trimmedBuilding = escapeSql(trimString(Building));
        const trimmedFloor = escapeSql(trimString(Floor));
        const trimmedRoom = escapeSql(trimString(Room));
        const trimmedLocationRFID = escapeSql(trimString(LocationRFID));

        // If all necessary fields are present
        if (trimmedBuilding && trimmedLocationRFID && trimmedFloor && trimmedRoom) {
          const checkRFIDQuery = db.q`
      EXEC [Master].[SP_LinkLocation] '',${trimmedBuilding},${trimmedFloor},${trimmedRoom},${trimmedLocationRFID},'CheckRFID','','',${branchid},''
    `;
          const checkResponse = await db.query(checkRFIDQuery);
          // const count = checkResponse.recordset[0]?.count || 0;
          const [data] = checkResponse.recordset
          let reason = '';

          if (data.Count !== 0) {
            reason = 'Location RFID Already Exists';
          }
          else if (data.Building === 0) {
            reason = 'Building Not Exists in Master';
          }
          else if (data.Floor === 0) {
            reason = 'Floor Not Exists in Master';
          }
          else if (data.Room === 0) {
            reason = 'Room Not Exists in Master';
          }
          else if (data.LinkCount !== 0) {
            reason = 'Building,Floor,Room Already Exists';
          }


          if (!reason) {
            // RFID is unique — proceed to insert
            const insertQuery = db.q`
        EXEC [Master].[SP_LinkLocation] '',${trimmedBuilding},${trimmedFloor},${trimmedRoom},${trimmedLocationRFID},${mode},${Createdby},'',${branchid},''
      `;
            const response1 = await db.query(insertQuery);

            if (response1.rowsAffected && response1.rowsAffected[0] > 0) {
              uploadcount++;
            } else {
              // Insert failed
              unuploadedData.push({ Building, Floor, Room, LocationRFID, reason });
            }
          } else {
            // RFID already exists — skip insertion
            unuploadedData.push({ Building, Floor, Room, LocationRFID, reason });
          }
        } else {
          // Missing required fields
          unuploadedData.push({ Building, Floor, Room, LocationRFID, reason });
        }
      }


      // If there is unuploaded data, create an Excel file and provide a download link
      if (unuploadedData.length > 0) {
        const unuploadedWorkbook = xlsx.utils.book_new();
        const unuploadedWorksheet = xlsx.utils.json_to_sheet(unuploadedData);
        xlsx.utils.book_append_sheet(unuploadedWorkbook, unuploadedWorksheet, 'Unuploaded Data');

        const unuploadedFilePath = path.join(__dirname, 'Unupload_LocationData.xlsx');
        xlsx.writeFile(unuploadedWorkbook, unuploadedFilePath);

        return res.status(200).json({
          message: 'Data uploaded with some errors',
          uploadcount,
          unuploadedFilePath: `/download/Unupload_LocationData.xlsx`, // URL for downloading the unuploaded data
        });
      } else {
        // If all data is uploaded successfully, return the count of uploaded records
        return res.status(200).json({ message: 'Data uploaded successfully', uploadcount });
      }

    } catch (err) {
      // Log the error if any exception occurs
      logErrorToFile(err.message);
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  // Room Uploaded
  server.post('/AssetTypeMasterUploadData', upload.single('file'), async (req, res) => {
    try {
      const file = req.file;
      const { Createdby, branchid } = req.body;
      const mode = 'I';
      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      let uploadcount = 0;
      const unuploadedData = [];

      for (const row of data) {
        const { AssetType } = row;

        const CheckQuery = db.q`EXEC [Master].[SP_AssetTypeMaster] '',${AssetType},'CheckUpload',${Createdby},'',${branchid},''`
        const response = await db.query(CheckQuery);
        const data = response.recordset;
        let Reason = '';

        if (data[0].Count != 0) {
          Reason = 'Asset Type Already Exists'
        }

        if (!Reason) {
          const InsertassetRegisterQuery = db.q`EXEC [Master].[SP_AssetTypeMaster] '',${AssetType},${mode},${Createdby},'',${branchid},''`;
          const response1 = await db.query(InsertassetRegisterQuery)
          // console.log(InsertassetRegisterQuery)
          if (response1.rowsAffected && response1.rowsAffected[0] > 0) {
            uploadcount++;
          }
        } else {
          unuploadedData.push({
            AssetType: row.AssetType, Reason
          });
        }
      }

      if (unuploadedData.length > 0) {
        const unuploadedWorkbook = xlsx.utils.book_new();
        const unuploadedWorksheet = xlsx.utils.json_to_sheet(unuploadedData);
        xlsx.utils.book_append_sheet(unuploadedWorkbook, unuploadedWorksheet, 'Unuploaded Asset Type Data');

        const unuploadedFilePath = path.join(__dirname, 'UnuploadedAssetType.xlsx');
        xlsx.writeFile(unuploadedWorkbook, unuploadedFilePath);

        res.status(200).json({
          message: 'Data uploaded with some errors',
          uploadcount,
          unuploadedFilePath: `/download/UnuploadedAssetType.xlsx`,
        });

      } else {
        res.status(200).json({ message: 'Data uploaded successfully', uploadcount });
        // console.log(uploadcount)
      }

    } catch (err) {
      logErrorToFile(err.message);
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  server.post('/PackageUploadData', upload.single('file'), async (req, res) => {
    try {
      const file = req.file;
      const { Createdby, branchid } = req.body;
      const mode = 'I';
      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      let uploadcount = 0;
      const unuploadedData = [];

      for (const row of data) {
        const { Package, Category, SubCategory } = row;

        const CheckQuery = db.q`EXEC [Master].[SP_AssetPackageMaster] '',${Package},${Category},${SubCategory},'CheckUpload',${Createdby},'',${branchid},''`
        const response = await db.query(CheckQuery);
        const data = response.recordset;
        console.log("🚀 ~ data:", data);

        let Reason = '';

        if (data[0].PackageName != '0' || data[0].PackageName != 0) {
          Reason = 'Asset Type Already Exists'
        } else if (data[0].Category === '0' || data[0].Category === 0) {
          Reason = 'Category or SubCategory Not Exists in Master'
        }

        if (!Reason) {
          const InsertassetRegisterQuery = db.q`EXEC [Master].[SP_AssetPackageMaster] '',${Package},${Category},${SubCategory},${mode},${Createdby},'',${branchid},''`;
          const response1 = await db.query(InsertassetRegisterQuery)
          // console.log(InsertassetRegisterQuery)
          if (response1.rowsAffected && response1.rowsAffected[0] > 0) {
            uploadcount++;
          }
        } else {
          unuploadedData.push({
            Package: row.Package, Category: row.Category, SubCategory: row.SubCategory, Reason
          });
        }
      }

      if (unuploadedData.length > 0) {
        const unuploadedWorkbook = xlsx.utils.book_new();
        const unuploadedWorksheet = xlsx.utils.json_to_sheet(unuploadedData);
        xlsx.utils.book_append_sheet(unuploadedWorkbook, unuploadedWorksheet, 'Unuploaded Package Data');

        const unuploadedFilePath = path.join(__dirname, 'UnuploadedPackage.xlsx');
        xlsx.writeFile(unuploadedWorkbook, unuploadedFilePath);

        res.status(200).json({
          message: 'Data uploaded with some errors',
          uploadcount,
          unuploadedFilePath: `/download/UnuploadedPackage.xlsx`,
        });

      } else {
        res.status(200).json({ message: 'Data uploaded successfully', uploadcount });
        // console.log(uploadcount)
      }

    } catch (err) {
      logErrorToFile(err.message);
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  // Group Uploaded
  server.post('/AssetGroupUploadData', upload.single('file'), async (req, res) => {
    try {
      const file = req.file;
      const { Createdby, branchid } = req.body;
      const mode = 'I';
      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      let uploadcount = 0;
      const unuploadedData = [];

      for (const row of data) {
        const { Group } = row;

        const CheckQuery = db.q`EXEC [Master].[SP_AssetGroupMaster] '',${Group},'CheckUpload',${Createdby},'',${branchid},''`
        const response = await db.query(CheckQuery);
        const data = response.recordset;
        let Reason = '';

        if (data[0].Count != 0) {
          Reason = 'Group Already Exists'
        }

        if (!Reason) {
          const InsertassetRegisterQuery = db.q`EXEC [Master].[SP_AssetGroupMaster] '',${Group},${mode},${Createdby},'',${branchid},''`;
          const response1 = await db.query(InsertassetRegisterQuery)
          // console.log(InsertassetRegisterQuery)
          if (response1.rowsAffected && response1.rowsAffected[0] > 0) {
            uploadcount++;
          }
        } else {
          unuploadedData.push({
            Group: row.Group, Reason
          });
        }
      }

      if (unuploadedData.length > 0) {
        const unuploadedWorkbook = xlsx.utils.book_new();
        const unuploadedWorksheet = xlsx.utils.json_to_sheet(unuploadedData);
        xlsx.utils.book_append_sheet(unuploadedWorkbook, unuploadedWorksheet, 'Unuploaded Group Data');

        const unuploadedFilePath = path.join(__dirname, 'unuploaded_AssetGroup_data.xlsx');
        xlsx.writeFile(unuploadedWorkbook, unuploadedFilePath);

        res.status(200).json({
          message: 'Data uploaded with some errors',
          uploadcount,
          unuploadedFilePath: `/download/unuploaded_AssetGroup_data.xlsx`,
        });

      } else {
        res.status(200).json({ message: 'Data uploaded successfully', uploadcount });
        // console.log(uploadcount)
      }

    } catch (err) {
      logErrorToFile(err.message);
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  // Maintenance Type
  server.post('/MaintenanceTypeUploadData', upload.single('file'), async (req, res) => {
    try {
      const file = req.file;
      const { Createdby, branchid } = req.body;
      const mode = 'I';
      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      let uploadcount = 0;
      const unuploadedData = [];

      for (const row of data) {
        const { MaintenanceType } = row;

        const CheckQuery = db.q`EXEC [dbo].[MaintenanceMasterInfo] ${MaintenanceType},'','CheckUpload',${Createdby},'',${branchid},''`
        const response = await db.query(CheckQuery);
        const data = response.recordset;
        let Reason = '';

        if (data[0].Count != 0) {
          Reason = 'Maintenance Type Already Exists'
        }

        if (!Reason) {
          const InsertassetRegisterQuery = db.q`EXEC [dbo].[MaintenanceMasterInfo] ${MaintenanceType},'',${mode},${Createdby},'',${branchid},''`;
          const response1 = await db.query(InsertassetRegisterQuery)
          // console.log(InsertassetRegisterQuery)
          if (response1.rowsAffected && response1.rowsAffected[0] > 0) {
            uploadcount++;
          }
        } else {
          unuploadedData.push({
            MaintenanceType: row.MaintenanceType, Reason
          });
        }
      }

      if (unuploadedData.length > 0) {
        const unuploadedWorkbook = xlsx.utils.book_new();
        const unuploadedWorksheet = xlsx.utils.json_to_sheet(unuploadedData);
        xlsx.utils.book_append_sheet(unuploadedWorkbook, unuploadedWorksheet, 'Unuploaded MaintenanceType Data');

        const unuploadedFilePath = path.join(__dirname, 'unuploadedMaintenanceTypedata.xlsx');
        xlsx.writeFile(unuploadedWorkbook, unuploadedFilePath);

        res.status(200).json({
          message: 'Data uploaded with some errors',
          uploadcount,
          unuploadedFilePath: `/download/unuploadedMaintenanceTypedata.xlsx`,
        });

      } else {
        res.status(200).json({ message: 'Data uploaded successfully', uploadcount });
        // console.log(uploadcount)
      }

    } catch (err) {
      logErrorToFile(err.message);
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  // Vendor Type

  server.post('/VendorUploadData', upload.single('file'), async (req, res) => {
    try {
      const file = req.file;
      const { Createdby, branchid } = req.body;
      const mode = 'I';
      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      let uploadcount = 0;
      const unuploadedData = [];

      for (const row of data) {
        const { VendorName, ContactPerson, PhoneNumber, Email, GSTNumber, Address, City, State, Country, PostalCode, BankAccountNo, IFSC, PAN
        } = row;

        const CheckQuery = db.q`EXEC [dbo].[VendorsMasterInfo] '',${VendorName},${PhoneNumber},${Address},${BankAccountNo},${City},${ContactPerson},${Country},${Email},${GSTNumber},
      ${IFSC},${PAN},${PostalCode},${State},'CheckUpload',${Createdby},'',${branchid},''`
        const response = await db.query(CheckQuery);
        const data = response.recordset;
        let Reason = '';

        if (data[0].Count != 0) {
          Reason = 'Vendor Phone Number Already Exists'
        }

        if (!Reason) {
          const InsertassetRegisterQuery = db.q`EXEC [dbo].[VendorsMasterInfo] '',${VendorName},${PhoneNumber},${Address},${BankAccountNo},${City},${ContactPerson},${Country},${Email},${GSTNumber},
      ${IFSC},${PAN},${PostalCode},${State},${mode},${Createdby},'',${branchid},''`;
          const response1 = await db.query(InsertassetRegisterQuery)
          // console.log(InsertassetRegisterQuery)
          if (response1.rowsAffected && response1.rowsAffected[0] > 0) {
            uploadcount++;
          }
        } else {
          unuploadedData.push({
            VendorName: row.VendorName, ContactPerson: row.ContactPerson, PhoneNumber: row.PhoneNumber, Email: row.Email, GSTNumber: row.GSTNumber, Address: row.Address, City: row.City, State: row.State, Country: row.Country, PostalCode: row.PostalCode, BankAccountNo: row.BankAccountNo, IFSC: row.IFSC, PAN: row.PAN, Reason
          });
        }
      }

      if (unuploadedData.length > 0) {
        const unuploadedWorkbook = xlsx.utils.book_new();
        const unuploadedWorksheet = xlsx.utils.json_to_sheet(unuploadedData);
        xlsx.utils.book_append_sheet(unuploadedWorkbook, unuploadedWorksheet, 'Unuploaded Vendor Data');

        const unuploadedFilePath = path.join(__dirname, 'unuploadedVendordata.xlsx');
        xlsx.writeFile(unuploadedWorkbook, unuploadedFilePath);

        res.status(200).json({
          message: 'Data uploaded with some errors',
          uploadcount,
          unuploadedFilePath: `/download/unuploadedVendordata.xlsx`,
        });

      } else {
        res.status(200).json({ message: 'Data uploaded successfully', uploadcount });
        // console.log(uploadcount)
      }

    } catch (err) {
      logErrorToFile(err.message);
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  // Asset ID Generator
  server.post('/IDGeneratorUploadData', upload.single('file'), async (req, res) => {
    try {
      const file = req.file;
      const { Createdby, branchid } = req.body;
      const mode = 'I';
      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      let uploadcount = 0;
      const unuploadedData = [];

      for (const row of data) {
        const { Category, Prefix, Suffix } = row;

        const CheckQuery = db.q`EXEC auto_generateCode '',${Category},${Prefix},${Suffix},${Createdby},${branchid},'CheckUpload'`
        const response = await db.query(CheckQuery);
        const data = response.recordset;
        let Reason = '';

        if (data[0].Count != 0 || data[0].Count != '0') {
          Reason = 'Category Already Exists'
        } else if (data[0].Count != 0 || data[0].Count != '0') {
          Reason = `Category Doesn't Exists in Master`
        }
        if (!Reason) {
          const InsertassetRegisterQuery = db.q`EXEC auto_generateCode '',${Category},${Prefix},${Suffix},${Createdby},${branchid},${mode}`;
          const response1 = await db.query(InsertassetRegisterQuery)
          // console.log(InsertassetRegisterQuery)
          if (response1.rowsAffected && response1.rowsAffected[0] > 0) {
            uploadcount++;
          }
        } else {
          unuploadedData.push({
            Category: row.Category, Prefix: row.Prefix, Suffix: row.Suffix, Reason
          });
        }
      }

      if (unuploadedData.length > 0) {
        const unuploadedWorkbook = xlsx.utils.book_new();
        const unuploadedWorksheet = xlsx.utils.json_to_sheet(unuploadedData);
        xlsx.utils.book_append_sheet(unuploadedWorkbook, unuploadedWorksheet, 'Unuploaded Auto ID Generator');

        const unuploadedFilePath = path.join(__dirname, 'UnuploadedIDGenerator.xlsx');
        xlsx.writeFile(unuploadedWorkbook, unuploadedFilePath);

        res.status(200).json({
          message: 'Data uploaded with some errors',
          uploadcount,
          unuploadedFilePath: `/download/UnuploadedIDGenerator.xlsx`,
        });

      } else {
        res.status(200).json({ message: 'Data uploaded successfully', uploadcount });
        // console.log(uploadcount)
      }

    } catch (err) {
      logErrorToFile(err.message);
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  // Maintained By 
  server.post('/MaintainedUploadData', upload.single('file'), async (req, res) => {
    try {
      const file = req.file;
      const { Createdby, branchid } = req.body;
      const mode = 'I';
      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      let uploadcount = 0;
      const unuploadedData = [];

      for (const row of data) {
        const { Maintainedby } = row;

        const CheckQuery = db.q`EXEC [Master].[SP_MaintainedMaster] '',${Maintainedby},'CheckUpload',${Createdby},'',${branchid},''`
        const response = await db.query(CheckQuery);
        const data = response.recordset;
        let Reason = '';

        if (data[0].Count != 0 || data[0].Count != '0') {
          Reason = 'Maintained by Already Exists'
        }
        if (!Reason) {
          const InsertassetRegisterQuery = db.q`EXEC [Master].[SP_MaintainedMaster] '',${Maintainedby},${mode},${Createdby},'',${branchid},''`;
          const response1 = await db.query(InsertassetRegisterQuery)
          // console.log(InsertassetRegisterQuery)
          if (response1.rowsAffected && response1.rowsAffected[0] > 0) {
            uploadcount++;
          }
        } else {
          unuploadedData.push({
            Maintainedby: row.Maintainedby, Reason
          });
        }
      }

      if (unuploadedData.length > 0) {
        const unuploadedWorkbook = xlsx.utils.book_new();
        const unuploadedWorksheet = xlsx.utils.json_to_sheet(unuploadedData);
        xlsx.utils.book_append_sheet(unuploadedWorkbook, unuploadedWorksheet, 'Unuploaded Maintained by');

        const unuploadedFilePath = path.join(__dirname, 'unuploaded_Maintained_data.xlsx');
        xlsx.writeFile(unuploadedWorkbook, unuploadedFilePath);

        res.status(200).json({
          message: 'Data uploaded with some errors',
          uploadcount,
          unuploadedFilePath: `/download/unuploaded_Maintained_data.xlsx`,
        });

      } else {
        res.status(200).json({ message: 'Data uploaded successfully', uploadcount });
        // console.log(uploadcount)
      }

    } catch (err) {
      logErrorToFile(err.message);
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });



  // Reminder Type
  server.post('/ReminderTypeUploadData', upload.single('file'), async (req, res) => {
    try {
      const file = req.file;
      const { Createdby, branchid } = req.body;
      const mode = 'I';
      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);
      let uploadcount = 0;
      const unuploadedData = [];
      for (const row of data) {
        const { ReminderType } = row;
        const CheckQuery = db.q`EXEC [dbo].[SP_ReminderTypeInfo] '',${ReminderType},'CheckUpload',${Createdby},'',${branchid},''`
        const response = await db.query(CheckQuery);
        const data = response.recordset;
        let Reason = '';

        if (data[0].Count != 0 || data[0].Count != '0') {
          Reason = 'Reminder Type Already Exists';
        }
        if (!Reason) {
          const InsertassetRegisterQuery = db.q`EXEC [dbo].[SP_ReminderTypeInfo] '',${ReminderType},${mode},${Createdby},'',${branchid},''`;
          const response1 = await db.query(InsertassetRegisterQuery)
          // console.log(InsertassetRegisterQuery)
          if (response1.rowsAffected && response1.rowsAffected[0] > 0) {
            uploadcount++;
          }
        } else {
          unuploadedData.push({
            ReminderType: row.ReminderType, Reason
          });
        }
      }

      if (unuploadedData.length > 0) {
        const unuploadedWorkbook = xlsx.utils.book_new();
        const unuploadedWorksheet = xlsx.utils.json_to_sheet(unuploadedData);
        xlsx.utils.book_append_sheet(unuploadedWorkbook, unuploadedWorksheet, 'Unuploaded Reminder type');

        const unuploadedFilePath = path.join(__dirname, 'UnuploadedReminderType.xlsx');
        xlsx.writeFile(unuploadedWorkbook, unuploadedFilePath);

        res.status(200).json({
          message: 'Data uploaded with some errors',
          uploadcount,
          unuploadedFilePath: `/download/UnuploadedReminderType.xlsx`,
        });

      } else {
        res.status(200).json({ message: 'Data uploaded successfully', uploadcount });
        // console.log(uploadcount)
      }

    } catch (err) {
      logErrorToFile(err.message);
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

}

{
  server.post('/GetInactiveStatus', async (req, res) => {
    try {
      const { id, mood, branchid } = req.body;

      // Build the query safely (ideally use parameterized queries to avoid SQL injection)
      const query = db.q`exec dbo.sp_Notification ${id},${mood},${branchid}`;

      const response = await db.query(query);

      if (mood === 'GetInactiveStatus') {
        const countSet = response.recordsets?.[0];
        const detailSet = response.recordsets?.[1];

        const InactiveCount =
          Array.isArray(countSet) && countSet.length > 0
            ? countSet[0].InactiveCount
            : 0;

        const InactiveDetails =
          Array.isArray(detailSet) ? detailSet : [];

        res.status(200).json({
          InactiveCount,
          InactiveDetails
        });
      }
      else {
        const result = Array.isArray(response?.recordset)
          ? response.recordset
          : [];

        res.status(200).json(result);
      }
    } catch (error) {
      // Log and respond with a server error
      logErrorToFile(error);
      console.error('Get Inactive Status Error:', error);

      res.status(500).json({
        success: false,
        message: 'An error occurred while processing the request.',
        error: error.message,
      });
    }
  });
}




server.post('/MouldPartMaster', async (req, res) => {
  try {
    const {
      mode = '',
      MP_ID = '',
      RFID = '',
      MetricSize = '',
      ItemCode = '',
      Location = '',
      Description = '',
      MouldType = '',
      LifeCount = '',
      AlertCount = '',
      UtilizedCount = '',
      CreatedBy = '',
      UpdatedBy = '',
      branchid = 0,
      BranchAccess = ''
    } = req.body;

    const pool = await connect();

    const result = await pool.request()
      .input('mode', sql.VarChar(20), mode)
      .input('MP_ID', sql.Int, MP_ID ? parseInt(MP_ID, 10) : null)
      .input('RFID', sql.VarChar(100), RFID || null)
      .input('MetricSize', sql.VarChar(50), MetricSize || null)
      .input('ItemCode', sql.VarChar(100), ItemCode || null)
      .input('Location', sql.VarChar(100), Location || null)
      .input('Description', sql.VarChar(500), Description || null)
      .input('MouldType', sql.Int, MouldType ? parseInt(MouldType, 10) : null)
      .input('LifeCount', sql.Int, LifeCount ? parseInt(LifeCount, 10) : null)
      .input('AlertCount', sql.Int, AlertCount ? parseInt(AlertCount, 10) : null)
      .input('UtilizedCount', sql.Int, UtilizedCount !== '' ? parseInt(UtilizedCount, 10) : null)
      .input('BranchId', sql.Int, branchid || 1)
      .input('BranchAccess', sql.VarChar(200), BranchAccess || null)
      .input('CreatedBy', sql.VarChar(100), CreatedBy || null)
      .input('UpdatedBy', sql.VarChar(100), UpdatedBy || null)
      .execute('[Masters].[SP_MouldPartMaster]');

    res.status(200).json(result.recordset || []);

  } catch (error) {
    console.error('MouldPartMaster Error:', error);
    logErrorToFile(error);
    res.status(500).json({ status: 'ERROR', message: error.message });
  }
});

server.post('/MachineConfig', async (req, res) => {
  try {
    const {
      mode = '',
      Id = '',
      RFID = '',
      MachineNo = '',
      MachineName = '',
      MachineDescription = '',
      MachineCapacity = '',
      MachineMake = '',
      SPM = '',
      CreatedBy = '',
      UpdatedBy = '',
      branchid = 0,
      BranchAccess = ''
    } = req.body;

    const pool = await connect();

    const result = await pool.request()
      .input('mode', sql.VarChar(20), mode)
      .input('Id', sql.Int, Id ? parseInt(Id, 10) : null)
      .input('RFID', sql.VarChar(200), RFID || null)
      .input('MachineNo', sql.VarChar(200), MachineNo || null)
      .input('MachineName', sql.VarChar(200), MachineName || null)
      .input('MachineDescription', sql.VarChar(200), MachineDescription || null)
      .input('MachineCapacity', sql.VarChar(200), MachineCapacity || null)
      .input('MachineMake', sql.VarChar(200), MachineMake || null)
      .input('SPM', sql.VarChar(200), SPM || null)
      .input('BranchId', sql.Int, branchid || 1)
      .input('BranchAccess', sql.VarChar(200), BranchAccess || null)
      .input('CreatedBy', sql.VarChar(200), CreatedBy || null)
      .input('UpdatedBy', sql.VarChar(200), UpdatedBy || null)
      .execute('[Masters].[SP_MainMachineMaster]');

    res.status(200).json(result.recordset || []);

  } catch (error) {
    console.error('MachineConfig Error:', error);
    logErrorToFile(error);
    res.status(500).json({ status: 'ERROR', message: error.message });
  }
});

// server.post('/MachineConfig', async (req, res) => {
//     try {

//         const {
//             mode,
//             Id,
//             MachineNo,
//             MachineName,
//             MachineDescription,
//             MachineCapacity,
//             MachineUOM,
//             MachineCapacityUOM,
//             MachineMake,
//             SPM,
//             UOMTypeId,
//             Status,
//             CreatedBy,
//             RFID
//         } = req.body;

//         const request = db.request();

//         request.input('id', Id || null);
//         request.input('MachineNo', MachineNo || '');
//         request.input('MachineName', MachineName || '');
//         request.input('MachineDescription', MachineDescription || '');
//         request.input('MachineCapacity', MachineCapacity || '');
//         request.input('MachineUOM', MachineUOM || '');
//         request.input('MachineCapacityUOM', MachineCapacityUOM || '');
//         request.input('MachineMake', MachineMake || '');
//         request.input('SPM', SPM || '');
//         request.input('UOMTypeId', UOMTypeId || '');
//         request.input('Status', Status || '');
//         request.input('CreatedBy', CreatedBy || '');
//         request.input('mode', mode || '');
//         request.input('RFID', RFID || '');

//         console.log("MachineConfig Request:", req.body);
//         console.log("MachineConfig Mode:", mode);

//         const response = await request.execute(
//             '[Masters].[SP_MainMachineMaster]'
//         );

//         console.log("MachineConfig Response:", response.recordset);

//         res.status(200).send(response.recordset);

//     } catch (err) {

//         console.error('Error on Machine Register:', err);

//         logErrorToFile(
//             'Error on Machine Register',
//             err
//         );

//         res.status(500).send({
//             message: 'Error processing Machine request',
//             error: err.message
//         });
//     }
// });




// server.post('/MachineConfig', async (req, res) => {
//   try {

//     const {
//       MachineId = '',
//       MachineRFID = '',
//       Itemcode = '',
//       Location = '',
//       Description = '',
//       mode = '',
//       Createdby = '',
//       updatedby = '',
//       branchid = 0,
//       BranchAccess = ''
//     } = req.body;

//     console.log(req.body)

//     // Get SQL connection
//     const pool = await connect();

//     // Execute Stored Procedure
//     const result = await pool.request()

//       .input('MachineId', sql.VarChar(sql.MAX), MachineId)
//       .input('MachineRFID', sql.VarChar(sql.MAX), MachineRFID)
//       .input('Itemcode', sql.VarChar(sql.MAX), Itemcode)
//       .input('Location', sql.VarChar(sql.MAX), Location)
//       .input('Description', sql.VarChar(sql.MAX), Description)
//       .input('mode', sql.VarChar(50), mode)
//       .input('Createdby', sql.VarChar(100), Createdby)
//       .input('updatedby', sql.VarChar(100), updatedby)
//       .input('branchid', sql.Int, branchid)
//       .input('BranchAccess', sql.VarChar(100), BranchAccess)

//       .execute('[Masters].[SP_MachineMaster]');

//     res.status(200).json(result.recordset || []);

//   } catch (error) {

//     console.error('MachineConfig Error:', error);

//     res.status(500).json({
//       status: 'ERROR',
//       message: error.message
//     });
//   }
// });

// server.post('/MachineConfig', async (req, res) => {
//   try {

//     const {
//       MachineId = '',
//       MachineRFID = '',
//       Itemcode = '',
//       Location = '',
//       Description = '',
//       mode = '',
//       Createdby = '',
//       updatedby = '',
//       branchid = 0,
//       BranchAccess = ''
//     } = req.body;

//     console.log(req.body)

//     // Get SQL connection
//     const pool = await connect();

//     // Execute Stored Procedure
//     const result = await pool.request()

//       .input('MachineId', sql.Int, MachineId ? parseInt(MachineId, 10) : null)
//       .input('MachineRFID', sql.VarChar(sql.MAX), MachineRFID)
//       .input('Itemcode', sql.VarChar(sql.MAX), Itemcode)
//       .input('Location', sql.VarChar(sql.MAX), Location)
//       .input('Description', sql.VarChar(sql.MAX), Description)
//       .input('mode', sql.VarChar(50), mode)
//       .input('Createdby', sql.Int, Createdby ? parseInt(Createdby, 10) : null)
//       .input('updatedby', sql.Int, updatedby ? parseInt(updatedby, 10) : null)
//       .input('branchid', sql.Int, branchid)
//       .input('BranchAccess', sql.VarChar(100), BranchAccess)

//       .execute('[Masters].[SP_MainMachineMaster]');

//     res.status(200).json(result.recordset || []);

//   } catch (error) {

//     console.error('MachineConfig Error:', error);

//     res.status(500).json({
//       status: 'ERROR',
//       message: error.message
//     });
//   }
// });
// server.post('/LocationConfig', async (req, res) => {
//   try {
//     const {
//       mode, LocationId, PlantCode,
//       LocationCode, LocationName, LocationType,
//       Zone, Row, Rack, Bin, Address,
//       Status, Remark, CreatedBy
//     } = req.body;

//     const query = db.q`EXEC LocationConfig
//             @mode         = ${mode || null},
//             @LocationId   = ${LocationId || null},
//             @PlantCode    = ${PlantCode || null},
//             @LocationCode = ${LocationCode || null},
//             @LocationName = ${LocationName || null},
//             @LocationType = ${LocationType || null},
//             @Zone         = ${Zone || null},
//             @Row          = ${Row || null},
//             @Rack         = ${Rack || null},
//             @Bin          = ${Bin || null},
//             @Address      = ${Address || null},
//             @Status       = ${Status || null},
//             @Remark       = ${Remark || null},
//             @CreatedBy    = ${CreatedBy || null}`;

//     const response = await db.query(query);
//     console.log("🚀 ~ response:", response)
//     // Always return 200 with recordset (empty array for INSERT/UPDATE/DELETE)
//     res.status(200).json(response.recordset || []);

//   } catch (err) {
//     console.error('LocationConfig error:', err);
//     res.status(500).json({ error: err.message });
//   }
// });



// UOMMaster

server.post('/DropdownUOMMaster', async (req, res) => {
  try {
    const { mode, UOMType, UOMCode, id, CreatedBy } = req.body
    // console.log('UOM Master', req.body)
    const DetailsQuery = `EXEC [Masters].[SP_UOMMaster] @id ='${id}',@UOMCode ='${UOMCode}',@UOMType ='${UOMType}', @CreatedBy ='${CreatedBy}',@mode ='${mode}'`
    // console.log('UOM Master', DetailsQuery)
    const response = await db.query(DetailsQuery)
    res.status(200).send(response.recordset);
  } catch (err) {
    console.log('Error on UOM Master', err)
    logErrorToFile('Error on UOM Master', err)
  }

})

server.post('/MouldTypeMaster', async (req, res) => {
  try {
    const {
      mode, MouldTypeId, MouldTypeCode,
      MouldTypeName, Description, Status, CreatedBy
    } = req.body;

    const pool = await connect();

    const result = await pool.request()
      .input('mode', sql.NVarChar, mode || '')
      .input('MouldTypeId', sql.Int, MouldTypeId || null)
      .input('MouldTypeCode', sql.NVarChar, MouldTypeCode || '')
      .input('MouldTypeName', sql.NVarChar, MouldTypeName || '')
      .input('Description', sql.NVarChar, Description || '')
      .input('Status', sql.NVarChar, Status || '')
      .input('CreatedBy', sql.NVarChar, CreatedBy || '')
      .execute('[Masters].[SP_MouldTypeMaster]');

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('MouldTypeMaster error:', err);
    res.status(500).json({ message: err.message });
  }
});

// server.post('/RackMaster', async (req, res) => {
//   try {
//     const { mode, RackId, RackCode, RackName, CreatedBy } = req.body;
//     console.log(req.body);

//     const pool = await connect();
//     const result = await pool.request()
//       .input('mode', sql.NVarChar, mode || '')
//       .input('RackId', sql.Int, RackId || null)
//       .input('RackCode', sql.NVarChar, RackCode || '')
//       .input('RackName', sql.NVarChar, RackName || '')
//       .input('CreatedBy', sql.NVarChar, CreatedBy || '')
//       .execute('[Masters].[SP_RackMaster]');

//     res.status(200).json(result.recordset);
//   } catch (err) {
//     console.error('RackMaster error:', err);
//     res.status(500).json({ message: err.message });
//   }
// })



// server.post('/RowMaster', async (req, res) => {
//   try {
//     const { mode, RowId, RowCode, RowName, CreatedBy } = req.body;
//     console.log(req.body);

//     const pool = await connect();
//     const result = await pool.request()
//       .input('mode', sql.NVarChar, mode || '')
//       .input('RowId', sql.Int, RowId || null)
//       .input('RowCode', sql.NVarChar, RowCode || '')
//       .input('RowName', sql.NVarChar, RowName || '')
//       .input('CreatedBy', sql.NVarChar, CreatedBy || '')
//       .execute('[Masters].[SP_RowMaster]');

//     res.status(200).json(result.recordset);
//   } catch (err) {
//     console.error('RackMaster error:', err);
//     res.status(500).json({ message: err.message });
//   }
// })



// ======================== SHIFT MASTER CRUD ========================



server.post('/LocationMaster', async (req, res) => {
  try {
    const {
      mode,
      LocationId,
      LocationCode,
      LocationName,
      CreatedBy
    } = req.body;

    console.log('[LocationMaster] req.body:', req.body);

    const pool = await connect();
    const result = await pool.request()
      .input('mode', sql.NVarChar, mode || '')
      .input('LocationId', sql.Int, LocationId || null)
      .input('LocationCode', sql.NVarChar, LocationCode || '')
      .input('LocationName', sql.NVarChar, LocationName || '')
      .input('CreatedBy', sql.NVarChar, CreatedBy || '')
      .execute('[Master].[SP_LocationMaster]');

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('[LocationMaster] error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ============================================================
//  RackMaste
// ============================================================
server.post('/RackMaster', async (req, res) => {
  try {
    const {
      mode,
      RackId,
      RackCode,
      RackName,
      PlantCode,
      CreatedBy
    } = req.body;

    console.log('[RackMaster] req.body:', req.body);

    const pool = await connect();
    const result = await pool.request()
      .input('mode', sql.NVarChar, mode || '')
      .input('RackId', sql.Int, RackId || null)
      .input('RackCode', sql.NVarChar, RackCode || '')
      .input('RackName', sql.NVarChar, RackName || '')
      .input('CreatedBy', sql.NVarChar, CreatedBy || '')
      .execute('[Masters].[SP_RackMaster]');

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('[RackMaster] error:', err);
    res.status(500).json({ message: err.message });
  }
});

server.post('/RowMaster', async (req, res) => {
  try {

    const {
      mode,
      RowId,
      RowCode,
      RowName,
      CreatedBy
    } = req.body;

    console.log('[RowMaster] req.body:', req.body);

    const pool = await connect();

    const result = await pool.request()
      .input('mode', sql.NVarChar, mode || '')
      .input('RowId', sql.Int, RowId || null)
      .input('RowCode', sql.NVarChar, RowCode || '')
      .input('RowName', sql.NVarChar, RowName || '')
      .input('CreatedBy', sql.NVarChar, CreatedBy || '')
      .execute('[Masters].[SP_RowMaster]');

    res.status(200).json(result.recordset || []);

  } catch (err) {

    console.error('[RowMaster] error:', err);

    res.status(500).json({
      message: err.message
    });
  }
});


// ============================================================
//  LocationConfig
// ============================================================
// ============================================================
//  LocationConfig
// ============================================================
server.post('/LocationConfig', async (req, res) => {
  try {
    const {
      mode,
      LinkId,
      LocationCode,
      LocationName,
      LocationRFID,
      RackId,
      RowId,
      Status,
      CreatedBy,
      Mappings,
      branchid,
      BranchAccess
    } = req.body;

    const pool = await connect();
    const request = pool.request()
      .input('mode', sql.NVarChar, mode || null)
      .input('LinkId', sql.Int, LinkId || null)
      .input('LocationCode', sql.NVarChar, LocationCode || null)
      .input('LocationName', sql.NVarChar, LocationName || null)
      .input('LocationRFID', sql.NVarChar, LocationRFID || null)
      .input('RackId', sql.Int, RackId || null)
      .input('RowId', sql.Int, RowId || null)
      .input('Status', sql.NVarChar, Status || null)
      .input('CreatedBy', sql.NVarChar, CreatedBy || null)
      .input('BranchId', sql.Int, branchid || 1)
      .input('BranchAccess', sql.NVarChar, BranchAccess || null);

    if (mode === 'I' && Array.isArray(Mappings) && Mappings.length > 0) {
      const tvp = new sql.Table();
      tvp.columns.add('LocationCode', sql.VarChar(50));
      tvp.columns.add('LocationName', sql.VarChar(100));
      tvp.columns.add('LocationRFID', sql.VarChar(100));
      tvp.columns.add('RackId', sql.Int);
      tvp.columns.add('RowId', sql.Int);

      Mappings.forEach(m => {
        tvp.rows.add(
          m.LocationCode || '',
          m.LocationName || '',
          m.LocationRFID || '',
          m.RackId || null,
          m.RowId || null
        );
      });

      request.input('Mappings', tvp);
    }

    const result = await request.execute('[Masters].[SP_LinkLocationMaster]');
    res.status(200).json(result.recordset || []);

  } catch (err) {
    console.error('[LocationConfig] error:', err);
    res.status(500).json({ error: err.message });
  }
});
server.post('/DropdownShiftMaster', async (req, res) => {
  try {
    const {
      mode, id,
      ShiftCode, ShiftType,
      ShiftStartTime, ShiftEndTime,
      CreatedBy
    } = req.body;

    const query = db.q`EXEC DropdownShiftMaster
            @mode           = ${mode || null},
            @id             = ${id || null},
            @ShiftCode      = ${ShiftCode || null},
            @ShiftType      = ${ShiftType || null},
            @ShiftStartTime = ${ShiftStartTime || null},
            @ShiftEndTime   = ${ShiftEndTime || null},
            @CreatedBy      = ${CreatedBy || null}`;

    const response = await db.query(query);
    res.status(200).json(response.recordset || []);

  } catch (err) {
    console.error('DropdownShiftMaster error:', err);
    logErrorToFile('DropdownShiftMaster error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ======================== SHIFT MASTER EXCEL UPLOAD ========================
server.post('/ShiftUploadData', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const { CreatedBy } = req.body;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    let uploadcount = 0;
    const unuploadedData = [];

    for (const row of data) {
      const { ShiftCode, ShiftType, ShiftStartTime, ShiftEndTime } = row;

      const trimString = (value) =>
        typeof value === 'string' ? value.trim() : value;

      const trimmedShiftCode = trimString(ShiftCode);
      const trimmedShiftType = trimString(ShiftType);
      const trimmedShiftStartTime = trimString(ShiftStartTime);
      const trimmedShiftEndTime = trimString(ShiftEndTime);

      let Reason = '';

      if (!trimmedShiftCode) Reason = 'Shift Code is required';
      else if (!trimmedShiftType) Reason = 'Shift Type is required';
      else if (!trimmedShiftStartTime) Reason = 'Shift Start Time is required';
      else if (!trimmedShiftEndTime) Reason = 'Shift End Time is required';

      if (!Reason) {
        // Duplicate check
        const checkQuery = db.q`EXEC DropdownShiftMaster
                    @mode      = ${'E_CHECK'},
                    @id        = ${null},
                    @ShiftCode = ${trimmedShiftCode},
                    @ShiftType = ${null},
                    @ShiftStartTime = ${null},
                    @ShiftEndTime   = ${null},
                    @CreatedBy      = ${null}`;

        // Direct duplicate check via inline query
        const dupCheck = await db.query(
          db.q`SELECT COUNT(*) AS Count FROM ShiftMaster WHERE ShiftCode = ${trimmedShiftCode}`
        );

        const dupCount = dupCheck.recordset[0]?.Count ?? 0;

        if (dupCount > 0) {
          Reason = 'Shift Code already exists';
        }
      }

      if (!Reason) {
        const insertQuery = db.q`EXEC DropdownShiftMaster
                    @mode           = ${'I'},
                    @id             = ${null},
                    @ShiftCode      = ${trimmedShiftCode},
                    @ShiftType      = ${trimmedShiftType},
                    @ShiftStartTime = ${trimmedShiftStartTime},
                    @ShiftEndTime   = ${trimmedShiftEndTime},
                    @CreatedBy      = ${CreatedBy}`;

        const insertResponse = await db.query(insertQuery);

        if (insertResponse.rowsAffected && insertResponse.rowsAffected[0] > 0) {
          uploadcount++;
        } else {
          Reason = 'Insert failed';
        }
      }

      if (Reason) {
        unuploadedData.push({
          ShiftCode: row.ShiftCode,
          ShiftType: row.ShiftType,
          ShiftStartTime: row.ShiftStartTime,
          ShiftEndTime: row.ShiftEndTime,
          Reason
        });
      }
    }

    if (unuploadedData.length > 0) {
      const unuploadedWorkbook = xlsx.utils.book_new();
      const unuploadedWorksheet = xlsx.utils.json_to_sheet(unuploadedData);
      xlsx.utils.book_append_sheet(
        unuploadedWorkbook,
        unuploadedWorksheet,
        'Unuploaded Shift Data'
      );

      const unuploadedFilePath = path.join(__dirname, 'unuploaded_Shift_data.xlsx');
      xlsx.writeFile(unuploadedWorkbook, unuploadedFilePath);

      res.status(200).json({
        message: 'Data uploaded with some errors',
        uploadcount,
        unuploadedFilePath: `/download/unuploaded_Shift_data.xlsx`
      });
    } else {
      res.status(200).json({
        message: 'All data uploaded successfully',
        uploadcount
      });
    }

  } catch (err) {
    console.error('ShiftUploadData error:', err);
    logErrorToFile('ShiftUploadData error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
server.post('/SupplierConfig', async (req, res) => {
  try {
    const {
      mode = '',
      Id = '',
      SupplierCode = '',
      SupplierName = '',
      ContactPerson = '',
      ContactNumber = '',
      Email = '',
      Address = '',
      City = '',
      State = '',
      Country = '',
      Pincode = '',
      GSTNumber = '',
      PANNumber = '',
      PaymentTerms = '',
      BankName = '',
      AccountNumber = '',
      IFSCCode = '',
      Status = '',
      Type = '',
      Remark = '',
      CreatedBy = '',
      branchid = 0,
      BranchAccess = ''
    } = req.body;

    const pool = await connect();

    const result = await pool.request()
      .input('mode', sql.VarChar(50), mode)
      .input('Id', sql.Int, Id ? parseInt(Id, 10) : null)
      .input('SupplierCode', sql.VarChar(50), SupplierCode || null)
      .input('SupplierName', sql.VarChar(200), SupplierName || null)
      .input('ContactPerson', sql.VarChar(100), ContactPerson || null)
      .input('ContactNumber', sql.VarChar(20), ContactNumber || null)
      .input('Email', sql.VarChar(150), Email || null)
      .input('Address', sql.VarChar(500), Address || null)
      .input('City', sql.VarChar(100), City || null)
      .input('State', sql.VarChar(100), State || null)
      .input('Country', sql.VarChar(100), Country || null)
      .input('Pincode', sql.VarChar(20), Pincode || null)
      .input('GSTNumber', sql.VarChar(20), GSTNumber || null)
      .input('PANNumber', sql.VarChar(20), PANNumber || null)
      .input('PaymentTerms', sql.VarChar(50), PaymentTerms || null)
      .input('BankName', sql.VarChar(100), BankName || null)
      .input('AccountNumber', sql.VarChar(50), AccountNumber || null)
      .input('IFSCCode', sql.VarChar(20), IFSCCode || null)
      .input('Status', sql.VarChar(20), Status || null)
      .input('Type', sql.VarChar(50), Type || null)
      .input('Remark', sql.VarChar(500), Remark || null)
      .input('CreatedBy', sql.VarChar(100), CreatedBy || null)
      .input('BranchId', sql.Int, branchid || 1)
      .input('BranchAccess', sql.VarChar(200), BranchAccess || null)
      .execute('[dbo].[SupplierConfig]');

    res.status(200).json(result.recordset || []);

  } catch (err) {
    console.error('SupplierConfig error:', err);
    logErrorToFile('SupplierConfig error:', err);
    res.status(500).json({ error: err.message });
  }
});
// ======================== EMPLOYEE MASTER CRUD ========================
// server.post('/EmployeeConfig', async (req, res) => {
//     try {
//         const {
//             mode, Id, CompanyCode, PlantCode,
//             Empid, FirstName, LastName,
//             DOJ, DOB, Department, Division, Section,
//             email, Designation, Contact,
//             Status, Type, Gender, Photo,
//             Location, ID, CreatedBy
//         } = req.body;

//         const query = db.q`EXEC SP_EmployeeMaster
//             @mode        = ${mode        || null},
//             @Id          = ${Id          || null},
//             @CompanyCode = ${CompanyCode || null},
//             @PlantCode   = ${PlantCode   || null},
//             @Empid       = ${Empid       || null},
//             @FirstName   = ${FirstName   || null},
//             @LastName    = ${LastName    || null},
//             @DOJ         = ${DOJ         || null},
//             @DOB         = ${DOB         || null},
//             @Department  = ${Department  || null},
//             @Division    = ${Division    || null},
//             @Section     = ${Section     || null},
//             @Email       = ${email       || null},
//             @Designation = ${Designation || null},
//             @Contact     = ${Contact     || null},
//             @Status      = ${Status      || null},
//             @Type        = ${Type        || null},
//             @Gender      = ${Gender      || null},
//             @Photo       = ${Photo       || null},
//             @Location    = ${Location    || null},
//             @ID        = ${ID        || null},
//             @CreatedBy   = ${CreatedBy   || null}`;

//         const response = await db.query(query);
//         res.status(200).json(response.recordset || []);

//     } catch (err) {
//         console.error('EmployeeConfig error:', err);
//         logErrorToFile('EmployeeConfig error:', err);
//         res.status(500).json({ error: err.message });
//     }
// });



// ======================== Mould MASTER CRUD ========================
server.post('/MouldMaster', async (req, res) => {
  try {
    const {
      mode = '',
      Id = '',
      ItemCode = '',
      WheelSize = '',
      ModuleSize = '',
      Grade = '',
      CreatedBy = '',
      UpdatedBy = '',
      branchid = 0,
      BranchAccess = ''
    } = req.body;

    const pool = await connect();

    const result = await pool.request()
      .input('mode', sql.NVarChar, mode || '')
      .input('Id', sql.Int, Id ? parseInt(Id, 10) : null)
      .input('ItemCode', sql.NVarChar, ItemCode || '')
      .input('WheelSize', sql.NVarChar, WheelSize || '')
      .input('ModuleSize', sql.NVarChar, ModuleSize || '')
      .input('Grade', sql.NVarChar, Grade || '')
      .input('BranchId', sql.Int, branchid || 1)
      .input('BranchAccess', sql.NVarChar, BranchAccess || null)
      .input('CreatedBy', sql.NVarChar, CreatedBy || '')
      .input('UpdatedBy', sql.NVarChar, UpdatedBy || '')
      .execute('[Masters].[SP_MouldMaster]');

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('MouldMaster error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ======================== FG MASTER EXCEL UPLOAD ========================
server.post('/FGMasterUploadData', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const { CreatedBy } = req.body;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    let uploadcount = 0;
    const unuploadedData = [];

    for (const row of data) {
      const {
        PlantCode, LocationCode,
        ItemCode, WheelSize,
        MouldSize, Grade
      } = row;

      const trimString = (v) => typeof v === 'string' ? v.trim() : v;

      const tPlantCode = trimString(PlantCode);
      const tLocationCode = trimString(LocationCode);
      const tItemCode = trimString(ItemCode);
      const tWheelSize = trimString(WheelSize);
      const tMouldSize = trimString(MouldSize);
      const tGrade = trimString(Grade);

      let Reason = '';

      if (!tPlantCode) Reason = 'PlantCode is required';
      else if (!tItemCode) Reason = 'ItemCode is required';
      else if (!tWheelSize) Reason = 'WheelSize is required';
      else if (!tMouldSize) Reason = 'MouldSize is required';
      else if (!tGrade) Reason = 'Grade is required';

      if (!Reason) {
        // Duplicate check
        const dupCheck = await db.query(
          db.q`SELECT COUNT(*) AS Count FROM FGMaster
                         WHERE ItemCode = ${tItemCode}
                           AND PlantCode = ${tPlantCode}`
        );
        if ((dupCheck.recordset[0]?.Count ?? 0) > 0) {
          Reason = 'ItemCode already exists for this PlantCode';
        }
      }

      if (!Reason) {
        const insertQuery = db.q`EXEC FGConfig
                    @mode         = ${'I'},
                    @id           = ${null},
                    @PlantCode    = ${tPlantCode},
                    @LocationCode = ${tLocationCode || null},
                    @ItemCode     = ${tItemCode},
                    @WheelSize    = ${tWheelSize},
                    @MouldSize    = ${tMouldSize},
                    @Grade        = ${tGrade},
                    @CreatedBy    = ${CreatedBy}`;

        const insertResponse = await db.query(insertQuery);
        if (insertResponse.rowsAffected && insertResponse.rowsAffected[0] > 0) {
          uploadcount++;
        } else {
          Reason = 'Insert failed';
        }
      }

      if (Reason) {
        unuploadedData.push({
          PlantCode: row.PlantCode,
          LocationCode: row.LocationCode,
          ItemCode: row.ItemCode,
          WheelSize: row.WheelSize,
          MouldSize: row.MouldSize,
          Grade: row.Grade,
          Reason
        });
      }
    }

    if (unuploadedData.length > 0) {
      const unuploadedWorkbook = xlsx.utils.book_new();
      const unuploadedWorksheet = xlsx.utils.json_to_sheet(unuploadedData);
      xlsx.utils.book_append_sheet(
        unuploadedWorkbook,
        unuploadedWorksheet,
        'Unuploaded FG Data'
      );
      const unuploadedFilePath = path.join(__dirname, 'unuploaded_FG_data.xlsx');
      xlsx.writeFile(unuploadedWorkbook, unuploadedFilePath);

      res.status(200).json({
        message: 'Data uploaded with some errors',
        uploadcount,
        unuploadedFilePath: `/download/unuploaded_FG_data.xlsx`
      });
    } else {
      res.status(200).json({
        message: 'All data Uploaded Successfully',
        uploadcount
      });
    }

  } catch (err) {
    console.error('FGMasterUploadData error:', err);
    logErrorToFile('FGMasterUploadData error:', err);
    res.status(500).json({ message: 'Internal server eroor' });
  }
});


// Last-resort safety net: a rejected promise that escapes a handler must
// never kill the whole API process (Node exits on unhandled rejections).
process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
  logErrorToFile('UNHANDLED REJECTION:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  logErrorToFile('UNCAUGHT EXCEPTION:', err);
});

// httpServer (not server) so the dashboard WebSocket shares this port
httpServer.listen(PORT, () => {
  console.log(`Server is connected ${PORT} `);
});
