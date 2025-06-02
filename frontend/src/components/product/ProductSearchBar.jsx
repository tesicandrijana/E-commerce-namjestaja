import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

function ProductSearchBar({ value, onChange }) {
  return (
    <TextField
      variant="outlined"
      placeholder="Search products..."
      size="small"
      value={value}
      onChange={onChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
    />
  );
}

export default ProductSearchBar;
