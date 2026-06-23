"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

interface DraggableWidgetProps {
  id: string;
  isCustomizing: boolean;
  children: React.ReactNode;
  onResize?: (delta: number) => void;
  currentSpan?: number;
}

export default function DraggableWidget({ id, isCustomizing, children, onResize, currentSpan }: DraggableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`relative flex h-full flex-col ${isDragging ? 'drop-shadow-2xl' : ''}`}>
      {isCustomizing && (
        <div className="absolute -top-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-primary/30 bg-background/80 p-1 shadow-sm backdrop-blur-md">
          {onResize && (
            <button 
              onClick={(e) => { e.stopPropagation(); onResize(-1); }} 
              disabled={currentSpan === 1}
              className="flex h-6 w-6 items-center justify-center rounded-full text-primary hover:bg-primary/20 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
          )}
          
          <div
            {...attributes}
            {...listeners}
            className="flex h-6 w-10 cursor-grab items-center justify-center rounded-full bg-primary/10 text-primary active:cursor-grabbing hover:bg-primary/20 transition-colors"
          >
            <GripHorizontal className="h-4 w-4" />
          </div>

          {onResize && (
            <button 
              onClick={(e) => { e.stopPropagation(); onResize(1); }} 
              disabled={currentSpan === 3}
              className="flex h-6 w-6 items-center justify-center rounded-full text-primary hover:bg-primary/20 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>
      )}
      <div className={`flex-1 transition-all ${isCustomizing ? 'ring-2 ring-primary/20 rounded-2xl ring-offset-4 ring-offset-background-deep' : ''}`}>
        {children}
      </div>
    </div>
  );
}
