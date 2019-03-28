const purchaseOrders = require("express").Router();

const PurchaseOrder = require("../../models/PurchaseOrder");
const OrderItem = require("../../models/OrderItem");
const ReceiveItem = require("../../models/ReceiveItem");
const StockItem = require("../../models/StockItem");

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

populateOrderItems = async orders => {
  let orderList = [];
  await asyncForEach(orders, async order => {
    const items = await OrderItem.find({ purchaseOrder: order._id })
      .populate("item measuringType")
      .exec((err, data) => {
        if (data) {
          console.log("Item: ", data);
          order.items = data;
        }
      });
    console.log("Items----: ", items);
    orderList.push(order);
  });
  console.log("Orders: ", orderList);
  return orderList;
};

findOrderItemsByOrderId = order => {
  OrderItem.find({ purchaseOrder: order._id })
    .populate("item measuringType")
    .exec((err, data) => {
      if (err) return null;
      console.log("Item: ", data);
      order.items = data;
    });
};

/** TODO: Unused */
purchaseOrders.get("/order-items/:id", (req, res) => {
  OrderItem.find({ purchaseOrder: req.params.id })
    .populate("item measuringType")
    .exec((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
});

purchaseOrders.get("/", (req, res) => {
  PurchaseOrder.find()
    .populate([
      { path: "supplier" },
      { path: "createdBy" },
      { path: "updatedBy" }
    ])
    .exec((err, purchaseOrders) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: purchaseOrders });
    });
});

purchaseOrders.get(
  "/:id/order-items/:stockItemId/received-quantity",
  (req, res) => {
    let receivedQuantity = 0;
    ReceiveItem.find(
      { purchaseOrder: req.params.id, item: req.params.stockItemId },
      async (err, data) => {
        if (err) return res.json({ success: false, error: err });

        for await (const receiveItem of data) {
          receivedQuantity += receiveItem.totalQuantity;
        }
        return res.json({ success: true, data: receivedQuantity });
      }
    );
  }
);
// purchaseOrders.get("/", async (req, res) => {
//   console.log("Get All: ");
//   const purchaseOrders = await PurchaseOrder.find()
//     .populate([
//       { path: "supplier" },
//       { path: "createdBy" },
//       { path: "updatedBy" }
//     ])
//     .exec()
//     .then(purchaseOrders => {
//       return purchaseOrders;
//     })
//     .catch(err => {
//       console.log("PurchaseOrder retrieve error: ", err);
//     });
//   for await (order of purchaseOrders) {
//     const items = await OrderItem.find({ purchaseOrder: order._id })
//       .populate("item measuringType")
//       .exec()
//       .then(items => {
//         console.log("OrderItem retrieve: ", items);
//         return items;
//       })
//       .catch(err => {
//         console.log("OrderItem retrieve error: ", err);
//       });
//     order.items = items;
//     console.log("OrderItem assigned: ");
//   }
//   console.log("Get All Finished: ");

//   //if (err) return res.json({ success: false, error: err });
//   return res.json({ success: true, data: purchaseOrders });
// });

purchaseOrders.post("/", (req, res) => {
  /* let purchaseOrder = new PurchaseOrder(req.body);
  const orderItemIds = [];

  req.body.items.forEach(orderItemData => {
    let orderItem = new OrderItem(orderItemData);
    orderItem.createdBy = req.user.id;
    orderItemIds.push(orderItem._id);

    orderItem.save((err, orderItem) => {
      if (err) return res.json({ success: false, error: err });
    });
  });
  purchaseOrder.items = orderItemIds;
  purchaseOrder.createdBy = req.user.id;
  purchaseOrder.save((err, purchaseOrder) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: purchaseOrder });
  }); */

  // For new changes
  let purchaseOrder = new PurchaseOrder(req.body);
  purchaseOrder.createdBy = req.user.id;
  //const orderItemIds = [];

  req.body.items.forEach(item => {
    let orderItem = new OrderItem(item);
    orderItem.purchaseOrder = purchaseOrder._id;
    orderItem.createdBy = req.user.id;
    orderItem.totalQuantity = orderItem.unitWeight * orderItem.units;

    orderItem.save((err, orderItem) => {
      if (err) return res.json({ success: true, error: err });
    });
  });
  //purchaseOrder.items = orderItemIds;
  purchaseOrder.save((err, purchaseOrder) => {
    if (err) return res.json({ success: false, error: err });

    return res.json({ success: true, data: purchaseOrder });
  });
});

