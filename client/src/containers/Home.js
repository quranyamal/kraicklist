import React, { useState, useEffect } from "react";
import { API } from "aws-amplify";
import { useAppContext } from "../libs/contextLib";
import { onError } from "../libs/errorLib";
import { Col, Row } from "react-bootstrap";
import { Image, Badge, Button, Jumbotron, Form } from 'react-bootstrap'
import { LinkContainer } from "react-router-bootstrap";
import { Card, CardGroup, ListGroup} from 'react-bootstrap'
import "./Home.css";

export default function Home() {
  const [products, setProducts] = useState([]);
  const { isAuthenticated } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [keyword, setKeyword] = useState("");

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
      <CardGroup>
        {products.map(({ id, title, thumb_url, tags, updated_at }) => (
          <Col className="col-sm-4 d-flex pb-3">
            <LinkContainer to={`/products/${id}`}>

                <Card className="card-item">
                  <Image className="card-img-top" src={thumb_url} fluid/>
                  <Card.Body>
                    <Card.Title>{title}</Card.Title>
                    <Card.Text>
                      <span className="text-muted">
                        {tags.map((tag) => (
                          <span><Badge variant="secondary">{tag}</Badge> {' '}</span>
                          ))}
                      </span>
                      <br />
                    </Card.Text>
                    <span className="text-muted">
                        {Intl.DateTimeFormat('en-US', 
                          { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', 
                          minute: '2-digit', second: '2-digit' 
                        }).format(updated_at*1000)}
                    </span><br />
                  </Card.Body>
                  <Card.Body>
                    <Card.Link href={`/products/${id}`}><Button variant="primary" block>Detail</Button></Card.Link>
                  </Card.Body>
                </Card>
              </LinkContainer>
            </Col>
        ))}
      </CardGroup>
    );
  }
        
  function renderLander() {
    return (
      <div className="lander">
        <h1>HeroJ</h1>
        <p className="text-muted">A Haraj Take Home Challenge</p>
      </div>
    );
  }

  function renderProducts() {
    return (
      <div className="products">
        <Jumbotron>
          <h1>Grand Opening Promo</h1>
          <p>
          Enjoy affordable one-stop shopping at HeroJ Online. Now free shipping worldwide*
          </p>
            <Row>
              <Col md={6} sm={8} sx={12}>
                <Form.Control 
                  type="text" 
                  placeholder="search a product" 
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  />
              </Col>
              <Col>
                <LinkContainer to={`/search/${keyword}`} className="btn btn-primary">
                  <Button>Search</Button>
                </LinkContainer>
              </Col>
            </Row>
        </Jumbotron>        
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