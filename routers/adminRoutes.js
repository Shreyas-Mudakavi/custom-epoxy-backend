const express = require("express");
const { auth, isAdmin } = require("../middlewares/auth");
const {
  getAllUsers,
  getAllOrders,
  adminLogin,
  updateUser,
  getUser,
  deleteAccont,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getAllQuotes,
  getQuote,
  deleteQuote,
  getAllTransactions,
  getTransaction,
  deleteTransaction,
  addProductImage,
} = require("../controllers/adminController");

const router = express.Router();

router.post("/login", adminLogin);

router.get("/users/all", auth, isAdmin, getAllUsers);
router.get("/users/:id", auth, isAdmin, getUser);
router.put("/users/:id", auth, isAdmin, updateUser);
router.delete("/users/:id", auth, isAdmin, deleteAccont);

router.get("/orders/all", auth, isAdmin, getAllOrders);
router.get("/orders/:id", auth, isAdmin, getOrderById);
router.put("/orders/:id", auth, isAdmin, updateOrderStatus);
router.delete("/orders/:id", auth, isAdmin, deleteOrder);

router.get("/getAllQuotes/all", auth, isAdmin, getAllQuotes);
router.get("/getQuote/:id", auth, isAdmin, getQuote);
router.delete("/delete-quote/:id", auth, isAdmin, deleteQuote);

router.get("/getAllTransactions/all", auth, isAdmin, getAllTransactions);
router.get("/getTransaction/:id", auth, isAdmin, getTransaction);
router.get("/delete-Transaction/:id", auth, isAdmin, deleteTransaction);

router.post("/add-prodImage", auth, isAdmin, addProductImage);

module.exports = router;
