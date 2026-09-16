"use client";
import { useEffect } from "react";
export function ResourceMonitor() {
  useEffect(() => { void import("./project-resource-monitor.js"); }, []);
  return null;
}
