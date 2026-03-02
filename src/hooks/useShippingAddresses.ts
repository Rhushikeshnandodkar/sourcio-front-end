"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createShippingAddress,
  deleteShippingAddress,
  fetchShippingAddresses,
  ShippingAddress,
  ShippingAddressCreateRequest,
  ShippingAddressUpdateRequest,
  updateShippingAddress,
} from "@/lib/shipping-api";

interface UseShippingOptions {
  enabled?: boolean;
}

interface UseShippingResult {
  addresses: ShippingAddress[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  createAddress: (payload: ShippingAddressCreateRequest) => Promise<ShippingAddress>;
  updateAddress: (id: number, payload: ShippingAddressUpdateRequest) => Promise<ShippingAddress>;
  deleteAddress: (id: number) => Promise<void>;
}

export function useShippingAddresses(options: UseShippingOptions = {}): UseShippingResult {
  const { enabled = true } = options;
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const loadAddresses = useCallback(async () => {
    if (!enabled) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchShippingAddresses();
      setAddresses(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load shipping addresses";
      setError(message);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  const createAddress = useCallback(
    async (payload: ShippingAddressCreateRequest) => {
      const created = await createShippingAddress(payload);
      await loadAddresses();
      return created;
    },
    [loadAddresses]
  );

  const updateAddress = useCallback(
    async (id: number, payload: ShippingAddressUpdateRequest) => {
      const updated = await updateShippingAddress(id, payload);
      await loadAddresses();
      return updated;
    },
    [loadAddresses]
  );

  const deleteAddressHandler = useCallback(
    async (id: number) => {
      await deleteShippingAddress(id);
      await loadAddresses();
    },
    [loadAddresses]
  );

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  return {
    addresses,
    loading,
    error,
    refresh: loadAddresses,
    createAddress,
    updateAddress,
    deleteAddress: deleteAddressHandler,
  };
}

