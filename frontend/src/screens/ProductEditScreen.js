import React, {useState,useEffect} from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import {Form,Button,Row,Col} from 'react-bootstrap'
import { useDispatch,useSelector } from 'react-redux'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { listProductDetails,updateproductAction} from '../actions/productAction'
import FormContainer from '../components/FormContainer'
import { PRODUCT_UPDATE_RESET } from '../constants/productConstants'

function ProductEditScreen({match,history}) {
    const productId = match.params.id
    const [name,setName] = useState('')
    const [price,setPrice] = useState(0)
    const [category,setCategory] = useState('')
    const [brand,setBrand] = useState('')
    const [image,setImage] = useState('')
    const [countInStock,setCountInStock] = useState(0)
    const [description,setDescription] = useState('')
    const [uploading,setUploading] = useState(false)
    const dispatch = useDispatch()
    const productDetails = useSelector(state => state.productDetails)
    const {loading,error,productdetail} = productDetails
    const productUpdate = useSelector(state => state.productUpdate)
    const {loading:loadingUpdate,error:errorUpdate,success:successUpdate} = productUpdate
    useEffect(() => {
      if (successUpdate){
        dispatch({type:PRODUCT_UPDATE_RESET})
        history.push('/admin/products')
      }else{
      if(!productdetail.name || productdetail._id !== Number(productId)){
        dispatch(listProductDetails(productId))
      }else{
        setName(productdetail.name)
        setPrice(productdetail.price)
        setCategory(productdetail.category)
        setBrand(productdetail.brand)
        setImage(productdetail.image)
        setCountInStock(productdetail.countInStock)
        setDescription(productdetail.description)
      }
    }
  },[productId,productdetail,history,successUpdate])
    const submitHandler = (e) => {
      e.preventDefault()
      dispatch(updateproductAction({
        _id:productId,
        name,
        price,
        image,
        brand,
        category,
        countInStock,
        description
      }))
    }
    const uploadFileHandler =  async(e) => {
        const file = e.target.files[0]
        const formData = new FormData()
        formData.append('image',file)
        formData.append('product_id',productId)
        setUploading(true)
        try{
          const config = {
            headers : {
              'Content-Type' : 'multipart/form-data'
            }
          }
          const {data} = await axios.post('/api/products/upload/',formData,config)
          setImage(data)
          setUploading(false)
        }catch(error){
          setUploading(false)
        }
    }
    return (
      <div>
      <Link to = '/admin/products' className="btn btn-light my-3">Go Back</Link>
      <FormContainer>
                <h1>Edit Product</h1>
                {loadingUpdate && <Loader />}
                {errorUpdate && <Message variant='danger'>{errorUpdate}</Message>}

                {loading ? <Loader /> : error ? <Message variant='danger'>{error}</Message>
                    : (
                        <Form onSubmit={submitHandler}>

                            <Form.Group controlId='name'>
                                <Form.Label>Name</Form.Label>
                                <Form.Control

                                    type='name'
                                    placeholder='Enter name'
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                >
                                </Form.Control>
                            </Form.Group>

                            <Form.Group controlId='price'>
                                <Form.Label>Price</Form.Label>
                                <Form.Control

                                    type='number'
                                    placeholder='Enter price'
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                >
                                </Form.Control>
                            </Form.Group>


                            <Form.Group controlId='image'>
                                <Form.Label>Image</Form.Label>
                                <Form.Control

                                    type='text'
                                    placeholder='Enter image'
                                    value={image}
                                    onChange={(e) => setImage(e.target.value)}
                                >
                                </Form.Control>

                                <Form.File
                                    id='image-file'
                                    label='Choose File'
                                    custom
                                    onChange={uploadFileHandler}
                                >

                                </Form.File>
                                {uploading && <Loader />}

                            </Form.Group>


                            <Form.Group controlId='brand'>
                                <Form.Label>Brand</Form.Label>
                                <Form.Control

                                    type='text'
                                    placeholder='Enter brand'
                                    value={brand}
                                    onChange={(e) => setBrand(e.target.value)}
                                >
                                </Form.Control>
                            </Form.Group>

                            <Form.Group controlId='countinstock'>
                                <Form.Label>Stock</Form.Label>
                                <Form.Control

                                    type='number'
                                    placeholder='Enter stock'
                                    value={countInStock}
                                    onChange={(e) => setCountInStock(e.target.value)}
                                >
                                </Form.Control>
                            </Form.Group>

                            <Form.Group controlId='category'>
                                <Form.Label>Category</Form.Label>
                                <Form.Control

                                    type='text'
                                    placeholder='Enter category'
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                </Form.Control>
                            </Form.Group>

                            <Form.Group controlId='description'>
                                <Form.Label>Description</Form.Label>
                                <Form.Control

                                    type='text'
                                    placeholder='Enter description'
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                >
                                </Form.Control>
                            </Form.Group>


                            <Button type='submit' variant='primary' className = 'my-2'>
                                Update
                        </Button>

                        </Form>
                    )}

            </FormContainer >
      </div>
    )
}

export default ProductEditScreen
