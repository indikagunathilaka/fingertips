const routes = require("express").Router();

const stockItems = require("./stock-items");
const packingTypes = require("./packing-types");
const measuringTypes = require("./measuring-types");
const shipmentModes = require("./shipment-modes");
const suppliers = require("./suppliers");
const purchaseOrders = require("./purchase-orders");
const materialRequests = require("./material-requests");
const deliveries = require("./deliveries");
const receiveItems = require("./receive-items");
const users = require("./users");
const roles = require("./roles");
const items = require("./items");

routes.use("/stock-items", stockItems);
routes.use("/packing-types", packingTypes);
routes.use("/measuring-types", measuringTypes);
routes.use("/shipment-modes", shipmentModes);
routes.use("/suppliers", suppliers);
routes.use("/purchase-orders", purchaseOrders);
routes.use("/material-requests", materialRequests);
routes.use("/deliveries", deliveries);
routes.use("/receive-items", receiveItems);
routes.use("/users", users);
routes.use("/roles", roles);
routes.use("/items", items);

routes.get("/", function(req, res, next) {
  res.status(200).send("YOU'VE REACHED THE BASE URL OF API");
});

// Catch all
routes.get("*", (req, res, next) => {
  res.status(404).json({ err: "Path " + req.orginalUrl + " does not exist." });
});

module.exports = routes;
