import { Grid } from '@mui/material';
import ProductStatsCard from './ProductStatsCard';
import InventoryIcon from '@mui/icons-material/Inventory';
import StarIcon from '@mui/icons-material/Star';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ProductTableActionsPanel from './ProductTableActions';

function ProductsStats({stats}) {
  return (
    <Grid container margin="0px" spacing={2} display="flex" sx={{ 
      width:{
        md:'100%',
        lg:'60%'
      },
      mb: 3}}>
      <Grid item><ProductStatsCard title="Total Products" value={stats.total}/></Grid>
      <Grid item><ProductStatsCard title="Average Rating" value={stats.avg_rating} /></Grid>
      <Grid item><ProductStatsCard title="Out Of Stock" value={stats.out_of_stock_count}  /></Grid>
    </Grid>
  );
}

export default ProductsStats;
