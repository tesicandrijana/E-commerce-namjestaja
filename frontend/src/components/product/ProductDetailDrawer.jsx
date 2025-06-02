import { Drawer } from '@mui/material'
import React from 'react'
import ProductDetail from './ProductDetail'

function ProductDetailDrawer({id, open,onClose}) {
  return (
    <Drawer
        anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: {
                        lg:'60%',
                        xs: 300,
                        md:'100%',
                    },
                    height:{
                        xs:'100%',
                        md: '100%',
                    },
                    padding: 0,
                    boxSizing: 'border-box',
                    borderRadius:' 15px 0px 0px 15px '
                }
            }}
    >
        <ProductDetail id={id}/>
    </Drawer>
  )
}

export default ProductDetailDrawer