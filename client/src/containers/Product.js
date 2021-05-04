import React, { useRef, useState, useEffect } from "react";
import { API } from "aws-amplify";
import { useParams } from "react-router-dom";
import { Col, Container, Row, Image, Badge, Carousel } from "react-bootstrap";
import "./Product.css";

export default function Product(props) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  console.log("==props 12:");
  console.log(props);
  
  useEffect(() => {
    function loadProduct() {
      console.log("loading product");
        return API.get("kraicklist", `/products/${id}`);
      // return API.get("kraicklist", `/products/72385418`);
    }

    async function onLoad() {
      setIsLoading(false);
      console.log("onLoad");
      try {
        const product = await loadProduct();
        console.log("nggak eror, product nya:");
        console.log(product)
        const { id, title, content, image_urls } = product;

        // setContent(content);
        setProduct(product);
      } catch (e) {
        console.log("eror woy");
        console.log(e);
        alert(e);
      }
    }

    onLoad();
  }, [id]);

  function renderProduct() {
    return (
      <Row>
        <Col className="col-md-4">
          <Carousel>
            {product.image_urls.map((image_url) => (
              <Carousel.Item><Image src={image_url} fluid/><br/></Carousel.Item>
            ))}
          </Carousel>
        </Col>
        <Col className="col-md-8">
          <h2>{product.title}</h2>
          {product.tags.map((tag) => (
            <span><Badge variant="secondary">{tag}</Badge> {' '}</span>
          ))}
          <br/><br/>
          <strong>Price: {product.id} SR</strong><br/>
          {product.content}<br/><br/>
          Updated: {Intl.DateTimeFormat('en-US', 
           { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', 
              minute: '2-digit', second: '2-digit' }).format(product.updated_at*1000)}
        </Col>
      </Row>
    )
  }

  return (
    <div className="Product">
        {product && renderProduct()}
    </div>
  );
}