import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SelectedVariant {
  productId: string;
  variantId: string;
}

interface ProductState {
  selectedVariants: Record<string, string>; // productId -> variantId
}

const initialState: ProductState = {
  selectedVariants: {},
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    selectVariant: (state, action: PayloadAction<SelectedVariant>) => {
      const { productId, variantId } = action.payload;
      state.selectedVariants[productId] = variantId;
    },
    clearVariant: (state, action: PayloadAction<string>) => {
      delete state.selectedVariants[action.payload];
    },
    clearAllVariants: (state) => {
      state.selectedVariants = {};
    },
  },
});

export const { selectVariant, clearVariant, clearAllVariants } = productSlice.actions;
export default productSlice.reducer;
