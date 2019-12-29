const itemCategories = require("express").Router();

const ItemCategory = require("../../models/ItemCategory");

itemCategories.get("/", (req, res) => {
    ItemCategory.find()
    .populate("packingType createdBy updatedBy")
    .exec((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
});

itemCategories.get("/search", (req, res) => {
    ItemCategory.find({ $text: { $search: req.query.searchQuery } }).exec(
    (err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    }
  );
});

itemCategories.post("/filter", (req, res) => {
  const queryData =
    Object.entries(req.body).length > 0
      ? Object.assign(
          ...Object.entries(req.body).map(([k, v]) => ({
            [k]: new RegExp(v, "i")
          }))
        )
      : req.body;
      ItemCategory.find(queryData)
    .populate("packingType createdBy updatedBy")
    .exec((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
});

itemCategories.post("/", (req, res) => {
  req.body.createdBy = req.user.id;
  ItemCategory.create(req.body, (err, supplier) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: supplier });
  });
});

itemCategories.get("/:id", (req, res) => {
    ItemCategory.findById(req.params.id, (err, data) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: data });
  });
});

itemCategories.put("/:id", (req, res) => {
  req.body.updatedBy = req.user.id;
  ItemCategory.findByIdAndUpdate(req.params.id, req.body, (err, data) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: data });
  });
});

itemCategories.delete("/:id", (req, res) => {
    ItemCategory.findByIdAndDelete(req.params.id, (err, data) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: data });
  });
});

module.exports = itemCategories;
