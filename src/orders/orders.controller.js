const path = require("path");
const orders = require(path.resolve("src/data/orders-data"));
const nextId = require("../utils/nextId");

////////////
// CREATE //
////////////

function create(req, res, next) {
  const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
  const newOrder = {
    id: nextId(),
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    status: "pending",
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
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;

  order.deliverTo = deliverTo;
  order.mobileNumber = mobileNumber;
  order.status = status;
  order.dishes = dishes;

  res.json({ data: order });
}

////////////
// DELETE //
////////////

function destroy(req, res, next) {
  const orderToDestroy = res.locals.order;
  const index = orders.findIndex((order) => order.id === orderToDestroy.id);

  orders.splice(index, 1);
  res.sendStatus(204);
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
  // will check if all required body props exist.
  // if one or more do not, it will return an error status and message.
  const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;

  if (deliverTo && mobileNumber && dishes) {
    return next();
  }

  next({
    status: 400,
    message: "order must include deliverTo, mobileNumber, and dishes.",
  });
}

function bodyPropertiesAreEmpty(req, res, next) {
  // this function will check if deliverTo, mobileNumber, or dishes properties are empty.
  // if so, will return with an error status and message.
  const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
  if (deliverTo === "" || mobileNumber === "" || dishes.length === 0) {
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
  const { data: { dishes } = {} } = req.body;
  const index = dishes.findIndex((dish) => !Number.isInteger(dish.quantity));

  index !== -1
    ? next({
        status: 400,
        message: `dish ${index} must have a quantity that is an integer greater than 0`,
      })
    : next();
}

function checkDishesDataType(req, res, next) {
  // this function will check if dishes is an array.
  // if not, will return with an error status and message.
  const { data: { dishes } = {} } = req.body;

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
  const { data: { dishes } = {} } = req.body;
  const quantNotAllowed = dishes.find((dish) => dish.quantity <= 0);

  quantNotAllowed
    ? next({
        status: 400,
        message: "quantity must be an integer greater than 0.",
      })
    : next();
}

function doesUpdatedIdMatch(req, res, next) {
  // will check if the id property for the put method matches the already existing order id.
  const originalOrder = res.locals.order;
  const { orderId } = req.params;
  const { data: { id } = {} } = req.body;

  if (id && id !== originalOrder.id) {
    return next({
      status: 400,
      message: `Order id does not match Route id. Dish: ${id}, Route: ${orderId}`,
    });
  }

  next();
}

function checkUpdatedStatus(req, res, next) {
  const { data: { status } = {} } = req.body;
  if (!status || status === "") {
    return next({
      status: 400,
      message:
        "Order must have a status of pending, preparing, out-for-delivery, delivered",
    });
  }

  next();
}

function statusNotDelivered(req, res, next) {
  const order = res.locals.order;
  order.status === "delivered"
    ? next({
        status: 400,
        message: "A delivered order cannot be changed",
      })
    : next();
}

// function updatedStatusIsValid(req, res, next) {
//   const order = res.locals.order;
//   if (
//     order.status !== "pending" ||
//     order.status !== "preparing" ||
//     order.status !== "out-for-delivery" ||
//     order.status !== "delivered"
//   ) {
//     return next({
//       status: 400,
//       message:
//         "Order must have a status of pending, preparing, out-for-delivery, delivered",
//     });
//   }

//   next();
// }

module.exports = {
  create: [
    bodyHasAllProperties,
    bodyPropertiesAreEmpty,
    checkDishesDataType,
    checkQuantityDataType,
    checkQuantity,
    create,
  ],
  read: [orderExists, read],
  update: [
    orderExists,
    statusNotDelivered,
    doesUpdatedIdMatch,
    bodyHasAllProperties,
    bodyPropertiesAreEmpty,
    checkQuantity,
    checkDishesDataType,
    checkQuantityDataType,
    checkUpdatedStatus,
    update,
  ],
  delete: [orderExists, checkOrderStatus, destroy],
  list,
};
