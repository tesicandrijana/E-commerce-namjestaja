import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
import axios from 'axios';
import "./DiscountFormModal.css"
import "../modals/RestockModal.css"
import { Alert, Button } from '@mui/material'

function DiscountForm({ setSelectedIds, productIds, onClose }) {
    const [errorMessage, setErrorMessage] = useState();
    const { register, handleSubmit, control, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        try {
            const discounts = productIds.map((productId) => ({
                product_id: productId,
                amount: data.amount,
                start_date: data.startDate,
                end_date: data.endDate,
            }))
            const res = await axios.post("http://localhost:8000/discounts", discounts)
            onClose();
            setSelectedIds([]);
        }
        catch (e) {
            console.error(e);
            setErrorMessage(e.response.data.detail);
        }
    }


    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Add discount</h2>

                <form onSubmit={handleSubmit(onSubmit)} className="discount-form">
                    <label>
                        Discount in percentage:
                        <input type="number" {...register("amount", { required: true })} />
                    </label>
                    <label>
                        Start date:
                        <input type="date" {...register("startDate", { required: true })} />
                    </label>
                    <label>
                        End date:
                        <input type="date"{...register("endDate", { required: true })} />
                    </label>
                    {errorMessage && (
                        <Alert severity="error" style={{ whiteSpace: 'pre-line' }}>
                            {typeof errorMessage === "string" ? errorMessage : 'Unknown error'}
                        </Alert>
                    )}
                    <div className="modal-btns"><Button variant="outlined" type="submit">Submit</Button><Button variant="contained" onClick={onClose}>Cancel</Button></div>
                </form>


            </div>
        </div>
    )
}

export default DiscountForm