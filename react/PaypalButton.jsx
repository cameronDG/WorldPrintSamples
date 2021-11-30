/* eslint-disable camelcase */
import React, { useState, useEffect } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import debug from "sabio-debug";
import toastr from "toastr";
import PropTypes from "prop-types";
import * as ordersService from "@services/ordersService";

const _logger = debug.extend("Orders");

const initialOptions = {
  "client-id": "REMOVED",
  currency: "USD",
  intent: "capture",
};

const PayPalButton = (props) => {
  const [itemTotal, setItemTotal] = useState(props.itemTotal);
  const [taxTotal, setTaxTotal] = useState(props.taxTotal);
  const [shippingTotal, setShippingTotal] = useState(props.shippingTotal);
  const [total, setTotal] = useState(props.total);
  const [items, setItems] = useState([]);

  let pDetails = null;

  const itemMapper = (item) => {
    return {
      name: item.name,
      unit_amount: { currency_code: "USD", value: item.basePrice.toString() },
      description: item.description,
      quantity: item.quantity.toString(),
      sku: item.sku,
    };
  };

  const packageOrder = (details) => {
    let order = {};

    order.total = details.purchase_units[0].amount.value;
    order.paymentId = details.id;
    order.payerId = details.payer.payer_id;

    ordersService
      .createOrder(order)
      .then(onCreateOrderSuccess)
      .catch(onCreateOrderError);
  };

  const onCreateOrderSuccess = (response) => {
    _logger(response);
    _logger(pDetails);
  };

  const onCreateOrderError = (error) => {
    _logger(error);
  };

  const onApproval = (data, actions) => {
    actions.order.capture().then((details) => {
      pDetails = details;
      packageOrder(details);
      toastr.success(
        "Transaction completed by " + details.payer.name.given_name
      );
    });
  };

  useEffect(() => {
    if (props.itemTotal !== itemTotal) {
      setItemTotal(props.itemTotal);
      setTaxTotal(props.taxTotal);
      setShippingTotal(props.shippingTotal);
      setTotal(props.total);
    }
  });

  useEffect(() => {
    setItems(() => props.products.map(itemMapper));
  }, [itemTotal]);

  return (
    <PayPalScriptProvider options={initialOptions}>
      <PayPalButtons
        fundingSource={"paypal"}
        style={{ layout: "vertical" }}
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: total,
                  breakdown: {
                    item_total: {
                      currency_code: "USD",
                      value: itemTotal,
                    },
                    shipping: {
                      currency_code: "USD",
                      value: shippingTotal,
                    },
                    tax_total: {
                      currency_code: "USD",
                      value: taxTotal,
                    },
                  },
                },
                items: items,
              },
            ],
          });
        }}
        onApprove={(data, actions) => onApproval(data, actions)}
      />
      <PayPalButtons
        fundingSource={"card"}
        style={{ layout: "vertical" }}
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: total,
                  breakdown: {
                    item_total: {
                      currency_code: "USD",
                      value: itemTotal,
                    },
                    shipping: {
                      currency_code: "USD",
                      value: shippingTotal,
                    },
                    tax_total: {
                      currency_code: "USD",
                      value: taxTotal,
                    },
                  },
                },
                items: items,
              },
            ],
          });
        }}
        onApprove={(data, actions) => onApproval(data, actions)}
      />
    </PayPalScriptProvider>
  );
};

PayPalButton.propTypes = {
  itemTotal: PropTypes.string,
  taxTotal: PropTypes.string,
  shippingTotal: PropTypes.string,
  total: PropTypes.string,
  products: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      sku: PropTypes.string,
      name: PropTypes.string,
      description: PropTypes.string,
      primaryImage: PropTypes.string,
      basePrice: PropTypes.number,
      quantity: PropTypes.number,
    })
  ),
};

export default PayPalButton;
