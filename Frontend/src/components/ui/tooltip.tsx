import * as React from "react";
import { View } from "react-native";

const TooltipProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const Tooltip = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const TooltipTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const TooltipContent = () => null;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
