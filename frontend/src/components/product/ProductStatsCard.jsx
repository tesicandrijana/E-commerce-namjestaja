import { Card, CardContent, Typography, Box } from '@mui/material';

function ProductStatsCard({ title, value, icon }) {
  return (
    <Card sx={{ minWidth: 200, m: 0, borderRadius: 0}}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2}  >
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h6">{value}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default ProductStatsCard;
