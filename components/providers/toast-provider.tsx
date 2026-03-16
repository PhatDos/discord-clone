"use client";

import { useEffect, useState } from "react";
import { Toaster } from "../ui/toaster";

export const ToastProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <Toaster />;
};