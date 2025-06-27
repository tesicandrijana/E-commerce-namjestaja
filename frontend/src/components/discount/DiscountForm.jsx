import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
import UniversalModal from '../modals/UniversalModal';
import axios from 'axios';
import "./DiscountFormModal.css"
import "../modals/RestockModal.css"
import { Alert, Button } from '@mui/material'

function DiscountForm({ setSelectedIds, productIds, onClose, fetchProducts }) {
    const [errorMessage, setErrorMessage] = useState("");
    const { register, handleSubmit, control, formState: { errors } } = useForm();
    const [messageModal, setMessageModal] = useState(false);
    const [message, setMessage] = useState("");

    const onSubmit = async (data) => {
        try {
            const discounts = productIds.map((productId) => ({
                product_id: productId,
                amount: data.amount,
                start_date: data.startDate,
                end_date: data.endDate,
            }))
            const res = await axios.post("http://localhost:8000/discounts", discounts)
            setMessageModal(true);
            setMessage("Discount added successfully");
            setErrorMessage("");
            setSelectedIds([]);
            onClose();

            fetchProducts();

        }
        catch (e) {
            console.error(e);
            if (e.response && e.response.data && e.response.data.detail) {
                setErrorMessage(e.response.data.detail);
            } else {
                setErrorMessage('Unknown error occurred');
            }
        }
    }


    return (
        <div className="discount-modal-overlay">
            <div className="discount-modal-content">
                <h2>Add discount</h2>
                {errorMessage !== "" && (
                    <Alert severity="error" style={{ whiteSpace: 'pre-line' }}>
                        {typeof errorMessage === "string" ? errorMessage : 'Unknown error'}
                    </Alert>
                )}
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

                    <div className="modal-btns"><Button variant="outlined" type="submit">Submit</Button><Button variant="contained" onClick={onClose}>Cancel</Button></div>
                </form>


            </div>

            {messageModal && (
                <UniversalModal
                    isOpen={messageModal}
                    onClose={() => setMessageModal(false)}
                    title="New Discount"
                    message={message}
                    type="success"
                />
            )}
        </div>
    )
}

export default DiscountForm