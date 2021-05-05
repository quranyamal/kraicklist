import React, { useState, useEffect } from "react";
import { API } from "aws-amplify";
import { useAppContext } from "../libs/contextLib";
import { onError } from "../libs/errorLib";
import { useParams } from "react-router-dom";
import { Col, Row, Image, Badge, Button, Form } from "react-bootstrap";
import { Card, CardGroup } from 'react-bootstrap'
import { LinkContainer } from "react-router-bootstrap";

export default function Search(props) {

    const [products, setProducts] = useState(null);
    const { isAuthenticated } = useAppContext();
    const [isLoading, setIsLoading] = useState(true);
    const { q } = useParams();
    const [keyword, setKeyword] = useState("");

    useEffect(() => {
      async function onSearch() {
        if (!isAuthenticated) {
          return;
        }
    
        try {
          const result = await searchProducts();
          setProducts(result);
        } catch (e) {
          onError(e);
        }
    
        setIsLoading(false);
      }
      
      onSearch();
    }, [isAuthenticated]);

    async function searchProducts() {
        console.log("Searching ...")
        return await API.get("kraicklist", `/search/${q}`);
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

    return (
        <div className="Products">
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
            <br/><br/>
            {isLoading ? "Loading..." 
            :products!=null ? renderProductList(products) 
                : `no product found with the keyword: ${q}`
            }
        </div>
    )

}