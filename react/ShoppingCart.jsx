import React, { useState, useEffect } from "react";
import {
  Table,
  CardBody,
  Card,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import debug from "sabio-debug";
import PayPalButton from "./PaypalButton";

const _logger = debug.extend("Orders");

const ShoppingCart = () => {
  let exampleProducts = [
    {
      id: 1,
      sku: "999",
      name: "Gray T-Shirt",
      description: "Large",
      primaryImage:
        "https://personalizedspiritwear.com/sc_images/products/tshirtTeamWrestling-sca1-1000.jpg",
      basePrice: 11.99,
      quantity: 2,
    },
    {
      id: 2,
      sku: "888",
      name: "Red T-Shirt",
      description: "Medium",
      primaryImage:
        "https://cdn.shopify.com/s/files/1/0174/8854/3808/products/c9ed6282-041a-52ff-ad6a-0515fa96f0bc_2000x.jpg?v=1553025095",
      basePrice: 19.99,
      quantity: 1,
    },
  ];

  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState(exampleProducts);
  const [itemTotal, setItemTotal] = useState("0");
  const [taxTotal, setTaxTotal] = useState("0");
  const [shippingTotal, setShippingTotal] = useState("0");
  const [total, setTotal] = useState("0");
  const [modal, setModal] = useState(false);

  const toggleModal = () => setModal(!modal);

  const calculateItemTotal = (productAr) => {
    let st = 0;

    for (let index = 0; index < productAr.length; index++) {
      const product = productAr[index];
      st = st + product.basePrice * product.quantity;
    }

    return st.toFixed(2);
  };

  const productMapper = (product) => {
    return (
      <tr key={product.id}>
        <td>
          <div className="d-flex align-items-center">
            <div className="avatar-icon-wrapper mr-3">
              <div className="avatar-icon">
                <img alt="..." src={product.primaryImage} />
              </div>
            </div>
            <div>
              <a
                href="#/"
                onClick={(e) => e.preventDefault()}
                className="font-weight-bold text-black"
                title="..."
              >
                {product.name}
              </a>
              <span className="text-black-50 d-block">
                {product.description}
              </span>
            </div>
          </div>
        </td>
        <td className="text-center">
          <b>${product.basePrice.toFixed(2)}</b>
        </td>
        <td className="text-center">
          <div>
            <Button
              onClick={() => subtractQuantity(product)}
              outline
              color="dark"
              size="sm"
              className="btn-icon d-40 p-0 btn-animated-icon-sm"
            >
              -
            </Button>
            {"       "}
            <b>{product.quantity}</b>
            {"       "}
            <Button
              onClick={() => addQuantity(product)}
              outline
              color="dark"
              size="sm"
              className="btn-icon d-40 p-0 btn-animated-icon-sm"
            >
              +
            </Button>
          </div>
        </td>
      </tr>
    );
  };

  const addQuantity = (product) => {
    let newProducts = [...products];

    let index = newProducts.findIndex((item) => {
      return item.id === product.id;
    });
    newProducts[index].quantity = newProducts[index].quantity + 1;
    setProducts(newProducts);
  };

  const subtractQuantity = (product) => {
    let newProducts = [...products];

    let index = newProducts.findIndex((item) => {
      return item.id === product.id;
    });

    newProducts[index].quantity = newProducts[index].quantity - 1;

    if (newProducts[index].quantity <= 0) {
      newProducts.splice(index, 1);
    }

    setProducts(newProducts);
  };

  const toCheckout = () => {
    toggleModal();
    _logger("modal");
  };

  useEffect(() => {
    if (products.length) {
      setCart(() => products.map(productMapper));
    } else {
      setCart([]);
    }
  }, [products]);

  useEffect(() => {
    if (products.length) {
      setItemTotal(() => calculateItemTotal(products));
    } else {
      setItemTotal("0");
    }
  }, [cart]);

  useEffect(() => {
    if (products.length) {
      setTaxTotal((itemTotal * 0.0725).toFixed(2));
    } else {
      setTaxTotal("0");
    }
  }, [itemTotal]);

  useEffect(() => {
    if (products.length) {
      setShippingTotal("9.99");
    } else {
      setShippingTotal("0");
    }
  }, [taxTotal]);

  useEffect(() => {
    if (products.length) {
      setTotal((+itemTotal + +taxTotal + +shippingTotal).toFixed(2));
    } else {
      setTotal("0");
    }
  }, [taxTotal]);

  return (
    <Card className="card-box mb-5">
      <div className="card-header">
        <div className="card-header--title">
          <b>Shopping Cart</b>
        </div>
      </div>
      <CardBody className="p-0">
        <div className="table-responsive-md">
          <Table hover striped className="text-nowrap mb-0">
            <thead className="thead-light">
              <tr>
                <th style={{ width: "40%" }}>Product</th>
                <th className="text-center">Price</th>
                <th className="text-center">Quantity</th>
              </tr>
            </thead>
            <tbody>{cart}</tbody>
          </Table>
        </div>
      </CardBody>
      <div className="row justify-content-center">
        <div className="col-3">
          <h6 className="pt-3">Subtotal: ${itemTotal}</h6>
          <h6 className="">Tax: ${taxTotal}</h6>
          <h6 className="">Shipping: ${shippingTotal}</h6>
          <h3 className="pb-2">Total: ${total}</h3>
        </div>
      </div>
      <div className="row justify-content-center">
        <div className="col-3">
          <Button color="dark btn-pill" className="mb-3" onClick={toCheckout}>
            Proceed to Checkout
          </Button>
        </div>
      </div>

      <Modal zIndex={2000} centered isOpen={modal} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>
          Choose your payment option
        </ModalHeader>
        <ModalBody>
          <div className="row justify-content-center">
            <div className="col-10">
              <PayPalButton
                itemTotal={itemTotal}
                products={products}
                taxTotal={taxTotal}
                shippingTotal={shippingTotal}
                total={total}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter></ModalFooter>
      </Modal>
    </Card>
  );
};

export default ShoppingCart;
