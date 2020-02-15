const purchaseOrders = require("express").Router();

const PurchaseOrder = require("../../models/PurchaseOrder");
const OrderItem = require("../../models/OrderItem");
const ReceiveItem = require("../../models/ReceiveItem");
const ItemCategory = require("../../models/ItemCategory");
const StockItem = require("../../models/StockItem");

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

purchaseOrders.get("/", (req, res) => {
  PurchaseOrder.find()
    .populate([
      {
        path: "items",
        populate: { path: "item measuringType" }
      },
      { path: "supplier" },
      { path: "createdBy" },
      { path: "updatedBy" }
    ])
    .sort({ createdAt: -1 })
    .exec((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
});

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

purchaseOrders.get("/order-items/:id", (req, res) => {
  OrderItem.find({ purchaseOrder: req.params.id })
    .populate("item measuringType")
    .exec((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
});

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
  const orderItemIds = [];

  req.body.items.forEach(item => {
    let orderItem = new OrderItem(item);
    orderItem.purchaseOrder = purchaseOrder._id;
    orderItem.createdBy = req.user.id;
    //orderItem.totalQuantity = orderItem.unitWeight * orderItem.units;
    //orderItem.pendingQuantity = orderItem.totalQuantity;
    orderItemIds.push(orderItem._id);

    orderItem.save((err, orderItem) => {
      if (err) return res.json({ success: true, error: err });
    });
  });
  purchaseOrder.items = orderItemIds;
  purchaseOrder.save((err, purchaseOrder) => {
    if (err) return res.json({ success: false, error: err });

    return res.json({ success: true, data: purchaseOrder });
  });
});

purchaseOrders.post("/:id/stocks-update", (req, res) => {
  PurchaseOrder.findById(req.params.id)
    .populate([
      {
        path: "items"
      }
    ])
    .exec((err, purchaseOrder) => {
      if (err) return res.json({ success: false, error, err });

      let updateStocks = [];
      req.body.items.forEach(item => {
        let receiveItem = new ReceiveItem(item);
        receiveItem.purchaseOrder = purchaseOrder._id;
        receiveItem.totalQuantity = receiveItem.unitWeight * receiveItem.units;
        receiveItem.availableQuantity =
          receiveItem.unitWeight * receiveItem.units;
        receiveItem.createdBy = req.user.id;
        let orderItem = purchaseOrder.items.find(
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
        }
        //console.log("Update Receive Item: ", receiveItem._id);
        receiveItem.save((err, receiveItem) => {
          if (err) return res.json({ success: true, error: err });
        });
      });
      //console.log("Update Order Items: ", purchaseOrder.items);
      //console.log("Update Items: ", updateOrderItems);
      purchaseOrder.items.forEach(orderItem => {
        //console.log("Updatable Item: ", orderItem);
        orderItem.save((err, data) => {
          if (err) return console.log("Order item update error: ", err);
          //console.log("Update Order Item: ", data);
        });
        /* OrderItem.findOneAndUpdate(
          { _id: orderItem._id },
          orderItem,
          { new: true, upsert: true },
          (err, data) => {
            if (err) return console.log("Order item update error: ", err);
            
          }
        ); */
      });
      //console.log("Stocks: ", updateStocks);
      updateStocks.forEach(stock => {
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
      });
      purchaseOrder.status = "RECEIVE_PENDING";
      purchaseOrder.updatedBy = req.user.id;
      PurchaseOrder.findOneAndUpdate(
        purchaseOrder._id,
        purchaseOrder,
        (err, data) => {
          if (err) console.log("Purchase order status update failed: ", err);
          return res.json({ success: true, data: purchaseOrder });
        }
      );
    });
});

purchaseOrders.post("/filter", (req, res) => {
  PurchaseOrder.find(req.body)
    .populate([
      { path: "supplier" },
      { path: "items", populate: { path: "item measuringType" } },
      { path: "createdBy" },
      { path: "updatedBy" }
    ])
    .exec((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
});

purchaseOrders.get("/items/lot-numbers", (req, res) => {
  ItemCategory.findOne({ code: req.query.itemCode }, { _id: 1 }, (err, doc) => {
    let id = doc._id;
    OrderItem.find({ item: { $in: id } })
      .distinct("lotNumber")
      .exec((err, docs) => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true, data: docs });
      });
  });
});

purchaseOrders.get("/:id", (req, res) => {
  PurchaseOrder.findById(req.params.id)
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
    .exec((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
});

purchaseOrders.put("/:id", async (req, res) => {
  let purchaseOrder = await PurchaseOrder.findById(req.params.id)
    .populate("items")
    .exec();

  if (purchaseOrder) {
    let deletedItems = await OrderItem.deleteMany({
      _id: { $in: purchaseOrder.items.map(item => item._id) }
    });

    const orderItemIds = [];
    for (orderItemData of req.body.items) {
      let orderItem = new OrderItem(orderItemData);
      orderItem.purchaseOrder = purchaseOrder._id;
      orderItem.createdBy = req.user.id;

      orderItem = await orderItem.save();
      orderItemIds.push(orderItem._id);
    }

    /* req.body.items.forEach(orderItemData => {
    let orderItem = new OrderItem(orderItemData);

    if (orderItemData._id) {
      orderItem._id = orderItemData._id;
      orderItem.updatedBy = req.user.id;
      orderItemIds.push(orderItem._id);
      OrderItem.updateOne({ _id: orderItem._id }, orderItem, err => {
        if (err) return console.log("Order item update error: ", err);
      });
    } else {
      orderItemIds.push(orderItem._id);
      let stockItem = new StockItem(orderItemData.item);
      stockItem.createdBy = req.user.id;
      stockItem.save((err, stockItem) => {
        if (err) return console.log("Stock item create error: ", err);

        orderItem.item = stockItem._id;
        orderItem.createdBy = req.user.id;
        orderItem.save((err, orderItem) => {
          if (err) return console.log("Order item create error: ", err);
        });
      });
    }
  }); */

    purchaseOrder.items = orderItemIds;
    purchaseOrder.codePrefix = req.body.codePrefix;
    purchaseOrder.codeSuffix = req.body.codeSuffix;
    purchaseOrder.code = req.body.code;
    purchaseOrder.netWeight = req.body.netWeight;
    purchaseOrder.grossWeight = req.body.grossWeight;
    purchaseOrder.orderDate = req.body.orderDate;
    purchaseOrder.receivedDate = req.body.receivedDate;
    purchaseOrder.updatedBy = req.user.id;
    
    purchaseOrder.save((err, order) => {
      if (err) {
        console.log("Edit Error:", err);
        return res.json({ success: false, error: err });
      }
      return res.json({ success: true, data: order });
    });
    /* PurchaseOrder.updateOne(
      { _id: purchaseOrder._id },
      purchaseOrder,
      { new: true, upsert: true },
      (err, order) => {
        if (err) {
          console.log("Edit Error:", err);
          return res.json({ success: false, error: err });
        }
        return res.json({ success: true, data: order });
      } 
    );*/
    //return res.json({ success: true, data: purchaseOrder });
  } else {
    return res.json({ success: false });
  }
});

purchaseOrders.delete("/:id", (req, res) => {
  PurchaseOrder.findByIdAndDelete(req.params.id, (err, order) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: order });
  });
});

