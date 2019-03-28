const suppliers = require("express").Router();

const Supplier = require("../../models/Supplier");

suppliers.get("/", (req, res) => {
  Supplier.find()
    .populate("createdBy updatedBy")
    .exec((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
});

suppliers.get("/search", (req, res) => {
  Supplier.find({ $text: { $search: req.query.searchQuery } }).exec(
    (err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    }
  );
});

suppliers.post("/filter", (req, res) => {
  const queryData =
    Object.entries(req.body).length > 0
      ? Object.assign(
          ...Object.entries(req.body).map(([k, v]) => ({
            [k]: new RegExp(v, "i")
          }))
        )
      : req.body;
  Supplier.find(queryData)
    .populate("createdBy updatedBy")
    .exec((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
});

suppliers.post("/", (req, res) => {
  req.body.createdBy = req.user.id;
  Supplier.create(req.body, (err, supplier) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: supplier });
  });
});

suppliers.get("/:id", (req, res) => {
  Supplier.findById(req.params.id, (err, supplier) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: supplier });
  });
});

suppliers.put("/:id", (req, res) => {
  req.body.updatedBy = req.user.id;
  Supplier.findByIdAndUpdate(req.params.id, req.body, (err, supplier) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: supplier });
  });
});

suppliers.delete("/:id", (req, res) => {
  Supplier.findByIdAndDelete(req.params.id, (err, supplier) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: supplier });
  });
});

module.exports = suppliers;
