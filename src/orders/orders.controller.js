const path = require("path");
const orders = require(path.resolve("src/data/orders-data"));
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
// READ //
//////////

function read(req, res, next) {
  res.json({ data: res.locals.order });
}

////////////
// UPDATE //
////////////

function update(req, res, next) {
  const order = res.locals.order;
  const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } =
    req.body;

  if (order.id !== id) {
    order.id = id;
  }

  if (order.deliverTo !== deliverTo) {
    order.deliverTo = deliverTo;
  }

  if (order.mobileNumber !== mobileNumber) {
    order.mobileNumber = mobileNumber;
  }

  if (order.status !== status) {
    order.status = status;
  }

  if (order.dishes !== dishes) {
    order.dishes = dishes;
  }

  res.json({ data: order });
}

////////////
// DELETE //
////////////

function destroy(req, res, next) {
  ///
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

function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);

  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }

  next({
    status: 404,
    message: `Order ${orderId} not found.`,
  });
}

function checkOrderStatus(req, res, next) {
  // this function will check if the status of the order to be deleted is "pending".
  // if not, will return an error status and message.
  const order = res.locals.order;
  if (order.status !== "pending") {
    return next({
      status: 400,
      message: "An order cannot be deleted unless it is pending.",
    });
  }

  next();
}

function bodyHasAllProperties(req, res, next) {
  // this function will check if all body props exist for post, put, & delete methods.
  // if one or more do not, it will return an error status and message.
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  if (!deliverTo || !mobileNumber || !status || !dishes) {
    return next({
      status: 400,
      message:
        "order must include deliverTo, mobileNumber, status, and dishes.",
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

function checkQuantityDataType(req, res, next) {
  // this function will make sure that each dish's quantity value is an integer.
  // if not, will return an error status and message.
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const index = dishes.findIndex((dish) => !Number.isInteger(dish.quantity));

  index
    ? next({
        status: 400,
        message: `dish ${index} must have a quantity that is an integer greater than 0`,
      })
    : next();
}

function checkDishesDataTypes(req, res, next) {
  // this function will check if dishes is an array.
  // if not, will return with an error status and message.
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;

  !Array.isArray(dishes)
    ? next({
        status: 400,
        message: "dishes must be an array.",
      })
    : next();
}

function checkQuantity(req, res, next) {
  // this function will make sure the quantity of a dish is not equal to or less than zero.
  // if so, will return with an error status and message.
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const quantNotAllowed = dishes.find((dish) => dish.quantity <= 0);

  quantNotAllowed
    ? next({
        status: 400,
        message: "quantity must be an integer greater than 0.",
      })
    : next();
}

module.exports = {
  create: [
    bodyHasAllProperties,
    checkDishesDataTypes,
    checkQuantityDataType,
    bodyPropertiesAreEmpty,
    checkQuantity,
    create,
  ],
  read: [orderExists, read],
  update: [
    orderExists,
    bodyHasAllProperties,
    checkDishesDataTypes,
    checkQuantityDataType,
    bodyPropertiesAreEmpty,
    checkQuantity,
    update,
  ],
  delete: [orderExists, checkOrderStatus, destroy],
  list,
};
