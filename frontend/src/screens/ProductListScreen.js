import React, {useState,useEffect} from 'react'
import { LinkContainer } from 'react-router-bootstrap'
import {Row,Col,Table,Button} from 'react-bootstrap'
import { useDispatch,useSelector } from 'react-redux'
import Loader from '../components/Loader'
import Message from '../components/Message'
import Paginate from '../components/Paginate'
import { listProducts,deleteproduct,createproductAction} from '../actions/productAction'
import { PRODUCT_CREATE_RESET } from '../constants/productConstants'
function ProductListScreen({history,match}) {
  const dispatch = useDispatch()
  const productList = useSelector(state => state.productList)
  const {loading,error,products,page,pages} = productList
  const productDelete = useSelector(state => state.productDelete)
  const {loading: loadingDelete,error:errorDelete,success: successDelete} = productDelete
  const userLogin = useSelector(state => state.userLogin)
  const {userInfo} = userLogin
  const productCreate = useSelector(state => state.productCreate)
  const {loading: loadingCreate,error:errorCreate,success: successCreate,product:CreatedProduct} = productCreate
  let keyword = history.location.search
  useEffect(() => {
    dispatch({type:PRODUCT_CREATE_RESET})
    if (!userInfo.isAdmin){
      history.push('/login')
    }
    if(successCreate){
      history.push(`/admin/product/${CreatedProduct._id}/edit`)
    }else{
        dispatch(listProducts(keyword))
    }
  },[dispatch,keyword,history,userInfo,successDelete,CreatedProduct,successCreate])
const createProductHandler = (product) => {
  dispatch(createproductAction())
}
const deleteHandler = (id) => {
  if(window.confirm("Are you sure  you want to delete this product?")){
    dispatch(deleteproduct(id))
  }
}
    return (
        <div>
        <Row className='align-items-center'>
          <Col>
              <h1>Products</h1>
          </Col>

          <Col className='text-right' >
              <Button className='my-3' id = "create" onClick={createProductHandler}>
                  <i className='fas fa-plus' ></i> Create Product
              </Button>
          </Col>
      </Row>
      {loadingDelete && <Loader/>}
      {errorDelete && <Message variant = "danger">{errorDelete}</Message>}
      {loadingCreate && <Loader/>}
      {errorCreate && <Message variant = "danger">{errorCreate}</Message>}
          {loading ?(
           <Loader/>)
           : error ? (<Message variant = 'danger'>{error}</Message>)
           :(
          <div>
             <Table striped bordered hover responsive className='table-sm'>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>NAME</th>
                                    <th>PRICE</th>
                                    <th>CATEGORY</th>
                                    <th>BRAND</th>
                                    <th></th>
                                </tr>
                            </thead>

                            <tbody>
                                {products.map(product => (
                                    <tr key={product._id}>
                                        <td>{product._id}</td>
                                        <td>{product.name}</td>
                                        <td>${product.price}</td>
                                        <td>{product.category}</td>
                                          <td>{product.brand}</td>

                                        <td>
                                        <Col className = "col-sm justify-center">
                                            <LinkContainer to={`/admin/product/${product._id}/edit`}>
                                                <Button variant='light' mr = {3} className='btn-sm'>
                                                    <i className='fas fa-edit'></i>
                                                </Button>
                                            </LinkContainer>

                                            <Button variant='danger' className='btn-sm' id = "trash-button" onClick = {() => deleteHandler(product._id)}>
                                                <i className='fas fa-trash'></i>
                                            </Button>
                                          </Col>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        <Paginate page = {page} pages = {pages} isAdmin = {true} />
                      </div>
                    )}
        </div>
    )
}

export default ProductListScreen
