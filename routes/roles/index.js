const roles = require("express").Router();

const Role = require("../../models/Role");

roles.get("/", (req, res) => {
  Role.find()
    .populate("createdBy updatedBy")
    .exec((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
});

roles.post("/filter", (req, res) => {
  const queryData =
    Object.entries(req.body).length > 0
      ? Object.assign(
          ...Object.entries(req.body).map(([k, v]) => ({
            [k]: new RegExp(v, "i")
          }))
        )
      : req.body;
  Role.find(queryData)
    .populate("createdBy updatedBy")
    .exec((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
});

roles.post("/", (req, res) => {
  req.body.createdBy = req.user.id;
  Role.create(req.body, (err, role) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: role });
  });
});

roles.get("/:id", (req, res) => {
  Role.findById(req.params.id, (err, role) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: role });
  });
});

roles.put("/:id", (req, res) => {
  req.body.updatedBy = req.user.id;
  Role.findByIdAndUpdate(req.params.id, req.body, (err, role) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: role });
  });
});

roles.delete("/:id", (req, res) => {
  Role.findByIdAndDelete(req.params.id, (err, role) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: role });
  });
});

module.exports = roles;
