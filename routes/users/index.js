const users = require("express").Router();
const bcrypt = require("bcryptjs");

const User = require("../../models/User");

users.post("/", (req, res) => {
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: "Email already exists" });
    }

    const newUser = new User(req.body);
    newUser.createdBy = req.user.id;

    // Hash password before save
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;
        newUser
          .save()
          .then(user => res.json(user))
          .catch(err => console.log(err));
      });
    });
  });
});

users.get("/", (req, res) => {
  User.find()
    .populate("roles createdBy updatedBy")
    .exec((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
});

users.post("/filter", (req, res) => {
  const queryData =
    Object.entries(req.body).length > 0
      ? Object.assign(
          ...Object.entries(req.body).map(([k, v]) => ({
            [k]: new RegExp(v, "i")
          }))
        )
      : req.body;
  User.find(queryData)
    .populate("roles createdBy updatedBy")
    .exec((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
});

users.get("/:id", (req, res) => {
  User.findById(req.params.id, (err, user) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: user });
  });
});

users.put("/:id", (req, res) => {
  req.body.updatedBy = req.user.id;
  let user = new User(req.body);
  user.updatedBy = req.user.id;
  user._id = req.params.id;
  User.findById(user._id, (err, data) => {
    if (err) return res.json({ success: false, error: err });

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        if (err) throw err;
        user.password = hash;
        user
          .save()
          .then(user => res.json(user))
          .catch(err => console.log(err));
      });
    });
  });
  /* User.findByIdAndUpdate(req.params.id, req.body, (err, user) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: user });
  }); */
});

users.delete("/:id", (req, res) => {
  User.findByIdAndDelete(req.params.id, (err, user) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: user });
  });
});

users.post("/admin", (req, res) => {
  let adminUser = new User();
  adminUser.firstName = "Indika";
  adminUser.lastName = "Samarawickrama";
  adminUser.email = "indikas@gmail.com";
  adminUser.password = "qwer1234";

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(adminUser.password, salt, (err, hash) => {
      if (err) throw err;
      adminUser.password = hash;
      adminUser
        .save()
        .then(user => res.json(user))
        .catch(err => console.log(err));
    });
  });
});

module.exports = users;
