import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import './ProductForm.css';
import Dropzone from 'react-dropzone'
import axios from 'axios'

function ProductForm({ mode }) {
    const [categories, setCategories] = useState()
    const [materials, setMaterials] = useState()
    const { id } = useParams()
    const [pictures, setPictures] = useState()
    const [droppedFiles, setDroppedFiles] = useState([]);

    const navigate = useNavigate()

    const { register, handleSubmit, reset } = useForm();

    const createProduct = async (formData) => {

        try {
            const response = await axios.post("http://localhost:8000/products", formData,
                {
                    headers: {
                        "Content-type": "multipart/form-data",
                    }
                })

            setPictures([]);
        }
        catch (e) {
            console.log(e);
        }
        finally {
            reset()
        }
    }

    const editProduct = async (formData) => {
        console.log(formData)
        try {
            const response = await axios.patch(`http://localhost:8000/products/${id}`, formData,
                {
                    headers: {
                        "Content-type": "multipart/form-data",
                    }
                })
            navigate(`/products/${id}`)

        }
        catch (e) {
            console.log(e);
        }

    }

    const fetchCategories = async () => {
        try {
            const response = await axios.get("http://localhost:8000/categories");
            setCategories(response.data)
        }
        catch (e) {
            console.log(e)
        }
    }

    const fetchMaterials = async () => {
        try {
            const response = await axios.get("http://localhost:8000/materials");
            setMaterials(response.data)
        }
        catch (e) {
            console.log(e)
        }
    }

    const fetchProduct = async () => {
        try {
            if (id) {
                console.log("Product id: ", id)
                const response = await axios.get(`http://localhost:8000/products/${id}`);
                setPictures(response.data.images.map(img =>
                    `http://localhost:8000/${img.image_url}`
                ));

                reset({
                    name: response.data.name,
                    description: response.data.description,
                    height: response.data.height,
                    length: response.data.length,
                    width: response.data.width,
                    quantity: response.data.quantity,
                    price: response.data.price,
                    category_id: response.data.category_id,
                    material_id: response.data.material_id,
                });
            }
        }
        catch (e) {
            console.log(e);
        }
    }

    const onSubmit = async (data) => {
        const formData = new FormData();
        for (const key in data) {
            formData.append(key, data[key])
        }

        if (droppedFiles.length > 0) {
            for (const file of droppedFiles) {
                formData.append("images", file);
            }
        }

        if (mode === 'edit') editProduct(formData)
        else if (mode === 'create') createProduct(formData)


    }

    const onChangeDrop = (files) => {
        const imagePreviews = files.map(file => URL.createObjectURL(file));
        setPictures(imagePreviews);
        setDroppedFiles(files);
    };


    useEffect(() => {
        fetchProduct();
        fetchCategories();
        fetchMaterials();
    }, [])



    return (
        <form onSubmit={handleSubmit(onSubmit)} className="product-form">
            <h1 className="form-title">{mode === "edit" ? "Edit Product" : "Create Product"}</h1>
            <div className="form">
                <section class='left-section'>
                    <label>
                        Name
                        <input {...register("name", { required: true })} />
                    </label>

                    <label>
                        Description
                        <textarea type="text" {...register("description")} rows={4} />
                    </label>
                    <label>
                        Category
                        <select {...register("category_id", { required: true })}>
                            {
                                categories?.map((category) => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                )
                                )
                            }
                        </select>
                    </label>
                    <label>
                        Price
                        <input {...register("price", { required: true })} />
                    </label>

                    <label>
                        Quantity
                        <input type="number" {...register("quantity", { min: 0 })} />
                    </label>
                </section>
                <div className='divider'>

                </div>

                <section>
                    <div class="size">
                        <label>
                            Length
                            <input {...register("length")} />
                        </label>

                        <label>
                            Width
                            <input {...register("width")} />
                        </label>

                        <label>
                            Height
                            <input {...register("height")} />
                        </label>

                    </div>

                    <label>
                        Material
                        <select {...register("material_id", { required: true })}>
                            {
                                materials?.map((material) => (
                                    <option key={material.id} value={material.id}>{material.name}</option>
                                )
                                )
                            }
                        </select>
                    </label>

                    <Dropzone onDrop={acceptedFiles => onChangeDrop(acceptedFiles)}>
                        {({ getRootProps, getInputProps }) => (
                            <section>
                                <div {...getRootProps()}>
                                    <input {...getInputProps()} />
                                    <label>
                                        Upload photos
                                        <div className='dropzone'>
                                            Drag images here or click to upload
                                        </div>
                                    </label>
                                </div>
                            </section>
                        )}
                    </Dropzone>

                    <div className="image-preview">
                        {pictures?.map((src, index) => (
                            <img key={index} src={src} alt={`preview-${index}`} width={100} />
                        ))}
                    </div>
                    <div className='submit'>
                    <input type="submit" value="Submit" className="submit-btn" />
                    </div>
                </section>
            </div>

        </form>

    );
}

export default ProductForm;
