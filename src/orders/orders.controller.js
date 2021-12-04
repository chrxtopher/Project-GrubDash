const path = require("path");
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

////////////
// CREATE //
////////////

function create(req, res, next) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const newOrder = {
    id: nextId(),
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    status: status,
    dishes: dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

//////////
// LIST //
//////////

function list(req, res, next) {
  res.json({ data: orders });
}

/////////////////////////////////
// VALIDATION MIDDLEWARE BELOW //
/////////////////////////////////

function bodyHasAllProperties(req, res, next) {
  // this function will check if all body props exist for post, put, & delete methods.
  // if one or more do not, it will return an error status and message.
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  if (!deliverTo || !mobileNumber || !status || !dishes) {
    return next({
      status: 400,
      message:
        "All body properties are required! (ie: deliverTo, mobileNumber, status, dishes",
    });
  }

  next();
}

function bodyPropertiesAreEmpty(req, res, next) {
  // this function will check if deliverTo, mobileNumber, or dishes properties are empty.
  // if so, will return with an error status and message.
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  if (
    deliverTo.length === 0 ||
    mobileNumber.length === 0 ||
    dishes.length === 0
  ) {
    return next({
      status: 400,
      message: "deliverTo, mobileNumber, & dishes cannot be empty.",
    });
  }

  next();
}

function checkDataTypes(req, res, next) {
  // this function will make sure that quantity is an integer and dishes is an array.
  // if not, will return with an error status and message.
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const error = {
    status: 400,
    message:
      "Dishes must be an array. Quantity must be an integer greater than zero.",
  };
  if (Array.isArray(dishes)) {
    const quantNotAllowed = dishes.find(
      (dish) => !Number.isInteger(dish.quantity)
    );
    if (quantNotAllowed) {
      return next(error);
    }
  } else {
    return next(error);
  }

  next();
}

function checkQuantity(req, res, next) {
  // this function will make sure the quantity of a dish is not equal to or less than zero.
  // if so, will return with an error status and message.
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const quantNotAllowed = dishes.find((dish) => dish.quantity <= 0);

  quantNotAllowed
    ? next({
        status: 400,
        message: "Quantity must be an integer greater than zero!",
      })
    : next();
}

module.exports = {
  create: [
    bodyHasAllProperties,
    checkDataTypes,
    bodyPropertiesAreEmpty,
    checkQuantity,
    create,
  ],
  list,
};
