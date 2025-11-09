/**
 * Knowledge Graph Component - Static SVG Visualization
 * Location: /components/organisms/KnowledgeGraph.tsx
 * Purpose: Display the exported knowledge graph SVG image
 */

"use client";

import React from "react";

const KnowledgeGraph = ({ showStats = false }: { showStats?: boolean }) => {
  return (
    <div className="w-full max-w-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl overflow-hidden">
      <div className="card shadow-lg border-0 overflow-hidden bg-base-100 w-full">
        <div
          className="text-white p-4"
          style={{ background: "linear-gradient(to right, #FF8C42, #FF7F50)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Old Mutual Knowledge Graph</h2>
              <p className="text-orange-50 text-sm">
                Knowledge graph visualization
              </p>
            </div>
          </div>
        </div>

        <div className="card-body p-0 flex flex-col overflow-hidden w-full">
          {/* Graph Visualization - Static SVG Image */}
          <div
            className="relative bg-base-200 rounded-lg border border-base-300 overflow-hidden w-full"
            style={{ height: "600px", minHeight: "600px" }}
          >
            <div
              className="w-full h-full flex items-center justify-center p-4"
              style={{ width: "100%", height: "100%" }}
            >
              <img
                src="/logos/knowledge-graph.svg"
                alt="Old Mutual Knowledge Graph"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                }}
                onError={(e) => {
                  console.error("SVG failed to load:", e);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { KnowledgeGraph };
