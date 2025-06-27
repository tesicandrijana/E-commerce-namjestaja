import { Grid } from '@mui/material';
import ProductStatsCard from './ProductStatsCard';
import StatCard from '../managerDashboard/StatCard';

function ProductsStats({ stats }) {
  return (
    <Grid container margin="0px" spacing={2} display="flex" sx={{
      width: {
        md: '100%',
        lg: '60%'
      },
      mb: 3
    }}>
      <Grid item><StatCard title="Total Products" value={stats.total} color="#f4a300" /></Grid>
      <Grid item><StatCard title="Average Rating" value={stats.avg_rating ? Number(stats.avg_rating).toFixed(2) : ""} color="#ff8c66" /></Grid>      <Grid item><StatCard title="Out Of Stock" value={stats.out_of_stock_count} color="#3e93b4" /></Grid>
    </Grid>
  );
}

export default ProductsStats;
