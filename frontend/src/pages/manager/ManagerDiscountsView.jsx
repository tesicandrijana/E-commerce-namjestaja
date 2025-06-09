import { useState, useEffect } from 'react'
import DiscountList from '../../components/discount/DiscountList'
import axios from 'axios';
import './ManagerDiscountsView.css'
import { Checkbox, FormControlLabel } from '@mui/material';
import ProductSearchBar from '../../components/product/ProductSearchBar';

function ManagerDiscountsView() {
    const [discounts, setDiscounts] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortColumn, setSortColumn] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeOnly, setActiveOnly] = useState()
    const [editRowId, setEditRowId] = useState(null);
    const [discountCount, setDiscountCount] = useState()


    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };
    const fetchDiscounts = async () => {
        try {
            const res = await axios.get("http://localhost:8000/discounts", {
                params: {
                    offset: rowsPerPage * page,
                    limit: rowsPerPage,
                    sort_by: sortColumn || undefined,
                    sort_dir: sortOrder || undefined,
                    active: activeOnly ? true : undefined,
                    search: searchQuery || undefined,
                }
            })
            console.log("discounts", res.data)
            setDiscounts(res.data.discounts);
            setDiscountCount(res.data.count);
        }
        catch (e) {
            console.error(e);
        }
    }
    useEffect(() => {

        fetchDiscounts();
    }, [page, rowsPerPage, sortColumn, sortOrder, searchQuery, activeOnly])
    return (
        <div className="discounts-view-container">
            <div className='discounts-view-title'>
                <h2>View Discounts</h2>
            </div>
            <div className='discounts-table-nav'>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={activeOnly}
                            onChange={(e) => { setActiveOnly(e.target.checked); }}
                            color="primary"
                        />
                    }
                    label="Active Discounts"
                />

                <ProductSearchBar
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPage(0)
                    }}
                />
            </div>
            <div className='dicounts-table'>
                <DiscountList
                    discounts={discounts}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    handleChangePage={handleChangePage}
                    handleChangeRowsPerPage={handleChangeRowsPerPage}
                    sortColum={sortColumn}
                    sortOrder={sortOrder}
                    onSort={(columnId) => {
                        if (columnId === sortColumn) {
                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                            setSortColumn(columnId);
                            setSortOrder('asc');
                        }
                    }}
                    editRowId={editRowId}
                    setEditRowId={setEditRowId} 
                    fetchDiscounts={fetchDiscounts}
                    discountCount={discountCount}
                />
            </div>

        </div>
    )
}

export default ManagerDiscountsView