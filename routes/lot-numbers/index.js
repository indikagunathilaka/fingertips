const lotNumbers = require("express").Router();

const LotNumber = require("../../models/LotNumber");

lotNumbers.get("/", (req, res) => {
  LotNumber.find()
    .populate("createdBy updatedBy")
    .exec((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
});

lotNumbers.get("/search", (req, res) => {
  LotNumber.find({ $text: { $search: req.query.searchQuery } }).exec(
    (err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    }
  );
});

lotNumbers.post("/filter", (req, res) => {
  const queryData =
    Object.entries(req.body).length > 0
      ? Object.assign(
          ...Object.entries(req.body).map(([k, v]) => ({
            [k]: new RegExp(v, "i")
          }))
        )
      : req.body;
  LotNumber.find(queryData)
    .populate("createdBy updatedBy")
    .exec((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
});

lotNumbers.post("/", (req, res) => {
  req.body.createdBy = req.user.id;
  LotNumber.create(req.body, (err, data) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: data });
  });
});

lotNumbers.get("/:id", (req, res) => {
  LotNumber.findById(req.params.id, (err, data) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: data });
  });
});

lotNumbers.put("/:id", (req, res) => {
  req.body.updatedBy = req.user.id;
  LotNumber.findByIdAndUpdate(req.params.id, req.body, (err, data) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: data });
  });
});

lotNumbers.delete("/:id", (req, res) => {
  LotNumber.findByIdAndDelete(req.params.id, (err, data) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: data });
  });
});

module.exports = lotNumbers;
