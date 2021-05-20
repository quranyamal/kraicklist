import React, { useState, useEffect } from "react";
import { API } from "aws-amplify";
// import { useAppContext } from "../libs/contextLib";
import { onError } from "../libs/errorLib";
import { Col, Row } from "react-bootstrap";
import { Image, Badge, Button, Jumbotron, Form } from 'react-bootstrap'
import { LinkContainer } from "react-router-bootstrap";
import { Card, CardGroup, ListGroup} from 'react-bootstrap'
import { useHistory } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const [products, setProducts] = useState([]);
  // const { isAuthenticated } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const history = useHistory();

  useEffect(() => {
    async function onLoad() {
      // if (!isAuthenticated) {
      //   return;
      // }
  
      try {
        const response = await loadProducts();
        setProducts(response.hits.hits);
      } catch (e) {
        onError(e);
      }
  
      setIsLoading(false);
    }

    onLoad();
  }, true);
  
  function loadProducts() {
    return API.get("ESLive", "/products/_search?size=12");
  }

  function renderProductList(products) {
    return (
      <CardGroup>
        {
        !products ? <p>no product data available</p> :
        products.map(({ _id, _source }) => (
          <Col className="col-sm-4 d-flex pb-3">
            <LinkContainer to={`/products/${_id}`}>

                <Card className="card-item">
                  <Image className="card-img-top" src={_source.thumb_url} fluid/>
                  <Card.Body>
                    <Card.Title>{_source.title}</Card.Title>
                    <Card.Text>
                      <span className="text-muted">
                        {_source.tags.map((tag) => (
                          <span><Badge variant="secondary">{tag}</Badge> {' '}</span>
                          ))}
                      </span>
                      <br />
                    </Card.Text>
                    <span className="text-muted">
                        {Intl.DateTimeFormat('en-US', 
                          { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', 
                          minute: '2-digit', second: '2-digit' 
                        }).format(_source.updated_at*1000)}
                    </span><br />
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
        <p className="text-muted">A Haraj Take Home Challenge. Please sign in to use this app</p>
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
                  placeholder="search a heroj good" 
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyPress={event => {
                    if (event.key === "Enter") {
                      keyword && history.push(`/search/${keyword}`)
                    }
                  }}
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
      {/* {isAuthenticated ? renderProducts() : renderLander()} */}
      {renderProducts()}
    </div>
  );
}