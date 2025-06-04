import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
/* import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel'; */
import { Snackbar, Alert, Button, Chip, TextField, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel } from '@mui/material';
import ProductDetailDrawer from '../product/ProductDetailDrawer';
import axios from 'axios';

const formatDate = (value) =>
     new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
    }).format(new Date(value));

const isDiscountActive = (amount, start, end) => {
    const now = new Date();
    return new Date(start) <= now && new Date(end) >= now && amount > 0;
};

function DiscountList({ discountCount, fetchDiscounts,discounts, page, rowsPerPage, handleChangePage, handleChangeRowsPerPage, sortColumn, sortOrder, onSort, editRowId, setEditRowId }) {
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState();
    const [productId, setProductId] = useState();
    const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
    const [editedStartDate, setEditedStartDate] = useState();
    const [editedEndDate,setEditedEndDate] = useState()

    const openDetailDrawer = (id) => {
        setDetailDrawerOpen(true);
        setProductId(id);
    };
    const closeDrawer = () => {
        setDetailDrawerOpen(false);
        setProductId(null);
    };

    const { control, handleSubmit, reset, getValues } = useForm();

    const startEditing = (row) => {
        setEditRowId(row.id);
        reset({
            amount: row.amount,
            start_date: row.start_date,
            end_date: row.end_date
        });
    };

    const cancelEditing = () => {
        setEditRowId(null);
        reset();
    };

    const saveRow = async (id) => {
        const data = getValues();
        const payload = {
            amount: Number(data.amount),
            start_date: editedStartDate,
            end_date: editedEndDate
        }
        console.log(payload)
        try {
            await axios.put(`http://localhost:8000/discounts/${id}`,payload);

            fetchDiscounts();
            setEditRowId(null);
            setEditedEndDate(null);
            setEditedStartDate(null);
        } catch (error) {
            console.error('Failed to save row', error.response.data.detail);
            setSnackbarOpen(true);
            setErrorMessage(error.response.data.detail);
        }
    };

    const columns = [
        { id: 'is_active', label: '', align: 'center' },
        { id: 'id', label: 'ID', align: 'left', sortable: true },
        {
            id: 'product',
            label: 'Product',
            align: 'left',
            format: (value) => value.name,
            sortable: true
        },
        { id: 'amount', label: '%', align: 'left', sortable: true, editable: true },
        {
            id: 'start_date',
            label: 'Start Date',
            align: 'center',
            format: (value) => formatDate(value),
            sortable: true,
            editable: true
        },
        {
            id: 'end_date',
            label: 'End Date',
            align: 'center',
            format: (value) => formatDate(value),
            sortable: true,
            editable: true
        },
        { id: 'actions', label: '', align: 'center' }
    ];
    const onChangeStartDate=(date)=>{
        setEditedStartDate(date);
    }
    const onChangeEndDate=(date)=>{
        setEditedEndDate(date);
    }

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: '0' }}>
            <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    align={column.align}
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
                        {discounts?.map((row) => {
                            const isEditing = editRowId === row.id;
                            return (
                                <TableRow hover key={row.id}>
                                    {columns.map((column) => {
                                        const value = row[column.id];

                                        if (column.id === 'is_active') {
                                            return (
                                                <TableCell key={column.id} align={column.align}>
                                                    {isDiscountActive(row.amount, row.start_date, row.end_date) && (
                                                        <Chip label="Active" color="success" size="small" />
                                                    )}
                                                </TableCell>
                                            );
                                        }

                                        if (column.id === 'actions') {
                                            return (
                                                <TableCell key={column.id} align="center">
                                                    {isEditing ? (
                                                        <>
                                                            <Button onClick={() => saveRow(row.id)} size="small">Save</Button>
                                                            <Button onClick={cancelEditing} size="small" color="error">Cancel</Button>
                                                        </>
                                                    ) : (
                                                        <Button onClick={() => startEditing(row)} size="small">Edit</Button>
                                                    )}
                                                </TableCell>
                                            );
                                        }

                                        if (isEditing && column.editable) {
                                            return (
                                                <TableCell key={column.id} align={column.align}>
                                                    <Controller
                                                        name={column.id}
                                                        control={control}
                                                        defaultValue={value}
                                                        render={({ field }) => (
                                                            <TextField
                                                                {...field}
                                                                size="small"
                                                                type={column.id === 'amount' ? 'number' : 'date'}
                                                                fullWidth
                                                                onChange={(e) => {
                                                                    field.onChange(e.target.value);

                                                                    if(column.id === "start_date")
                                                                        onChangeStartDate(e.target.value);
                                                                    else if(column.id === "end_date")
                                                                        onChangeEndDate(e.target.value);
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                </TableCell>
                                            );
                                        }

                                        return (
                                            <TableCell
                                                key={column.id}
                                                align={column.align}
                                                onClick={() => openDetailDrawer(row.product_id)}
                                            >
                                                {column.format ? column.format(value) : value}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={discountCount}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
            <ProductDetailDrawer id={productId} open={detailDrawerOpen} onClose={closeDrawer} />
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity="error" onClose={() => setSnackbarOpen(false)}>
                    {typeof errorMessage==="string" ? errorMessage : 'Unknown error'}
                </Alert>
            </Snackbar>

        </Paper>
    );
}

export default DiscountList;
