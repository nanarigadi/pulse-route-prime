import React, { useEffect, useRef, useState } from "react";
import { TrafficMap } from "./TrafficMap";

export function MapSection() {
  return (
    <div className="h-full w-full">
      <TrafficMap />
    </div>
  );
}
