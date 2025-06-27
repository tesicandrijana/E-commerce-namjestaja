import React, { useEffect, useState } from 'react'
import StatCard from "./StatCard";
import axios from 'axios';

function Stats() {
    const [data, setData] = useState({
        total_products: "",
        discounts: "",
        most_bought_this_month: "",
        products_sold: ""
    })

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('http://localhost:8000/products/manager-dashboard-stats');
                setData(res.data);
            }
            catch (e) {
                console.error(e);
            }
        }
        fetchStats();
    }, [])

    return (
        <div className='stats-grid'>
            <StatCard title="Total Products" value={data.total_products} color="#f4a300" />
            <StatCard title="Products Sold" value={data.products_sold} color="#ff8c66" />
            <StatCard title="Discounted" value={data.discounted} color="#3e93b4" />
            <StatCard title="Most Bought This Month" value={data.most_bought_this_month} color="#9b59b6" />
        </div>
    )
}

export default Stats