purchaseOrders.post("/:id/stocks-update", (req, res) => {
  PurchaseOrder.findById(req.params.id, async (err, purchaseOrder) => {
    if (err) return res.json({ success: false, error, err });

    //let updateStocks = [];
    for await (const item of req.body.items) {
      let receiveItem = new ReceiveItem(item);
      receiveItem.purchaseOrder = purchaseOrder._id;
      receiveItem.totalQuantity = receiveItem.unitWeight * receiveItem.units;
      receiveItem.availableQuantity = receiveItem.totalQuantity;
      receiveItem.createdBy = req.user.id;

      receiveItem.save((err, receiveItem) => {
        if (err) return res.json({ success: true, error: err });
        StockItem.findById(receiveItem.item, (err, stockItem) => {
          if (err) return res.json({ success: true, error: err });
          stockItem.units += receiveItem.totalQuantity;
          stockItem.availableUnits += receiveItem.totalQuantity;
          stockItem.save();
        });
      });
      /* let orderItem = purchaseOrder.items.find(
          orderItem => orderItem.item == item.item
        );
        if (orderItem) {
          orderItem.receiveItems.push(receiveItem._id);
          orderItem.pendingQuantity =
            orderItem.pendingQuantity - receiveItem.totalQuantity;
          orderItem.updatedBy = req.user.id;
          updateStocks.push({
            id: orderItem.item,
            units: receiveItem.totalQuantity
          });
        } */
      //console.log("Update Receive Item: ", receiveItem._id);
    }
    //console.log("Update Order Items: ", purchaseOrder.items);
    //console.log("Update Items: ", updateOrderItems);
    /* purchaseOrder.items.forEach(orderItem => {
        console.log("Updatable Item: ", orderItem);
        orderItem.save((err, data) => {
          if (err) return console.log("Order item update error: ", err);
          console.log("Update Order Item: ", data);
        });
      }); */
    //console.log("Stocks: ", updateStocks);
    /* updateStocks.forEach(stock => {
        StockItem.findById(stock.id, (err, data) => {
          if (err) console.log("Stock find failed: ", err);
          if (data) {
            data.units = isNaN(data.units)
              ? stock.units
              : data.units + stock.units;
            data.save((err, data) => {
              if (err) return console.log("Stock update error: ", err);
            });
          }
        });
      }); */
    purchaseOrder.status = "RECEIVE_PENDING";
    purchaseOrder.updatedBy = req.user.id;
    purchaseOrder.save((err, data) => {
      if (err) console.log("Purchase order status update failed: ", err);
      return res.json({ success: true, data: data });
    });
  });
});

purchaseOrders.post("/filter", (req, res) => {
  PurchaseOrder.find(req.body)
    .populate([
      { path: "supplier" },
      /* { path: "items", populate: { path: "item measuringType" } }, */
      { path: "createdBy" },
      { path: "updatedBy" }
    ])
    .exec(async (err, data) => {
      for await (order of data) {
        await OrderItem.find({ purchaseOrder: order._id })
          .populate("item measuringType")
          .exec()
          .then(items => {
            order.items = items;
          })
          .catch(err => {
            console.log("OrderItem retrieve error: ", err);
          });
      }
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
});

purchaseOrders.get("/:id/order-items", (req, res) => {
  OrderItem.find({ purchaseOrder: req.params.id })
    .populate("item measuringType")
    .exec((err, orderItems) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: orderItems });
    });
});

purchaseOrders.get("/:id/receive-items", (req, res) => {
  ReceiveItem.find({ purchaseOrder: req.params.id })
    .populate("item measuringType")
    .sort("item.code")
    .exec((err, receiveItems) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: receiveItems });
    });
});

purchaseOrders.get("/:id", (req, res) => {
  /* const orderItems = await OrderItem.find({ purchaseOrder: req.params.id })
    .populate("item measuringType")
    .exec()
    .then(items => {
      return items;
    })
    .catch(err => {
      console.log("OrderItem retrieve error: ", err);
    });
  console.log("Step1 : ", orderItems); */
  /* const receiveItems = await ReceiveItem.find({
    purchaseOrder: req.params.id
  })
    .populate("item measuringType")
    .sort("item.code")
    .exec()
    .then(receiveItems => {
      return receiveItems;
      //console.log("Inside loop2:", data.receiveItems);
    })
    .catch(err => {
      console.log("ReceiveItem retrieve error: ", err);
    });
  console.log("Step2 : ", receiveItems); */
  PurchaseOrder.findById(req.params.id)
    .populate("supplier createdBy updatedBy")
    .exec((err, purchaseOrder) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: purchaseOrder });
    });

  /* PurchaseOrder.findById(req.params.id)
    .populate([
      {
        path: "items",
        populate: [
          { path: "item measuringType" },
          { path: "receiveItems", populate: { path: "item measuringType" } }
        ]
      },
      { path: "supplier" },
      { path: "createdBy" },
      { path: "updatedBy" }
    ])
    .exec(async (err, data) => {
      console.log("Before loops:");
      let pOrder = data;
      const orderItems = await OrderItem.find({ purchaseOrder: data._id })
        .populate("item measuringType")
        .exec()
        .then(items => {
          return items;
          console.log("Inside loop1:", data.items);
        })
        .catch(err => {
          console.log("OrderItem retrieve error: ", err);
        });
      const receiveItems = await ReceiveItem.find({ purchaseOrder: data._id })
        .populate("item measuringType")
        .sort("item.code")
        .exec()
        .then(receiveItems => {
          return receiveItems;
          console.log("Inside loop2:", data.receiveItems);
        })
        .catch(err => {
          console.log("ReceiveItem retrieve error: ", err);
        });
      pOrder["items"] = orderItems;
      pOrder["receiveItems"] = receiveItems;
      console.log("Outside both loops:", pOrder);
      if (err) return res.json({ success: false, error, err });
      return res.json({ success: true, data: data });
    }); */
});

