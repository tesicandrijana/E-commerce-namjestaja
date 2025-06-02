import {useState} from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from '@mui/material';

function ProductFiltersPanel({ categories, materials, handleMaterialSelect,handleCategorySelect, handleOutOfStockOnly }) {
  const [category, setCategory] = useState('');
  const [material, setMaterial] = useState('');
  const [outOfStockOnly, setOutOfStockOnly] = useState(false);

  return (
    <Box
      className="product-filter-container"
      display="flex"
      flexWrap="wrap"
      gap={1}
      alignItems="center"
    >
      {/* Category Filter */}
      <FormControl size="small" sx={{ 
        minWidth: 150,
      }} >
        <InputLabel id="category-label">Category</InputLabel>
        <Select
          labelId="category-label"
          value={category}
          label="Category"
          onChange={(e) => {setCategory(e.target.value); handleCategorySelect(e.target.value)}}
        >
          <MenuItem value=""><em>All</em></MenuItem>
          {categories?.map((category) => (
            <MenuItem value={category.id}>{category.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Material Filter */}
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel id="material-label">Material</InputLabel>
        <Select
          labelId="material-label"
          value={material}
          label="Material"
          onChange={(e) => {setMaterial(e.target.value); handleMaterialSelect(e.target.value);}}
        >
          <MenuItem value=""><em>All</em></MenuItem>
          {materials?.map((material) => (
            <MenuItem value={material.id}>{material.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Out of Stock Filter */}
      <FormControlLabel
        control={
          <Checkbox
            checked={outOfStockOnly}
            onChange={(e) => {setOutOfStockOnly(e.target.checked); handleOutOfStockOnly(e.target.checked);}}
            color="primary"
          />
        }
        label="Out of Stock"
      />
    </Box>
  );
}

export default ProductFiltersPanel;
