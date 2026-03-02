import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "@/components/providers/ReduxProvider";
import {
  createQuote,
  getUserQuotes,
  getQuoteById,
  updateQuote,
  deleteQuote,
  QuoteCreateRequest,
  QuoteUpdateRequest,
  Quote,
  QuoteSummary,
} from "@/lib/quotes-api";
import {
  setQuotes,
  addQuote,
  updateQuoteInList,
  removeQuote,
  setCurrentQuote,
  setLoading,
  setError,
  setTotal,
} from "./quoteSlice";

/**
 * Create quote from cart
 */
export const createQuoteFromCart = createAsyncThunk<
  Quote,
  QuoteCreateRequest | undefined,
  { dispatch: AppDispatch; state: RootState }
>(
  "quotes/create",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const quote = await createQuote(data);
      dispatch(setLoading(false));
      return quote;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create quote";
      dispatch(setError(errorMessage));
      dispatch(setLoading(false));
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Fetch user's quotes
 */
export const fetchUserQuotes = createAsyncThunk<
  { quotes: QuoteSummary[]; total: number },
  { skip?: number; limit?: number } | void,
  { dispatch: AppDispatch; state: RootState }
>(
  "quotes/fetch",
  async (params, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const skip = params && typeof params === "object" ? params.skip : 0;
      const limit = params && typeof params === "object" ? params.limit : 100;
      const result = await getUserQuotes(skip, limit);
      dispatch(setQuotes(result.quotes));
      dispatch(setTotal(result.total));
      dispatch(setLoading(false));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch quotes";
      dispatch(setError(errorMessage));
      dispatch(setLoading(false));
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Fetch quote by ID
 */
export const fetchQuoteById = createAsyncThunk<
  Quote,
  number,
  { dispatch: AppDispatch; state: RootState }
>(
  "quotes/fetchById",
  async (quoteId, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const quote = await getQuoteById(quoteId);
      dispatch(setCurrentQuote(quote));
      dispatch(setLoading(false));
      return quote;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch quote";
      dispatch(setError(errorMessage));
      dispatch(setLoading(false));
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Update quote
 */
export const updateQuoteThunk = createAsyncThunk<
  Quote,
  { quoteId: number; data: QuoteUpdateRequest },
  { dispatch: AppDispatch; state: RootState }
>(
  "quotes/update",
  async ({ quoteId, data }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const quote = await updateQuote(quoteId, data);
      dispatch(setCurrentQuote(quote));
      // Update in list if it exists
      const summary: QuoteSummary = {
        id: quote.id,
        quote_number: quote.quote_number,
        user_id: quote.user_id,
        status: quote.status,
        expires_at: quote.expires_at,
        subtotal: quote.subtotal,
        total: quote.total,
        item_count: quote.items.length,
        created_at: quote.created_at,
        updated_at: quote.updated_at,
      };
      dispatch(updateQuoteInList(summary));
      dispatch(setLoading(false));
      return quote;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update quote";
      dispatch(setError(errorMessage));
      dispatch(setLoading(false));
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Delete quote
 */
export const deleteQuoteThunk = createAsyncThunk<
  void,
  number,
  { dispatch: AppDispatch; state: RootState }
>(
  "quotes/delete",
  async (quoteId, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      await deleteQuote(quoteId);
      dispatch(removeQuote(quoteId));
      // Clear current quote if it's the one being deleted
      dispatch(setCurrentQuote(null));
      dispatch(setLoading(false));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete quote";
      dispatch(setError(errorMessage));
      dispatch(setLoading(false));
      return rejectWithValue(errorMessage);
    }
  }
);
