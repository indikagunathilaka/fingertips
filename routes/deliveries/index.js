const deliveries = require("express").Router();

const MaterialRequest = require("../../models/MaterialRequest");
const RequestItem = require("../../models/RequestItem");
const Delivery = require("../../models/Delivery");
const DeliveryRequest = require("../../models/DeliveryRequest");
const DeliveryItem = require("../../models/DeliveryItem");
const ReceiveItem = require("../../models/ReceiveItem");
const StockItem = require("../../models/StockItem");
const BinStock = require("../../models/BinStock");

deliveries.get("/requests", (req, res) => {
  DeliveryRequest.find()
    .populate([
      { path: "materialRequest createdBy updatedBy" },
      { path: "items", populate: { path: "receiveItem" } }
    ])
    .exec((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
});

deliveries.get("/requests/:id", (req, res) => {
  DeliveryRequest.findById(req.params.id)
    .populate([
      { path: "materialRequest createdBy updatedBy" },
      {
        path: "items",
        populate: {
          path: "receiveItem",
          populate: { path: "item purchaseOrder measuringType" }
        }
      }
    ])
    .exec((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
});

deliveries.get("/", (req, res) => {
  Delivery.find()
    .populate([
      { path: "materialRequest createdBy updatedBy" }
      /* {
        path: "deliveryRequest",
        populate: [
          { path: "materialRequest" },
          {
            path: "items",
            populate: {
              path: "receiveItem",
              populate: { path: "item purchaseOrder measuringType" }
            }
          }
        ]
      } */
    ])
    .exec((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
});

deliveries.post("/filter", (req, res) => {
  console.log("Search Q: ", req.body);
  const queryData =
    Object.entries(req.body).length > 0
      ? Object.assign(
          ...Object.entries(req.body).map(([k, v]) => ({
            [k]: new RegExp(v, "i")
          }))
        )
      : req.body;
  console.log("Search: ", queryData);
  Delivery.find(queryData)
    .populate([
      { path: "createdBy updatedBy" },
      {
        path: "deliveryRequest",
        populate: [
          { path: "materialRequest" },
          {
            path: "items",
            populate: {
              path: "receiveItem",
              populate: { path: "item purchaseOrder measuringType" }
            }
          }
        ]
      }
    ])
    .exec((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
});

deliveries.post("/requests/filter", (req, res) => {
  console.log("Search Q: ", req.body);
  const queryData =
    Object.entries(req.body).length > 0
      ? Object.assign(
          ...Object.entries(req.body).map(([k, v]) => ({
            [k]: new RegExp(v, "i")
          }))
        )
      : req.body;
  console.log("Search: ", queryData);
  DeliveryRequest.find(queryData)
    .populate([
      { path: "materialRequest createdBy updatedBy" },
      { path: "items", populate: { path: "receiveItem" } }
    ])
    .exec((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
});

deliveries.get("/:id", (req, res) => {
  Delivery.findById(req.params.id)
    .populate({
      path: "materialRequest",
      populate: {
        path: "items",
        populate: {
          path: "item stockItems"
        }
      }
    })
    .exec((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
});

deliveries.post("/requests/:id", (req, res) => {
  console.log("DeliverReq..", req.params.id);
  MaterialRequest.findById(req.params.id)
    .populate({ path: "items", populate: { path: "item" } })
    .exec(async (err, materialRequest) => {
      if (err) return res.json({ success: false, error: err });

      let deliveryRequest = new DeliveryRequest();
      deliveryRequest.materialRequest = materialRequest._id;
      deliveryRequest.createdBy = req.user.id;
      let deliveryItemIds = [];
      let updateStockMap = new Map();

      for await (const requestItem of materialRequest.items) {
        let requestedQuantity = requestItem.totalQuantity;

        const receiveItems = await ReceiveItem.find({
          item: requestItem.item,
          availableQuantity: { $gt: 0 },
          type: { $nin: ["CLEARED"] }
        })
          .sort("-createdAt")
          .populate("item")
          .exec();

        for await (const item of receiveItems) {
          let stockQuantity = item.availableQuantity;
          if (requestedQuantity >= 0) {
            let deliveryItem = new DeliveryItem();
            deliveryItem.createdBy = req.user.id;
            deliveryItem.deliveryRequest = deliveryRequest._id;
            deliveryItem.receiveItem = item._id;
            item.updatedBy = req.user.id;

            if (stockQuantity >= requestedQuantity) {
              deliveryItem.units = requestedQuantity;
              item.availableQuantity =
                item.availableQuantity - requestedQuantity;

              deliveryItemIds.push(deliveryItem._id);
              updateStockMap.get(item.item._id)
                ? updateStockMap.set(
                    item.item._id,
                    updateStockMap.get(item.item._id) + deliveryItem.units
                  )
                : updateStockMap.set(item.item._id, deliveryItem.units);

              item.save((err, data) => {
                if (err) return res.json({ success: false, error: err });
              });
              deliveryItem.save((err, data) => {
                if (err) return res.json({ success: false, error: err });
              });
              break;
            } else {
              deliveryItem.units = stockQuantity;
              item.availableQuantity = item.availableQuantity - stockQuantity;

              deliveryItemIds.push(deliveryItem._id);
              updateStockMap.get(item.item._id)
                ? updateStockMap.set(
                    item.item._id,
                    updateStockMap.get(item.item._id) + deliveryItem.units
                  )
                : updateStockMap.set(item.item._id, deliveryItem.units);

              requestedQuantity = requestedQuantity - stockQuantity;

              item.save((err, data) => {
                if (err) return res.json({ success: false, error: err });
              });
              deliveryItem.save((err, data) => {
                if (err) return res.json({ success: false, error: err });
              });
            }
          }
        }
      }
      materialRequest.status = "DELIVERY_REQUEST_PENDING";
      materialRequest.updatedBy = req.user.id;
      materialRequest.save();
      //console.log("Delivery Req: ", updateStockMap);

      updateStockMap.forEach((value, key) => {
        //console.log("Key: ", key, ", Value: ", value);
        StockItem.findById(key, (err, data) => {
          if (err) console.log("Stock find failed: ", err);
          if (data) {
            data.units = data.units - value;
            data.save((err, data) => {
              if (err) return console.log("Stock update error: ", err);
            });
          }
        });
      });

      deliveryRequest.items = deliveryItemIds;
      deliveryRequest.save((err, data) => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true, data: data });
      });
    });
});

/* deliveries.post("/requests/:id", (req, res) => {
  MaterialRequest.findById(req.params.id)
  .populate({ path: "items", populate: { path: "item" } })
  .exec(async (err, materialRequest) => {
    if (err) return res.json({ success: false, error: err });

    let deliveryRequest = new DeliveryRequest();
      deliveryRequest.materialRequest = materialRequest._id;
      deliveryRequest.createdBy = req.user.id;
  });
}); */

deliveries.post("/", (req, res) => {
  let delivery = new Delivery(req.body);
  delivery.createdBy = req.user.id;

  delivery.save((err, deliveryData) => {
    if (err) return res.json({ success: false, error: err });
    MaterialRequest.findById(deliveryData.materialRequest)
      .populate("items")
      .exec((err, materialRequest) => {
        if (err) return res.json({ success: false, error: err });
        materialRequest.status = "DELIVERY";
        materialRequest.updatedBy = req.user.id;
        const totalStocks = materialRequest.items
          .map(item => {
            return item.stockItems;
          })
          .reduce((prev, curr) => {
            return prev.concat(curr);
          });
        console.log("Stocks:", totalStocks);
        materialRequest.save((err, data) => {
          if (err) return res.json({ success: false, error: err });
          BinStock.updateMany(
            { _id: { $in: totalStocks } },
            { $set: { status: "DELIVER" } },
            (err, data) => {
              if (err) return res.json({ success: false, error: err });
              return res.json({ success: true, data: deliveryData });
            }
          );
        });
      });
  });
});

deliveries.put("/:id", (req, res) => {
  req.body._user = req.user.id;
  Delivery.findByIdAndUpdate(req.params.id, { $set: req.body }, (err, data) => {
    if (err) return res.json({ success: false, error: err });
    BinStock.updateMany(
      { _id: { $in: req.body.stockItems } },
      { $set: { status: "FACTORY_RECEIVED" } },
      (err, binStocks) => {
        if (err) return res.json({ success: false, error: err });
        MaterialRequest.findByIdAndUpdate(data.materialRequest, {$set: {status: "COMPLETE"}}, (err, materialRequest) => {
          if (err) return res.json({ success: false, error: err });
          return res.json({ success: true, data: data });
        });
      }
    );
  });
});

findAvailableStocks = async stockItemId => {
  try {
    const stocks = await ReceiveItem.find({
      item: stockItemId,
      availableQuantity: { $gt: 0 },
      type: { $nin: ["CLEARED"] }
    })
      .sort("-createdAt")
      .populate("item")
      .exec();
    console.log("Results: ", stocks);
    return stocks;
  } catch (err) {
    return "Error occurred on findAvailableStocks";
  }
};

module.exports = deliveries;
