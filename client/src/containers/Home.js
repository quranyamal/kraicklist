import React, { useState, useEffect } from "react";
import ListGroup from "react-bootstrap/ListGroup";
import { API } from "aws-amplify";
import { useAppContext } from "../libs/contextLib";
import { onError } from "../libs/errorLib";
import { BsPencilSquare } from "react-icons/bs";
import { LinkContainer } from "react-router-bootstrap";
import { Col, Row } from "react-bootstrap";
import Image from 'react-bootstrap/Image'
import Badge from 'react-bootstrap/Badge'
import "./Home.css";

export default function Home() {
  const [products, setProducts] = useState([]);
  const { isAuthenticated } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function onLoad() {
      if (!isAuthenticated) {
        return;
      }
  
      try {
        const products = await loadProducts();
        setProducts(products);
      } catch (e) {
        onError(e);
      }
  
      setIsLoading(false);
    }
  
    onLoad();
  }, [isAuthenticated]);
  
  function loadProducts() {
    return API.get("kraicklist", "/products");
  }

  function renderProductList(products) {
    return (
      <>
        {products.map(({ id, title, content, thumb_url, tags, updated_at }) => (
          <LinkContainer key={id} to={`/products/${id}`}>
            <ListGroup.Item action>
              <Row>
                <Col xs={6} md={2}>
                  <Image src={thumb_url} rounded />
                </Col>
                <Col xs={12} md={9}>
                  <span className="font-weight-bold">
                    {title}
                  </span>
                  <br />
                  <span className="text-muted">
                    {tags.map((tag) => (
                        <span><Badge variant="secondary">{tag}</Badge> {' '}</span>
                    ))}

                  </span>
                  <br />
                  <span className="text-muted">
                    Updated: {Intl.DateTimeFormat('en-US', 
                      { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', 
                        minute: '2-digit', second: '2-digit' 
                      }).format(updated_at*1000)}
                  </span>
                </Col>
              </Row>
            </ListGroup.Item>
          </LinkContainer>
        ))}
      </>
    );
  }

  function renderLander() {
    return (
      <div className="lander">
        <h1>Haraj</h1>
        <p className="text-muted">Haraj Take Home Challenge</p>
      </div>
    );
  }

  function renderProducts() {
    return (
      <div className="products">
        <h2 className="pb-3 mt-4 mb-3 border-bottom">What do want to buy today?</h2>
        <ListGroup>{!isLoading && renderProductList(products)}</ListGroup>
      </div>
    );
  }

  return (
    <div className="Home">
      {isAuthenticated ? renderProducts() : renderLander()}
    </div>
  );
}