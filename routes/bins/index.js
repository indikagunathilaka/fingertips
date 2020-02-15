const bins = require("express").Router();
const moment = require("moment");

const Bin = require("../../models/Bin");
const BinStock = require("../../models/BinStock");
const OrderItem = require("../../models/OrderItem");
const purchaseOrder = require("../../models/PurchaseOrder");

bins.get("/", (req, res) => {
  Bin.find()
    .sort([
      ["section", "asc"],
      ["xAxis", "asc"],
      ["yAxis", "asc"]
    ])
    .exec((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
});

bins.get("/with-stocks", (req, res) => {
  Bin.aggregate([
    {
      $lookup: {
        from: "BinStock",
        localField: "_id",
        foreignField: "bin",
        as: "stocks"
      }
    },
    {
      $unwind: { path: "$stocks" }
    }
  ]).exec((err, data) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: data });
  });
});

bins.get("/search", (req, res) => {
  let search = {};
  let searchBinStock = { status: { $in: ["AVAILABLE", "RESERVED", "DISPATCHED"] } };
  if (req.query.lotNumber) {
    searchBinStock.lotNumber = req.query.lotNumber;
  }
  if (req.query.itemCode) {
    searchBinStock.itemCode = req.query.itemCode;
  }
  if (req.query.code) {
    search.code = req.query.code;
  }
  /* BinStock.find(searchBinStock, (err, stocks) => {
    search.stockItems = { $in: stocks.map(item => item._id)}
  }); */
  Bin.find(search)
    .sort([
      ["section", "asc"],
      ["xAxis", "asc"],
      ["yAxis", "asc"]
    ])
    .populate({ path: "stockItems", match: searchBinStock })
    .exec((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
});

bins.post("/filter", (req, res) => {
  const queryData =
    Object.entries(req.body).length > 0
      ? Object.assign(
          ...Object.entries(req.body).map(([k, v]) => ({
            [k]: new RegExp(v, "i")
          }))
        )
      : req.body;
  Bin.find(queryData).exec((err, data) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: data });
  });
});

bins.post("/", (req, res) => {
  req.body.code = `${req.body.section}${req.body.xAxis}${req.body.yAxis}`;
  let bin = new Bin(req.body);
  bin.save((err, bin) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: bin });
  });
});

/* bins.get("/:id", (req, res) => {
  Bin.findById(req.params.id, (err, bin) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: bin });
  });
}); */

bins.put("/:binId/stocks/:binStockId", (req, res) => {
  req.body.updatedBy = req.user.id;
  req.body.detailsStatus = "COMPLETE";
  BinStock.findByIdAndUpdate(
    req.params.binStockId,
    { $set: req.body },
    (err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    }
  );
  /* BinStock.findById(req.params.binStockId, (err, binStock) => {
    if (err) return res.json({ success: false, error: err });
    binStock.netWeight = req.body.netWeight;
    binStock.grossWeight = req.body.grossWeight;
    binStock.cones = req.body.cones;
    binStock.updatedBy = req.body.updatedBy;
    binStock.save((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
  }); */
});

bins.put("/:id", (req, res) => {
  req.body.updatedBy = req.user.id;
  Bin.findByIdAndUpdate(req.params.id, req.body, (err, bin) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: bin });
  });
});

bins.delete("/:id", (req, res) => {
  Bin.findByIdAndDelete(req.params.id, (err, bin) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: bin });
  });
});

bins.post("/generate", (req, res) => {
  req.body.sections.forEach(section => {
    req.body.xAxis.forEach(x => {
      req.body.yAxis.forEach(y => {
        let bin = new Bin();
        bin.section = section;
        bin.xAxis = x;
        bin.yAxis = y;
        bin.code = `${section}${x}${y}`;
        bin.save();
      });
    });
  });
});

