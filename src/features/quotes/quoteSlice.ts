import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Quote, QuoteSummary } from "@/lib/quotes-api";

interface QuoteState {
  quotes: QuoteSummary[];
  currentQuote: Quote | null;
  loading: boolean;
  error: string | null;
  total: number;
}

const initialState: QuoteState = {
  quotes: [],
  currentQuote: null,
  loading: false,
  error: null,
  total: 0,
};

const quoteSlice = createSlice({
  name: "quotes",
  initialState,
  reducers: {
    setQuotes: (state, action: PayloadAction<QuoteSummary[]>) => {
      state.quotes = action.payload;
    },
    addQuote: (state, action: PayloadAction<QuoteSummary>) => {
      state.quotes.unshift(action.payload);
      state.total += 1;
    },
    updateQuoteInList: (state, action: PayloadAction<QuoteSummary>) => {
      const index = state.quotes.findIndex((q) => q.id === action.payload.id);
      if (index !== -1) {
        state.quotes[index] = action.payload;
      }
    },
    removeQuote: (state, action: PayloadAction<number>) => {
      state.quotes = state.quotes.filter((q) => q.id !== action.payload);
      state.total -= 1;
    },
    setCurrentQuote: (state, action: PayloadAction<Quote | null>) => {
      state.currentQuote = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setTotal: (state, action: PayloadAction<number>) => {
      state.total = action.payload;
    },
    clearQuotes: (state) => {
      state.quotes = [];
      state.currentQuote = null;
      state.total = 0;
    },
  },
});

export const {
  setQuotes,
  addQuote,
  updateQuoteInList,
  removeQuote,
  setCurrentQuote,
  setLoading,
  setError,
  setTotal,
  clearQuotes,
} = quoteSlice.actions;

export default quoteSlice.reducer;
