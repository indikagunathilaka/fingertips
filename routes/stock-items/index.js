const stockItems = require("express").Router();

const StockItem = require("../../models/StockItem");
const ReceiveItem = require("../../models/ReceiveItem");

stockItems.get("/", (req, res) => {
  StockItem.find()
    .populate("createdBy updatedBy")
    .exec((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
});

stockItems.post("/", (req, res) => {
  req.body.createdBy = req.user.id;
  let item = new StockItem(req.body);

  item.save(err => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

stockItems.get("/find-stocks/:id/:quantity", (req, res) => {
  ReceiveItem.find({ item: req.params.id, type: { $nin: ["CLEARED"] } })
    .sort("-createdAt")
    .populate("item purchaseOrder measuringType")
    .exec((err, data) => {
      if (err) return res.json({ success: false, error: err });
      let queryResults = [];
      let requestedQuantity = req.params.quantity;
      for (let item of data) {
        let stockQuantity = item.unitWeight * item.units;
        if (stockQuantity >= requestedQuantity) {
          //console.log("Step 1: ", stockQuantity, ", Q:", requestedQuantity);
          queryResults.push(item);
          break;
        } else {
          //console.log("Step 1: ", stockQuantity, ", Q:", requestedQuantity);
          queryResults.push(item);
          requestedQuantity = requestedQuantity - stockQuantity;
        }
      }
      return res.json({ success: true, data: queryResults });
    });
});

stockItems.get("/:id", (req, res) => {
  StockItem.findById(req.params.id, (err, item) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: item });
  });
});

stockItems.put("/:id", (req, res) => {
  req.body.updatedBy = req.user.id;
  StockItem.findByIdAndUpdate(req.params.id, req.body, (err, item) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: item });
  });
});

stockItems.delete("/:id", (req, res) => {
  StockItem.findByIdAndDelete(req.params.id, (err, item) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: item });
  });
});

module.exports = stockItems;
