import { useState, useEffect } from 'react'
import './ManagerReviewsView.css'
import axios from 'axios'
import Rating from '@mui/material/Rating';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import IconButton from '@mui/material/IconButton';


import ReviewCard from '../../components/review/ReviewCard'
import ProductSearchBar from '../../components/product/ProductSearchBar';

function ManagerReviewsView() {
    const [reviews, setReviews] = useState([]);
    const [ratingFilter, setRatingFilter] = useState();
    const [sortBy, setSortBy] = useState("rating");
    const [sortOrder, setSortOrder] = useState("asc");
    const [searchQuery, setSearchQuery] = useState();
       const fetchReviews = async () => {
            try {
                const res = await axios.get("http://localhost:8000/reviews/manager", {
                    params: {
                        offset: 0,
                        limit: 100,
                        sort_by: sortBy || undefined,
                        sort_dir: sortOrder || undefined,
                        rating: ratingFilter || undefined,
                        search: searchQuery || undefined
                    }

                });
                setReviews(res.data);
                console.log(res.data);
            }
            catch (e) {
                console.error(e);
            }
        }
    useEffect(() => {
         fetchReviews();

    },[sortBy, sortOrder, searchQuery, ratingFilter])

    return (
        <div className='reviews-view-container'>
            <div className='reviews-view-title'>
                <h2>Reviews</h2>
            </div>

            <div className='reviews-view-nav'>
                <div className="select-group">
                    <Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        variant="standard"
                        disableUnderline
                        sx={{
                            minWidth: 120
                        }}
                    >
                        <MenuItem value={"rating"}>Rating</MenuItem>
                        <MenuItem value={"created_at"}>Date Posted</MenuItem>
                    </Select>

                    <IconButton onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}>
                        {sortOrder === 'asc' ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </div>

                <Rating
                    name="rating-filter"
                    value={ratingFilter}
                    onChange={(event, newValue) => {
                        setRatingFilter(newValue);
                    }}
                />

                <ProductSearchBar 
                value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
          />
            </div>

            <div className='review-card-list'>
                {reviews?.map((review) => (
                    <ReviewCard key={review.id} review={review} fetchReviews={fetchReviews}/>
                ))}
            </div>
        </div>
    );
}

export default ManagerReviewsView;
