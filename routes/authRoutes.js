import express from 'express';

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: 'Please Enter Username and Password' });
  }

  const expectedUsername = 'shamil';
  const expectedPassword = 'shamil';

  if (username === expectedUsername && password === expectedPassword) {
    const loginAction = {
      username: 'shamil',
      password: 'shamil',
    };
    return res.status(200).json({ loginAction, message: 'Login Successfully' });
  } else {
    return res.status(401).json({ message: 'Invalid Username or Password' });
  }
});

router.put('/change-password', (req, res) => {
  const {password, newPassword} = req.body;
   console.log(req.body,"request:");

  if (!password ||  !newPassword) {
    return res
      .status(400)
      .json({message: 'Please Provide current password, and new password'});
  }

  const expectedPassword = users[password];

  if (expectedPassword !== password) {
    return res.status(401).json({message: 'Current password is incorrect'});
  }

  if (newPassword.length < 6) {
    return res.status(400).json({message: 'New password must be at least 6 characters long'});
  }

  users[password] = newPassword;

  return res.status(200).json({message: 'Password changed successfully'});
});

export default router;
