import React, { useState, useEffect } from "react";
import { API } from "aws-amplify";
import { useAppContext } from "../libs/contextLib";
import { onError } from "../libs/errorLib";
import { Col, Container } from "react-bootstrap";
import { Image, Badge, Button, Jumbotron } from 'react-bootstrap'
import { Card, CardGroup, ListGroup} from 'react-bootstrap'
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
      <Container>
          <CardGroup>
        {products.map(({ id, title, content, thumb_url, tags, updated_at }) => (
          <Col className="col-sm-4 d-flex pb-3">
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
              
            </Col>
        ))}
          </CardGroup>
          </Container>
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
        <Jumbotron>
        <h1>Ramadhan Big Sale!</h1>
        <p>
        Enjoy affordable one-stop shopping with Heroj. Now free shipping worldwide*
        </p>
        <p>
          <Button variant="primary">Show Promotions</Button>
        </p>
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