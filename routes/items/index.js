const items = require("express").Router();

const StockItem = require("../../models/StockItem");

items.get("/", (req, res) => {
  StockItem.find()
    .populate("packingType")
    .exec((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
});

items.get("/search", (req, res) => {
  StockItem.find({ $text: { $search: req.query.searchQuery } }).exec(
    (err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    }
  );
});

items.post("/filter", (req, res) => {
  console.log("Query: ", req.body);
  const queryData =
    Object.entries(req.body).length > 0
      ? Object.assign(
          ...Object.entries(req.body).map(([k, v]) => ({
            [k]: new RegExp(v, "i")
          }))
        )
      : req.body;
  console.log("QueryData: ", queryData);
  StockItem.find(queryData)
    .populate("packingType")
    .exec((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
});

items.post("/", (req, res) => {
  req.body.createdBy = req.user.id;
  StockItem.create(req.body, (err, data) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: data });
  });
});

items.get("/:id", (req, res) => {
  StockItem.findById(req.params.id, (err, data) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: data });
  });
});

items.put("/:id", (req, res) => {
  req.body.updatedBy = req.user.id;
  StockItem.findByIdAndUpdate(req.params.id, req.body, (err, data) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: data });
  });
});

items.delete("/:id", (req, res) => {
  StockItem.findByIdAndDelete(req.params.id, (err, data) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: data });
  });
});

module.exports = items;
