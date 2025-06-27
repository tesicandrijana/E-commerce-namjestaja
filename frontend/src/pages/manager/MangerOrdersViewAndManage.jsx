import axios from 'axios'
import { useEffect, useState } from 'react'
import OrderTable from '../../components/order/OrderTable'
import ManagerOrders from './ManagerOrders';
import './ManagerOrdersViewAndManage.css'
import ProductSearchBar from '../../components/product/ProductSearchBar'
import { Tabs, Tab } from '@mui/material'


function MangerOrdersViewAndManage() {
  const [orders, setOrders] = useState()
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchQuery, setSearchQuery] = useState();
  const [status, setStatus] = useState();
  const [activeTab, setActiveTab] = useState(0);


  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("http://localhost:8000/orders/manager", {
          params: {
            offset: rowsPerPage * page,
            limit: rowsPerPage,
            sort_by: sortColumn || undefined,
            sort_dir: sortOrder || undefined,
            status: status || undefined,
            search: searchQuery || undefined
          }

        });
        setOrders(res.data);
      }
      catch (e) {
        console.error(e);
      }
    }

    fetchOrders()
  }, [page, rowsPerPage, sortColumn, sortOrder, status, searchQuery])
  return (
    <div className='orders-view-container'>


      <div className='orders-view-title'>
        <h1 className="orders-title">View and Manage Orders</h1>
        <h5>Switch between managing deliveries and reviewing all orders</h5>
        <p>Use the search bar to find orders by Order ID, customer name, or delivery person</p>
        <p>Assign deliveries easily using drag-and-drop</p>
      </div>
      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} centered>
        <Tab label="Manager Orders" />
        <Tab label="Order Table" />
      </Tabs>

      {activeTab === 0 &&
        <div >
          <ManagerOrders />
        </div>}
      {activeTab === 1 &&
        <>
          <div className='orders-table-nav'>
            {/* <ProductFilter categories={categories} materials={materials} handleMaterialSelect={setSelectedMaterial} handleCategorySelect={setSelectedCategory} handleOutOfStockOnly={setOutOfStockOnly} />
       */} <ProductSearchBar
              placeholder={"Search by ID or name… "}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0)
              }
              }
            />
          </div>
          <OrderTable
            orders={orders}
            page={page}
            handleChangePage={handleChangePage}
            rowsPerPage={rowsPerPage}
            handleChangeRowsPerPage={handleChangeRowsPerPage}

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
          />
        </>}
    </div>
  )
}

export default MangerOrdersViewAndManage