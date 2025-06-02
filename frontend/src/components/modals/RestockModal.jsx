import axios from 'axios';
import React from 'react';
import { useForm } from 'react-hook-form';
import './RestockModal.css';

function RestockModal({ id,onClose }) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm();

    const submitHandler = async (data) => {
        try {
            await axios.patch(`http://localhost:8000/products/${id}/restock`, data);
            onClose();
        }
        catch (e) {
            console.log(e)
        }
        reset();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Restock Product</h2>
                <form onSubmit={handleSubmit(submitHandler)}>
                    <label className="restock-label">
                        Enter quantity to add:
                        <input
                            className="restock-input"
                            type="number"
                            {...register('added', { required: true, min: 1 })}
                            placeholder="e.g. 10"
                        />
                    </label>
                    {errors.added && (
                        <p className="error-msg">Please enter a quantity of at least 1.</p>
                    )}

                    <div className="modal-btns">
                        <button type="button" className="action-btn cancel-restock-btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="action-btn submit-btn">
                            Restock
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default RestockModal;