bins.post("/:id/stocks", (req, res) => {
  const stockItem = req.body.stockItem;
  let binStocks = [];
  OrderItem.findById(stockItem.orderItem, async (err, item) => {
    if (err)
      return res.json({ success: false, error: "Order Item not found." });
    for (
      let i = item.receivedUnits + 1;
      i <= stockItem.units + item.receivedUnits;
      i++
    ) {
      //console.log("Run:", item.receivedUnits);
      //let runningNumber = i;
      console.log("PackSerial:", stockItem.packingListNumber+ moment(item.purchaseOrder.createdAt).format("YYYYMMDD") + i + "/" + item.units);
      let binStock = new BinStock({
        bin: stockItem.bin,
        orderItem: stockItem.orderItem,
        runningNumber: i + "/" + item.units,
        packSerial: stockItem.packingListNumber + moment(item.purchaseOrder.createdAt).format("YYYYMMDD") + i + "/" + item.units,
        lotNumber: stockItem.lotNumber,
        itemCode: stockItem.itemCode,
        binCode: stockItem.binCode,
        createdBy: req.user.id
      });
      binStocks.push(binStock._id);
      await binStock.save();
    }
    item.receivedUnits += stockItem.units;
    item.pendingUnits = item.units - item.receivedUnits;
    item.updatedBy = req.user.id;
    await item.save();
    if (item.pendingUnits === 0) {
      await purchaseOrder
        .findByIdAndUpdate(item.purchaseOrder, { $set: { status: "COMPLETE" } })
        .exec();
    } else {
      await purchaseOrder
        .findByIdAndUpdate(item.purchaseOrder, {
          $set: { status: "RECEIVE_PENDING" }
        })
        .exec();
    }

    Bin.findById(stockItem.bin, (err, bin) => {
      if (err) return res.json({ success: false, error: "Bin not found." });
      bin.stockItems.push(...binStocks);
      bin.save((err, bin) => {
        if (err) return res.json({ success: false, error: err });
        return res.json({
          success: true,
          message: "Stocks saved successfull."
        });
      });
    });
  });
});

bins.post("/stocks/batch", (req, res) => {
  req.body.stockItems.forEach(obj => {
    //let item = new StockItem(obj);
    obj.createdBy = req.user.id;
    /* if (obj._id) {
      item._id = obj._id;
      Item.updateOne({ _id: obj._id }, item, err => {
        if (err) return console.log("Item update error: ", err);
      });
    } */
  });
  BinStock.collection.insert(req.body.stockItems, async (err, stocks) => {
    if (err) return res.json({ success: false, error: err });

    for await (stock of stocks) {
      Bin.findById(stock.bin, (err, data) => {
        if (err) console.log("Bin find failed: ", err);
        if (data) {
          data.stockItems.push(stock);
          data.save((err, data) => {
            if (err) return console.log("Bin update error: ", err);
          });
        }
      });
    }
    return res.json({ success: true });
  });
});

bins.put("/stocks/batch", async (req, res) => {
  for (stock of req.body.stockItems) {
    const binStock = await BinStock.findByIdAndUpdate(stock._id, {
      $set: stock.update
    });
  }
  return res.json({ success: true });
});

bins.get("/stocks", (req, res) => {
  let searchParam = { status: { $in: ["AVAILABLE", "RESERVED"] } };
  if (req.query.itemCode) {
    searchParam.itemCode = req.query.itemCode;
  }
  if (req.query.lotNumber) {
    searchParam.lotNumber = req.query.lotNumber;
  }
  if (req.query.binCode) {
    searchParam.binCode = req.query.binCode;
  }
  //console.log("Search:", searchParam);
  BinStock.find(searchParam)
    .populate([
      {
        path: "orderItem",
        populate: { path: "item" }
      },
      { path: "bin" }
    ])
    .exec((err, data) => {
      //console.log("Data:", data, ", Error:", err);
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
});

bins.get("/stocks/:poId", (req, res) => {
  purchaseOrder.findById(req.params.poId, (err, po) => {
    BinStock.find({ orderItem: { $in: po.items } })
      .populate("orderItem bin")
      .exec((err, data) => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true, data: data });
      });
  });
});

bins.get("/stocks-by-materials/:materialNumber", (req, res) => {
  BinStock.find()
    .populate([
      {
        path: "orderItem",
        populate: { path: "item", match: { code: req.params.materialNumber } }
      }
    ])
    .exec((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
});

bins.get("/stocks-by-lot", (req, res) => {
  console.log("lotNum:", req.query);
  BinStock.find({ lotNumber: req.query.lotNumber })
    .populate({ path: "bin" })
    .exec((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
  /* BinStock.find()
    .populate([
      {
        path: "orderItem", match: { lotNumber: req.query.lotNumber },
      },
      { path: "bin" }
    ])
    .exec((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    }); */
});

module.exports = bins;
