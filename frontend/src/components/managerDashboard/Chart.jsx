import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';


function Chart() {
    const [data, setData] = useState([]);
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('http://localhost:8000/orders/orders-per-month');
                setData(res.data);
                console.log(res.data);
            }
            catch (e) {
                console.error(e);
            }
        }
        fetchStats();
    }, [])

    return (
        <div className="stats-box">
            <h4>Orders Per Month</h4>
            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#f4a300" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

export default Chart