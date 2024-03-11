'use client';

import "./globals.css";
import { ThemeProvider } from "@material-tailwind/react";

export default ({ children }) => <html><body className="flex min-h-screen flex-col items-center justify-between"><ThemeProvider>{children}</ThemeProvider></body></html>
// 여백 넣을거면 p-12 추가
