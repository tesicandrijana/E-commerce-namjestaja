import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import './ProductForm.css';
import axios from 'axios'

function ProductForm() {

    const [categories, setCategories] = useState()
    const [materials, setMaterials] = useState()

    const { register, handleSubmit, reset } = useForm();
    const onSubmit = async (data) => {
        const fileArray = Array.from(data.images)
        const formData = new FormData();
        for (const key in data) {
            if (key !== "images") {
                formData.append(key, data[key])
            }
        }

        for (const file in fileArray) {
            formData.append("images", fileArray[file])
        }

        try {
            const response = await axios.post("http://localhost:8000/products", formData,
                {
                    headers: {
                        "Content-type": "multipart/form-data",
                    }
                })

            console.log(response)
        }
        catch (e) {
            console.log(e);
        }
        finally {
            reset()
        }
    }

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get("http://localhost:8000/categories");
                setCategories(response.data)
                console.log(categories)
            }
            catch (e) {
                console.log(e)
            }
        }
        const fetchMaterials = async () => {
            try {
                const response = await axios.get("http://localhost:8000/materials");
                setMaterials(response.data)
                console.log(materials)
            }
            catch (e) {
                console.log(e)
            }
        }
        fetchCategories();
        fetchMaterials();
    }, [])


    return (
        <form onSubmit={handleSubmit(onSubmit)} className="product-form">
            <section>
                <label>
                    Name
                    <input {...register("name", { required: true })} />
                </label>

                <label>
                    Description
                    <input type="text" {...register("description")} />
                </label>

                <label>
                    Material
                    <select defaultValue={materials ? materials[0] : " "} {...register("material_id", { required: true })}>
                        {
                            materials?.map((material) => (
                                <option key={material.id} value={material.id}>{material.name}</option>
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
                    <input defaultValue="1" type="number" {...register("quantity", { min: 0 })} />
                </label>
            </section>

            <section>
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

                <label>
                    Category
                    <select defaultValue={categories ? categories[0] : " "} {...register("category_id", { required: true })}>
                        {
                            categories?.map((category) => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            )
                            )
                        }
                    </select>
                </label>
                <label>
                    <input type="file" multiple {...register("images")} />
                </label>
                <input type="submit" value="Submit" className="submit-btn" />
            </section>

        </form>
    );
}

export default ProductForm;
