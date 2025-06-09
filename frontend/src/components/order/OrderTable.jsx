import { useState } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import OrderDetailsModal from '../../pages/customer/OrderDetailsModal';


const formatDate = (value) =>
     new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
    }).format(new Date(value));


const columns = [
  { id: 'id', label: 'Id', minWidth: 40, sortable: true },
  { id: 'customer_name', label: 'Customer', minWidth: 100},
  { id: 'address', label: 'Adress', minWidth: 80, align: 'center'},
  {id: 'city', label: 'City', minWidth: 130, align: 'center'},
  { id: 'postal_code', label: 'Postal Code', minWidth: 100,align: 'center' },
  { id: 'date', label: 'Date', minWidth: 100,format: (value) => formatDate(value), align: 'center', sortable: true },
  { id: 'status', label: 'Status', minWidth: 100,format:(value) => value==="pending" ? "unassigned" : value, align: 'center'},
  { id: 'total_price',  label: 'Total Price', minWidth: 100,format:(value) => `${Number(value).toFixed(2)}KM`, align: 'center', sortable: true},
  { id: 'delivery_person_name',  label: 'Delivery Person',format: (value) => value? value : '-', minWidth: 100, align: 'center'}

];
 

function OrderTable({orders, page, handleChangePage, rowsPerPage, handleChangeRowsPerPage,  onSort, sortColumn, sortOrder }) {
    const [orderDetailsModalOpen, setOrderDetailsModalOpen] = useState(false);
    const [order, setOrder] = useState();
    
     const handleOnClick = (order) =>{
      setOrder(order);
      setOrderDetailsModalOpen(true);
    }

 
  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: '0' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
               <TableCell padding="checkbox">
               {/*  <Checkbox
                  color="primary"
                  onClick={handleSelectAll}
                /> to do? dohvatiti sve ideve iz baze */}
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
            {orders?.orders?.map((row) => (
                <TableRow hover tabIndex={-1} key={row.id} onClick={() => handleOnClick(row)}>
                  <TableCell padding="checkbox">
                  </TableCell>
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <>

                        <TableCell key={column.id} align={column.align} >
                          { column.format ? (
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
        count={orders?.total}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
                 { orderDetailsModalOpen &&  <OrderDetailsModal order={order} onClose={() => setOrderDetailsModalOpen(false)}/>}

    </Paper>
  );
}

export default OrderTable