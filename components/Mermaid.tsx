import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidProps {
  chart: string;
}

export const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize mermaid config
    try {
      mermaid.initialize({ 
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        suppressErrorRendering: true, 
      });
    } catch (e) {
      // Ignore re-initialization errors
    }
  }, []);

  useEffect(() => {
    const render = async () => {
      if (containerRef.current && chart) {
        containerRef.current.innerHTML = '';
        setRenderError(null);

        // Sanitize and fix common formatting issues
        let cleanChart = chart
          .replace(/^```mermaid\s*/, '')
          .replace(/^```\s*/, '')
          .replace(/```$/, '')
          .trim();

        // 1. Ensure newline after graph declaration if missing (e.g., "graph TD A[...]" -> "graph TD\nA[...]")
        cleanChart = cleanChart.replace(/^(graph|flowchart)\s+([A-Z]+)\s+([^\n]+)/, '$1 $2\n$3');

        // 2. Fix invalid sequence-diagram style labeling (A --> B : "Label") -> (A -- "Label" --> B)
        // Regex explanation: Match arrow -> capture node ID -> match colon -> capture quoted label
        // Replace with: -- label --> nodeID
        cleanChart = cleanChart.replace(/-->\s*([a-zA-Z0-9_-]+)\s*:\s*"([^"]+)"/g, '-- "$2" --> $1');
        cleanChart = cleanChart.replace(/-->\s*([a-zA-Z0-9_-]+)\s*:\s*([^"\n]+)/g, '-- "$2" --> $1');

        if (!cleanChart) return;

        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const element = document.createElement('div');
        element.id = id;
        element.textContent = cleanChart;
        containerRef.current.appendChild(element);
        
        try {
          // Validate syntax first
          await mermaid.parse(cleanChart);
          
          // Render
          await mermaid.run({
            nodes: [element]
          });
        } catch (err: any) {
          console.error("Mermaid execution error:", err);
          
          let msg = "Diagram render failed.";
          
          if (err instanceof Error) {
            msg = err.message;
          } else if (typeof err === 'string') {
            msg = err;
          } else if (err && typeof err === 'object') {
            // Handle Jison parser errors from Mermaid
            if (err.str) {
               msg = `Syntax Error: ${err.str}`;
            } else if (err.message) {
               msg = err.message;
            } else {
               // Safe fallback for obscure objects
               try {
                 msg = "Syntax Error: " + JSON.stringify(err);
               } catch {
                 msg = "Unknown syntax error occurred.";
               }
            }
          }
          
          setRenderError(msg);
          containerRef.current.innerHTML = ''; // Clear failed output
        }
      }
    };
    
    render();
  }, [chart]);

  return (
    <div className="w-full flex flex-col items-center">
      <div 
        ref={containerRef} 
        className="w-full overflow-x-auto flex justify-center p-4 bg-white rounded-lg border border-slate-200 min-h-[100px]" 
      />
      {renderError && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 w-full font-mono overflow-auto">
          <p className="font-bold mb-1">Diagram Render Error</p>
          <p className="mb-2 whitespace-pre-wrap">{renderError}</p>
          <details>
             <summary className="cursor-pointer opacity-70 hover:opacity-100">View source</summary>
             <pre className="text-xs mt-2 p-2 bg-red-100 rounded overflow-x-auto">{chart}</pre>
          </details>
        </div>
      )}
    </div>
  );
};