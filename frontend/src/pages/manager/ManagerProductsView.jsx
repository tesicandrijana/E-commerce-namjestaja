import { useState, useEffect } from 'react'
import ProductTable from '../../components/product/ProductTable'
import './ManagerProductView.css'
import axios from 'axios'
import ProductFilter from '../../components/product/ProductFilter'
import ProductTableActions from '../../components/product/ProductTableActions'
import ProductsStats from '../../components/product/ProductsStats'
import ProductSearchBar from '../../components/product/ProductSearchBar'
import ProductForm from '../../components/product/ProductForm'
import ProductDetailDrawer from '../../components/product/ProductDetailDrawer'

const fetchStats = async (setProductStats) => {
  try {
    const res = await axios.get("http://localhost:8000/products/stats");
    setProductStats(res.data);
  }
  catch (e) {
    console.error(e)
  }
};


const fetchCategories = async (setCategories) => {
  try {
    const res = await axios.get("http://localhost:8000/categories");
    setCategories(res.data);
    console.log(res.data)
  }
  catch (e) {
    console.error(e)
  }
};

const fetchMaterials = async (setMaterials) => {
  try {
    const res = await axios.get("http://localhost:8000/materials");
    setMaterials(res.data);
  }
  catch (e) {
    console.error(e)
  }
};

function ManagerProductsView() {
  const [products, setProducts] = useState();
  const [categories, setCategories] = useState();
  const [materials, setMaterials] = useState();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [productStats, setProductStats] = useState(0);
  const [productCount, setProductCount] = useState(0)
  const [sortColumn, setSortColumn] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedMaterial, setSelectedMaterial] = useState()
  const [selectedCategory, setSelectedCategory] = useState()
  const [outOfStockOnly, setOutOfStockOnly] = useState()
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [formDrawerOpen, setFormDrawerOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [productId, setProductId] = useState();

  const openFormDrawer = () => {
    setFormDrawerOpen(true);
    setProductId(null);
  };

  const openDetailDrawer = (id) => {
    setDetailDrawerOpen(true);
    setProductId(id);
  };

  const closeDrawers = () => {
    setFormDrawerOpen(false);
    setDetailDrawerOpen(false);
    setProductId(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  useEffect(() => {
    fetchStats(setProductStats);
    fetchCategories(setCategories);
    fetchMaterials(setMaterials);
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/products/manager`, {
        params: {
          offset: rowsPerPage * page,
          limit: rowsPerPage,
          sort_by: sortColumn || undefined,
          sort_dir: sortOrder || undefined,
          out_of_stock: outOfStockOnly || undefined,
          material_id: selectedMaterial || undefined,
          category_id: selectedCategory || undefined,
          search: searchQuery || undefined
        }
      });
      setProducts(response.data.products);
      setProductCount(response.data.total);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, [page, rowsPerPage, sortColumn, sortOrder, selectedMaterial, selectedCategory, outOfStockOnly, searchQuery]);

  return (
    <div className='products-view-container'>

      <div className='products-view-title'>
        <h2>View Products</h2>
        <h5>Manage your product inventory effectively from this panel</h5>
        <p>Use filters and search to quickly find products by category, material, or stock status</p>
        <p>Click on column headers to sort, or select rows for bulk actions</p>
      </div>
      <div className="product-table-nav2">
        <ProductsStats stats={productStats} />
        <ProductTableActions
          setSelectedIds={setSelectedIds}
          selectedIds={selectedIds}
          fetchProducts={fetchProducts}
          handleOpenDrawer={openFormDrawer}
        />
      </div>
      <div className='product-table-nav'>
        <ProductFilter categories={categories} materials={materials} handleMaterialSelect={setSelectedMaterial} handleCategorySelect={setSelectedCategory} handleOutOfStockOnly={setOutOfStockOnly} />
        <ProductSearchBar value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(0)
          }
          }
        />
      </div>

      <ProductTable
        handleOpenDrawer={openDetailDrawer}
        products={products}
        page={page}
        handleChangePage={handleChangePage}
        rowsPerPage={rowsPerPage}
        handleChangeRowsPerPage={handleChangeRowsPerPage}
        productsCount={productCount}
        onSort={(columnId) => {
          if (columnId === sortColumn) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
          } else {
            setSortColumn(columnId);
            setSortOrder('asc');
          }
        }}
        sortColumn={sortColumn}
        sortOrder={sortOrder}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
      />
      <ProductForm open={formDrawerOpen} mode={'create'} onClose={closeDrawers} />

      <ProductDetailDrawer id={productId} open={detailDrawerOpen} onClose={closeDrawers} fetchProducts={fetchProducts} />
    </div>
  )
}

export default ManagerProductsView;