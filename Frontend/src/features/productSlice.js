import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  products: [],
  selectedProduct: null,
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    // Store all products
    setProduct: (state, action) => {
      state.products = action.payload;
    },

    // Store a single product
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },

    // Clear all product data
    clearProducts: (state) => {
      state.products = [];
      state.selectedProduct = null;
    },
  },
});

export const {
  setProduct,
  setSelectedProduct,
  clearProducts,
} = productSlice.actions;

export default productSlice.reducer;
