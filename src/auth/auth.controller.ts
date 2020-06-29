import { Router } from 'express';

import * as authService from './auth.service';

const router = Router();

router.post('/login', async (req, res) => {
  const { body } = req;

  const result = await authService.login(body).catch(e => {
    res.sendStatus(500);
    return;
  })

  if (!result || !result.status) {
    res.sendStatus(404)
    return;
  }

  res.json({
    success: result.status,
    data: result.data,
    message: 'Login Successful'
  })
})

router.post('/register', async (req, res) => {
  const { body } = req;

  const result = await authService.register(body).catch(e => {
    res.sendStatus(500);
    return;
  })

  if (!result || !result.status) {
    res.sendStatus(404)
    return;
  }

  res.json({
    success: result.status,
    message: 'Registered Successfully'
  })
})

export const AuthController = router;