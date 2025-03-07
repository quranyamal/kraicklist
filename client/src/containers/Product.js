import React, { useState, useEffect } from "react";
import { API } from "aws-amplify";
import { useParams, useHistory } from "react-router-dom";
import { Col, Row, Image, Badge, Carousel } from "react-bootstrap";
import "./Product.css";

export default function Product(props) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const history = useHistory();

  useEffect(() => {
    function loadProduct() {
      console.log("loading product...");
        // return API.get("ESLive", `/products/_doc/${id}`);
        return API.get("kraicklist", `/products/${id}`);
    }

    async function onLoad() {
      console.log("onLoad");
      try {
        const product = await loadProduct();
        console.log("product:");
        console.log(product)
        setProduct(product);
      } catch (e) {
        console.log("OnLoad @ Product.js | Error:");
        console.log(e);
        alert(e);
      }
    }

    onLoad();
  }, [id]);

  function renderProduct() {
    return (
      product && 
      <Row>
        <Col className="col-md-4">
          <Carousel>
            {product._source.image_urls.map((image_url) => (
              <Carousel.Item><Image src={image_url} fluid/><br/></Carousel.Item>
            ))}
          </Carousel>
        </Col>
        <Col className="col-md-8">
          <h2>{product._source.title}</h2>
          {product._source.tags.map((tag) => (
            <span><Badge variant="secondary">{tag}</Badge> {' '}</span>
          ))}
          <br/><br/>
          <strong>Price: {product._id} SR</strong><br/>
          {product._source.content}<br/><br/>
          Updated: {Intl.DateTimeFormat('en-US', 
           { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', 
              minute: '2-digit', second: '2-digit' }).format(product._source.updated_at*1000)}
          <br/><br/>
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