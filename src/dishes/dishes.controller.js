const path = require("path");
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

////////////
// CREATE //
////////////

function create(req, res, next) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newDish = {
    id: nextId(),
    name: name,
    description: description,
    price: price,
    image_url: image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

//////////
// READ //
//////////

function read(req, res, next) {
  res.json({ data: res.locals.dish });
}

////////////
// UPDATE //
////////////

function update(req, res, next) {
  const dish = res.locals.dish;
  const originalName = dish.name;
  const originalDescription = dish.description;
  const originalPrice = dish.price;
  const originalImageUrl = dish.image_url;
  const { data: { id, name, description, price, image_url } = {} } = req.body;

  if (originalName !== name) {
    dish.name = name;
  }

  if (originalDescription !== description) {
    dish.description = description;
  }

  if (originalPrice !== price) {
    dish.price = price;
  }

  if (originalImageUrl !== image_url) {
    dish.image_url = image_url;
  }

  res.json({ data: dish });
}

//////////
// LIST //
//////////

function list(req, res) {
  res.json({ data: dishes });
}

/////////////////////////////////
// VALIDATION MIDDLEWARE BELOW //
/////////////////////////////////

function dishExists(req, res, next) {
  // this function will check the list of dishes for a particular dish.
  // if it does not, will return an error status and message.
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);

  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }

  next({
    status: 404,
    message: `Dish does not exist: ${dishId}`,
  });
}

function allBodyPropertiesExist(req, res, next) {
  // this function will check if all body props exist for post & put methods.
  // if one or more do not, it will return an error status and message.
  const { data: { name, description, price, image_url } = {} } = req.body;

  if (name && description && price && image_url) {
    return next();
  }

  next({
    status: 400,
    message:
      "All body properties are required. (ie: name, description, price, image_url)",
  });
}

function bodyPropertiesAreEmpty(req, res, next) {
  // this function will check if name, description, or image_url are empty.
  // will also check if price is zero or less.
  // if any above are true, will return error status and message.
  const { data: { name, description, price, image_url } = {} } = req.body;

  if (
    name.length === 0 ||
    description.length === 0 ||
    price <= 0 ||
    !Number.isInteger(price) ||
    image_url.length === 0
  ) {
    return next({
      status: 400,
      message:
        "Name, description, and image_url properties cannot be empty. Price property must be an integer that is not zero or less.",
    });
  }

  next();
}

function doesUpdatedIdMatch(req, res, next) {
  // will check if the id property for the put method matches the already existing dish id.
  const originalDish = res.locals.dish;
  const originalId = originalDish.id;
  const { dishId } = req.params;
  const { data: { id, name, description, price, image_url } = {} } = req.body;

  if (id != originalId) {
    return next({
      status: 400,
      message: `Dish id does not match Route id. Dish: ${id}, Route: ${dishId}`,
    });
  }

  next();
}

module.exports = {
  create: [allBodyPropertiesExist, bodyPropertiesAreEmpty, create],
  read: [dishExists, read],
  update: [
    dishExists,
    doesUpdatedIdMatch,
    allBodyPropertiesExist,
    bodyPropertiesAreEmpty,
    update,
  ],
  list,
};