purchaseOrders.put("/:id", (req, res) => {
  let purchaseOrder = new PurchaseOrder(req.body);
  purchaseOrder._id = req.params.id;
  purchaseOrder.updatedBy = req.user.id;
  OrderItem.deleteMany({ purchaseOrder: purchaseOrder._id });

  req.body.items.forEach(orderItemData => {
    let orderItem = new OrderItem(orderItemData);
    orderItem.createdBy = req.user.id;
    orderItem.totalQuantity = orderItem.unitWeight * orderItem.units;
    orderItem.pendingQuantity = orderItem.totalQuantity;

    orderItem.save((err, orderItem) => {
      if (err) return res.json({ success: false, error: err });
    });
  });

  purchaseOrder.save((err, purchaseOrder) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: purchaseOrder });
  });
});

/* purchaseOrders.put("/:id", (req, res) => {
  let purchaseOrder = new PurchaseOrder(req.body);
  purchaseOrder._id = req.params.id;
  const orderItemIds = [];

  PurchaseOrder.findById(req.params.id)
    .populate("items")
    .exec((err, order) => {
      if (!err) {
        OrderItem.deleteMany({
          _id: { $in: order.items.map(item => item._id) }
        });
      }
    });
  req.body.items.forEach(orderItemData => {
    let orderItem = new OrderItem(orderItemData);
    orderItem.createdBy = req.user.id;
    orderItem.totalQuantity = orderItem.unitWeight * orderItem.units;
    orderItem.pendingQuantity = orderItem.totalQuantity;
    orderItemIds.push(orderItem._id);

    orderItem.save((err, orderItem) => {
      if (err) return res.json({ success: false, error: err });
    });
  });
  purchaseOrder.items = orderItemIds;
  purchaseOrder.updatedBy = req.user.id;
  PurchaseOrder.updateOne(
    { _id: purchaseOrder._id },
    purchaseOrder,
    { new: true, upsert: true },
    (err, order) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: order });
    }
  );
}); */

purchaseOrders.delete("/:id", (req, res) => {
  PurchaseOrder.findByIdAndDelete(req.params.id, (err, order) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: order });
  });
});

purchaseOrders.post("/bulk-update", async (req, res) => {
  for await (const id of req.body.idList) {
    try {
      const purchaseOrder = await PurchaseOrder.findById(id);
      purchaseOrder.updatedBy = req.user.id;
      if (req.body.data.status) {
        purchaseOrder.status = req.body.data.status;
      } else if (req.body.data.comment) {
        purchaseOrder.comment = req.body.data.comment;
      }
      await purchaseOrder.save();
    } catch (err) {
      if (err) return res.json({ success: false, error: err });
    }
  }
  return res.json({ success: true });
});

purchaseOrders.post("/bulk-items-update", (req, res) => {
  req.body.items.forEach(obj => {
    let item = new OrderItem(obj);
    if (obj._id) {
      item._id = obj._id;
      Item.updateOne({ _id: obj._id }, item, err => {
        if (err) return console.log("Item update error: ", err);
      });
    }
  });
  return res.json({ success: true });
});

purchaseOrders.post("/stocks-update", (req, res) => {
  let updatePO = req.body;
  let updateStocks = [];

  updatePO.updatedBy = req.user.id;
  updatePO.items.map(item => {
    if (item.receiveUnitWeight && item.receiveUnits) {
      updateStocks.push({
        id: item.item._id,
        unitWeight: item.receiveUnitWeight,
        units: item.receiveUnits
      });

      item.receivedDate = new Date();
      item.status = "IN_STOCK";
      item.item = item.item._id;
      item.orderMeasuringType = item.orderMeasuringType._id;
    }
  });

  updatePO.items.forEach(orderItem => {
    OrderItem.findOneAndUpdate(
      { _id: orderItem._id },
      orderItem,
      (err, data) => {
        if (err) return console.log("Order item update error: ", err);
      }
    );
  });
  //console.log("Stocks: ", updateStocks);
  updateStocks.forEach(stock => {
    StockItem.findById(stock.id, (err, data) => {
      if (err) console.log("Stock find failed: ", err);
      if (data) {
        data.units = isNaN(data.units) ? stock.units : data.units + stock.units;
        data.save((err, data) => {
          if (err) return console.log("Stock update error: ", err);
          //console.log("Updated stock: ", data);
        });
      }
    });
  });
  PurchaseOrder.findOneAndUpdate(updatePO._id, updatePO, (err, data) => {
    if (err) console.log("Purchase order status update failed: ", err);
  });

  return res.json({ success: true });
});

module.exports = purchaseOrders;
