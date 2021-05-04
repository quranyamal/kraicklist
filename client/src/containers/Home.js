import React, { useState, useEffect } from "react";
import ListGroup from "react-bootstrap/ListGroup";
import { API } from "aws-amplify";
import { useAppContext } from "../libs/contextLib";
import { onError } from "../libs/errorLib";
import { BsPencilSquare } from "react-icons/bs";
import { LinkContainer } from "react-router-bootstrap";
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
        {products.map(({ id, title, content }) => (
          <LinkContainer key={id} to={`/products/${id}`}>
            <ListGroup.Item action>
              <span className="font-weight-bold">
                {title}
              </span>
              <br />
              <span className="text-muted">
                {content}
              </span>
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