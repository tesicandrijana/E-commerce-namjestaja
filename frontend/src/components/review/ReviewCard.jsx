import React, { useEffect, useState } from 'react'
import './ReviewCard.css'
import Avatar from '@mui/material/Avatar';
import Rating from '@mui/material/Rating';
import ProductDetailDrawer from '../product/ProductDetailDrawer';
import { IconButton, Snackbar } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';


function stringToColor(string) {
    let hash = 0;
    let i;
    console.log(string)
    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
}

function stringAvatar(name = '') {
    const parts = name.trim().split(' ').filter(Boolean);
    let initials = '';

    if (parts.length === 1) {
        initials = parts[0][0];
    } else if (parts.length >= 2) {
        initials = `${parts[0][0]}${parts[1][0]}`;
    }
    return {
        sx: {
            bgcolor: stringToColor(name),
        },
        children: initials.toUpperCase(),
    };
}
const formatted = (date) => new Date(date).toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
});



function ReviewCard({ review, fetchReviews }) {
    const [productDetailDrawer, setProductDetailDrawer] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState();

    const deleteReview = async (id) => {
        try {
            await axios.delete(`http://localhost:8000/reviews/${id}`)
            setSnackbarMessage("Review deleted successfully.")
            setSnackbarOpen(true);
            fetchReviews();
        }
        catch (e) {
            console.error(e);
        }
    }

    return (
        <div className='review-card-container' >
            <div className='review-card-avatar'>
                <Avatar {...stringAvatar(review?.customer?.name)} />
            </div>
            <div className='review-card-content'>
                <div className='review-card-title' onClick={() => setProductDetailDrawer(true)} >
                    <div>
                        <h3>{review.customer?.name}<Rating name="read-only" value={review.rating} readOnly size="small" /></h3>
                        <p>{review.product?.name}</p>
                    </div>
                    <p className="review-card-date">{formatted(review.created_at)}</p>
                </div>
                <div className='review-card-details'>
                    <p>{review.comment}</p>
                    <IconButton onClick={() => deleteReview(review.id)}>
                        <DeleteIcon />
                    </IconButton>
                </div>
            </div>

            <ProductDetailDrawer open={productDetailDrawer} id={review.product_id} onClose={() => setProductDetailDrawer(false)} />
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <div>
                    {typeof snackbarMessage === "string" ? snackbarMessage : 'Unknown error'}

                </div>
            </Snackbar>

        </div>
    )
}

export default ReviewCard