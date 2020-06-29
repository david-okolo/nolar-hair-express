import { Router } from 'express';
import * as storeService from './store.service';
import { upload } from '../utils/multer';

const router = Router();

router.get('/list', async (req, res) => {
  const productList = await storeService.findAll();

  res.json({
      success: true,
      message: 'Product list successfully fetched',
      data: productList
  });
})

router.post('/verify', async (req, res) => {
  const { body } = req;

  const result = await storeService.verify(body.reference).catch(e => {
    console.log(e)
    res.status(500).json({
      message: 'Error occured verifying payment'
    })
  })

  if(!result) return;

  res.json({
      success: result.verified,
      status: result.status,
      message: result.verified ? 'Payment Successful' : 'Payment Not Successful',
      ...result.errors.length > 0 && {errors: result.errors}
  });
})

router.post('/pay', async (req, res) => {

  const { body } = req;

  const result = await storeService.buyProducts(body).catch(e => {
    res.sendStatus(500)
    return;
  })

  if (result) {
    res.json({
      success: true,
      data: result,
      message: 'Payment Initialized'
    });
    return;
  }

  res.json({
    success: false
  })
})

router.post('/addProduct', upload.single('productImage'), async (req, res) => {

  const { body, file } = req;

  const { imageUrl, ...rest } = body;

  const created = await storeService.createProduct({
      ...rest,
      imageUrl: file.path.substr(6) //removes the public
  }).catch(e => {
    res.status(500).json({
      message: 'Error creating product. Try again later'
    })
  })

  if (!created) {
    res.status(500).json({
      message: 'Error creating product. Try again later'
    })
    return;
  }

  res.json({
    success: true,
    message: 'Successfully created'
  })
})

router.post('/addCategory', async (req, res) => {
  const { body } = req;

  const result = await storeService.createStoreCategory(body).catch(e => {
    res.status(500).json({
      message: 'Error creating category'
    })
  });

  if (!result) {
    return;
  }

  res.json({
    success: true,
    message: 'Successfully created'
  })

})

router.use('/*', (req, res) => {
  res.sendStatus(404);
})

export const StoreController = router;