import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Checkbox from '@mui/material/Checkbox';


const columns = [
  { id: 'checkbox', label: '', minwidth: 10, sortable: false },
  { id: 'images', label: 'Image', minWidth: 40, sortable: false },
  { id: 'name', label: 'Name', minWidth: 100, sortable: true },
  { id: 'price', label: 'Price', minWidth: 80, format: (value) => `${Number(value).toFixed(2)}KM`, align: 'center', sortable: true },
  { id: 'active_discount', label: 'Active Discount', minWidth: 130, format: (value) => value != 0 ? `${value}%` : 'No discount', align: 'center', sortable: true },
  { id: 'rating', label: 'Rating', minWidth: 100, format: (value) => value !== null ? Number(value).toFixed(2) : '—', align: 'center', sortable: true },
  { id: 'order_count', label: 'Sold', minWidth: 100, align: 'center', sortable: true },
  { id: 'quantity', label: 'Stock', minWidth: 100, align: 'center', sortable: true },
];


function ProductTable({ handleOpenDrawer, products, page, handleChangePage, rowsPerPage, handleChangeRowsPerPage, productsCount, onSort, sortColumn, sortOrder, selectedIds, setSelectedIds }) {
  const handleCheckboxChange = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: '0' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
              </TableCell>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                  sortDirection={sortColumn === column.id ? sortOrder : false}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={sortColumn === column.id}
                      direction={sortColumn === column.id ? sortOrder : 'asc'}
                      onClick={() => onSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>


              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {products?.map((row) => (
              <TableRow hover tabIndex={-1} key={row.id}>
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    checked={selectedIds.includes(row.id)}
                    onChange={() => handleCheckboxChange(row.id)}
                  />
                </TableCell>
                {columns.map((column) => {
                  const value = row[column.id];
                  return (
                    <>

                      <TableCell key={column.id} align={column.align} onClick={() => handleOpenDrawer(row.id)}>
                        {column.id === 'images' ? (
                          <img
                            src={`http://localhost:8000/static/product_images/${value[0]?.image_url}`}
                            alt={row.name}
                            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 4 }}
                          />

                        ) : column.format ? (
                          column.format(value)
                        ) : (
                          value
                        )}
                      </TableCell>
                    </>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={productsCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}

export default ProductTable