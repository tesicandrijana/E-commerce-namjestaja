import {useState} from 'react';
import { Box, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ConfirmModal from '../modals/ConfirmModal';
import axios from 'axios';
import DiscountForm from '../discount/DiscountForm';

function ProductTableActionsPanel({selectedIds, setSelectedIds, fetchProducts,handleOpenDrawer}) {
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const handleBulkDelete = async() => {
    try{
      await axios.delete("http://localhost:8000/products/bulk-delete", 
        {data:{ids:selectedIds}}
      )
      fetchProducts();
      setSelectedIds([]);
    }
    catch(e){
      console.error(e);
    }
  }
  return (
    <Box display="flex" gap={1}  sx={{
      display:'flex',
      flexWrap:"wrap",
      justifyContent:{
        xs:"start",
        lg:"end"

      }, 
      flexDirection:{
        sm:"column",
        lg:'row'
      },
      mb:3
    }} height="2rem">
      <Button disabled={selectedIds.length === 0} variant="outlined"color="error" startIcon={<DeleteIcon />} onClick={()=>setIsConfirmModalOpen(true)}>
        Delete
      </Button>
      <Button variant="outlined" disabled={selectedIds.length === 0}  startIcon={<AddIcon />} onClick={()=>setIsDiscountModalOpen(true)}>
       Add Discount
      </Button>
      <Button variant="outlined"  startIcon={<AddIcon />} onClick={handleOpenDrawer}>
        Add Product
      </Button>

      {isConfirmModalOpen && (
              <ConfirmModal
              isOpen={isConfirmModalOpen}
              title="Delete Confirmation"
              message={`Are you sure you want to delete these products?`}
              onConfirm={() => {handleBulkDelete(); setIsConfirmModalOpen(false);}}
              onCancel={() => setIsConfirmModalOpen(false)}
              confirmText="Delete"
              cancelText="Cancel"
            />
            )}
      {isDiscountModalOpen && (
        <DiscountForm
          setSelectedIds={setSelectedIds}
          productIds={selectedIds}
          onClose={()=>setIsDiscountModalOpen(false)}
         />

      )}
    </Box>
  );
}

export default ProductTableActionsPanel;