purchaseOrders.post("/bulk-update", (req, res) => {
  console.log("ID List:", req.body);
  req.body.idList.forEach(id => {
    req.body.data.updatedBy = req.user.id;
    //console.log("Update data:", id);
    /* PurchaseOrder.findOneAndUpdate(
      {_id: '5defceeb7fabfe8bfc1724db'},
      JSON.parse({ status: 'APPROVAL_PENDING' }),
      (err, data) => {
        if (err) console.log("Purchase order status update failed: ", err);
        return res.json({ success: true, data: data });
      }
    ); */
    PurchaseOrder.findById(id, (err, data) => {
      if (err) console.log("PurchaseOrder find failed: ", err);
      if (data) {
        //console.log("Update data:", data);
        data.status = req.body.data.status;
        data.updatedBy = req.user.id;
        data.save((err, data) => {
          if (err) return console.log("PurchaseOrder update error: ", err);
          //return res.json({ success: true, data: data });
        });
      }
    });
  });
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
  console.log("PO Status Update:", updatePO);
  PurchaseOrder.findOneAndUpdate(updatePO._id, updatePO, (err, data) => {
    if (err) console.log("Purchase order status update failed: ", err);
  });
  /* PurchaseOrder.findById(updatePO._id, (err, data) => {
    if (err) console.log("PurchaseOrder find failed: ", err);
    if (data) {
      data.status = req.body.data.status;
      data.updatedBy = req.user.id;
      data.save((err, data) => {
        if (err) console.log("Purchase order status update failed: ", err);
      });
    }
  }); */

  return res.json({ success: true });
});

module.exports = purchaseOrders;
